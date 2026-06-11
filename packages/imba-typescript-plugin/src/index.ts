import { createLanguageServicePlugin } from '@volar/typescript/lib/quickstart/createLanguageServicePlugin';
import { createImbaLanguagePlugin } from 'imba-language-core';

/**
 * tsserver plugin: makes plain TypeScript/JavaScript projects aware of .imba
 * files (module resolution, cross-file types, rename, auto-import) by
 * registering the imba language plugin through Volar — no tsserver internals
 * are patched.
 */
const plugin = createLanguageServicePlugin(() => ({
	languagePlugins: [createImbaLanguagePlugin<string>()],
}));

export = plugin;
