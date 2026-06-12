export { compileImba, type ImbaCompilation } from './compiler';
export { spansToMappings, EXACT_FEATURES, CONTAINER_FEATURES } from './mappings';
export { ImbaVirtualCode } from './virtualCode';
export { createImbaLanguagePlugin, isImbaScriptId, type ScriptIdLike } from './languagePlugin';
export { createImbaDiagnosticsPlugin } from './plugins/imbaDiagnostics';
export { createTypeScriptServices } from './plugins/typescriptServices';
export { filterTsDiagnostic } from './plugins/tsDiagnosticRules';
export { toImbaIdentifier, toImbaString } from './conversion';
