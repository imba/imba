import fs from "fs";
import {
  HmrContext,
  ModuleNode,
  Plugin,
  ResolvedConfig,
  UserConfig,
} from "vite";
import { handleHotUpdate } from "./handle-hot-update";
import { log, logCompilerWarnings } from "./utils/log";
import { CompileData, createCompileImba } from "./utils/compile";
import { buildIdParser, IdParser, ImbaRequest } from "./utils/id";
import {
  buildExtraViteConfig,
  Options,
  patchResolvedViteConfig,
  preResolveOptions,
  ResolvedOptions,
  resolveOptions,
  validateInlineOptions,
} from "./utils/options";
import { VitePluginImbaCache } from "./utils/vite-plugin-imba-cache";

import { ensureWatchedFile, setupWatchers } from "./utils/watch";
import { resolveViaPackageJsonImba } from "./utils/resolve";
import { PartialResolvedId } from "rollup";
import { toRollupError } from "./utils/error";
import { saveImbaMetadata } from "./utils/optimizer";
import { imbaInspector } from "./ui/inspector/plugin";
import svgPlugin from "./svg-plugin.imba";

interface PluginAPI {
  /**
   * must not be modified, should not be used outside of vite-plugin-imba repo
   * @internal
   * @experimental
   */
  options?: ResolvedOptions;
  // TODO expose compile cache here so other utility plugins can use it
}

