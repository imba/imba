import type { Language, ProjectContext } from '@volar/language-service';
import type {} from '@volar/typescript';
import { resolveImbaTypings } from './typings';
import { warmImbaCompileCache } from './warmer';

const warmedHosts = new WeakSet<object>();

/**
 * Server-side project setup (A5/A6): make any project imba-capable without
 * requiring tsconfig ceremony — parity with the old plugin's
 * Project.setCompilerOptions patch and typings lib injection, but applied by
 * wrapping the language service host instead of patching tsserver classes.
 */
export function setupImbaProject({ project }: { language: Language; project: ProjectContext }): void {
	const tsHost = project.typescript?.languageServiceHost;
	if (!tsHost) {
		return;
	}

	const projectDir = tsHost.getCurrentDirectory();
	const typings = resolveImbaTypings(projectDir);
	// A7: an inferred project (file outside any tsconfig) has no user-chosen
	// options — the server synthesizes CommonJS-ish defaults that break imba
	// (extensionless ESM imports, bundler resolution). Without a config file
	// the imba-required options are FORCED, not defaulted.
	const inferred = !project.typescript?.configFileName;

	type CompilerOptions = ReturnType<typeof getCompilationSettings>;
	const getCompilationSettings = tsHost.getCompilationSettings.bind(tsHost);
	let cachedFrom: CompilerOptions | undefined;
	let cached: CompilerOptions | undefined;
	tsHost.getCompilationSettings = () => {
		const base = getCompilationSettings();
		if (base !== cachedFrom) {
			cachedFrom = base;
			cached = {
				// parity: constants.imba RequiredCompilerOptions
				...base,
				allowJs: true,
				noEmit: true,
				skipLibCheck: true,
				skipDefaultLibCheck: true,
				allowArbitraryExtensions: true,
				maxNodeModuleJsDepth: base.maxNodeModuleJsDepth ?? 2,
				customConditions: [...new Set([...(base.customConditions ?? []), 'imba'])],
				// defaults only when the PROJECT hasn't chosen
				target: inferred ? 99 : base.target ?? 99, // ESNext
				module: inferred ? 99 : base.module ?? 99, // ESNext
				moduleResolution: inferred ? 100 : base.moduleResolution ?? 100, // Bundler
			};
		}
		return cached!;
	};

	if (typings) {
		const getScriptFileNames = tsHost.getScriptFileNames.bind(tsHost);
		tsHost.getScriptFileNames = () => {
			const names = getScriptFileNames();
			return names.includes(typings) ? names : [...names, typings];
		};
	}

	// G1: warm the compile cache for the project's imba files in the
	// background — Volar's sync createVirtualCode then hits warm entries on
	// first interaction instead of cold-compiling. Delayed so the initially
	// opened files (compiled on demand anyway) win the first second.
	if (!warmedHosts.has(tsHost)) {
		warmedHosts.add(tsHost);
		setTimeout(() => {
			let names: string[] = [];
			try {
				names = tsHost.getScriptFileNames().filter(name => name.endsWith('.imba'));
			} catch {
				return;
			}
			void warmImbaCompileCache(names);
		}, 1000).unref?.();
	}
}