export function imba(inlineOptions?: Partial<Options>): Plugin[] {
  if (process.env.DEBUG != null) {
    log.setLevel("debug");
  }
  validateInlineOptions(inlineOptions);
  const cache = new VitePluginImbaCache();
  // updated in configResolved hook
  let requestParser: IdParser;
  let options: ResolvedOptions;
  let viteConfig: ResolvedConfig;
  /* eslint-disable no-unused-vars */
  let compileImba: (
    imbaRequest: ImbaRequest,
    code: string,
    options: Partial<ResolvedOptions>,
  ) => Promise<CompileData>;
  /* eslint-enable no-unused-vars */

  let resolvedImbaSSR: Promise<PartialResolvedId | null>;
  const api: PluginAPI = {};
  const plugins: Plugin[] = [];
  plugins.push(svgPlugin());
  plugins.push(
    {
      name: "vite-plugin-imba",
      // make sure our resolver runs before vite internal resolver to resolve imba field correctly
      enforce: "pre",
      api,
      async config(config, configEnv): Promise<Partial<UserConfig>> {
        // setup logger
        if (process.env.DEBUG) {
          log.setLevel("debug");
        } else if (config.logLevel) {
          log.setLevel(config.logLevel);
        }
        // @ts-expect-error temporarily lend the options variable until fixed in configResolved
        options = await preResolveOptions(inlineOptions, config, configEnv);
        // extra vite config
        const extraViteConfig = buildExtraViteConfig(options, config);
        log.debug("additional vite config", extraViteConfig);
        return extraViteConfig;
      },

      async configResolved(config) {
        options = resolveOptions(options, config);
        patchResolvedViteConfig(config, options);
        requestParser = buildIdParser(options);
        compileImba = createCompileImba(options);
        viteConfig = config;
        // TODO deep clone to avoid mutability from outside?
        api.options = options;
        log.debug("resolved options", options);
      },

      async buildStart() {
        if (!options.experimental?.prebundleImbaLibraries) return;
        const isImbaMetadataChanged = await saveImbaMetadata(
          viteConfig.cacheDir,
          options,
        );
        if (isImbaMetadataChanged) {
          // Force Vite to optimize again. Although we mutate the config here, it works because
          // Vite's optimizer runs after `buildStart()`.
          // TODO: verify this works in vite3
          viteConfig.optimizeDeps.force = true;
        }
      },

      configureServer(server) {
        // eslint-disable-next-line no-unused-vars
        options.server = server;
        setupWatchers(options, cache, requestParser);
      },

      load(id, opts) {
        const ssr = !!opts?.ssr;
        const imbaRequest = requestParser(id, !!ssr);
        if (imbaRequest) {
          const { filename, query } = imbaRequest;
          // virtual css module
          if (query.imba && query.type === "style") {
            const css = cache.getCSS(imbaRequest);
            if (css) {
              log.debug(`load returns css for ${filename}`);
              return css;
            }
          }
          // prevent vite asset plugin from loading files as url that should be compiled in transform
          if (viteConfig.assetsInclude(filename)) {
            log.debug(`load returns raw content for ${filename}`);
            return fs.readFileSync(filename, "utf-8");
          }
        }
      },

      async resolveId(importee, importer, opts) {
        const ssr = !!opts?.ssr;
        const imbaRequest = requestParser(importee, ssr);
        if (imbaRequest?.query.imba) {
          if (imbaRequest.query.type === "style") {
            // return cssId with root prefix so postcss pipeline of vite finds the directory correctly
            // see https://github.com/imbajs/vite-plugin-imba/issues/14
            log.debug(
              `resolveId resolved virtual css module ${imbaRequest.cssId}`,
            );
            return imbaRequest.cssId;
          }
          log.debug(`resolveId resolved ${importee}`);
          return importee; // query with imba tag, an id we generated, no need for further analysis
        }

        if (ssr && importee === "imba") {
          if (!resolvedImbaSSR) {
            resolvedImbaSSR = this.resolve("imba/ssr", undefined, {
              skipSelf: true,
            }).then(
              (imbaSSR) => {
                log.debug("resolved imba to imba/ssr");
                return imbaSSR;
              },
              (err) => {
                log.debug(
                  "failed to resolve imba to imba/ssr. Update imba to a version that exports it",
                  err,
                );
                return null; // returning null here leads to imba getting resolved regularly
              },
            );
          }
          return resolvedImbaSSR;
        }
        try {
          const resolved = resolveViaPackageJsonImba(importee, importer, cache);
          if (resolved) {
            log.debug(
              `resolveId resolved ${resolved} via package.json imba field of ${importee}`,
            );
            return resolved;
          }
        } catch (e) {
          log.debug.once(
            `error trying to resolve ${importee} from ${importer} via package.json imba field `,
            e,
          );
          // this error most likely happens due to non-imba related importee/importers so swallow it here
          // in case it really way a imba library, users will notice anyway. (lib not working due to failed resolve)
        }
      },

      async transform(code, id, opts) {
        const ssr = !!opts?.ssr;
        const imbaRequest = requestParser(id, ssr);
        if (!imbaRequest || imbaRequest.query.imba) {
          return;
        }
        let compileData;
        try {
          compileData = await compileImba(imbaRequest, code, options);
        } catch (e) {
          cache.setError(imbaRequest, e);
          throw toRollupError(e, options);
        }
        // debugger
        logCompilerWarnings(
          imbaRequest,
          compileData.compiled.warnings,
          options,
        );
        cache.update(compileData);
        if (compileData.dependencies?.length && options.server) {
          compileData.dependencies.forEach((d) => {
            ensureWatchedFile(options.server!.watcher, d, options.root);
          });
        }
        log.debug(`transform returns compiled js for ${imbaRequest.filename}`);
        return {
          ...compileData.compiled.js,
          meta: {
            vite: {
              lang: compileData.lang,
            },
          },
        };
      },

      handleHotUpdate(
        ctx: HmrContext,
      ): void | Promise<Array<ModuleNode> | void> {
        if (!options.hot || !options.emitCss) {
          return;
        }
        const imbaRequest = requestParser(ctx.file, false, ctx.timestamp);
        if (imbaRequest) {
          try {
            return handleHotUpdate(
              compileImba,
              ctx,
              imbaRequest,
              cache,
              options,
            );
          } catch (e) {
            throw toRollupError(e, options);
          }
        }
      },
    },
  );

  plugins.push(imbaInspector());

  return plugins.filter(Boolean);
}

export { loadImbaConfig } from "./utils/load-imba-config";

export {
  Arrayable,
  CompileOptions,
  CssHashGetter,
  ImbaOptions,
  MarkupPreprocessor,
  ModuleFormat,
  Options,
  PluginOptions,
  Preprocessor,
  PreprocessorGroup,
  Processed,
  Warning,
} from "./utils/options";

export { ImbaWarningsMessage } from "./utils/log";
