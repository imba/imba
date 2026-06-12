import type { Language, ProjectContext } from '@volar/language-service';
import type {} from '@volar/typescript';
import { resolveImbaTypings } from './typings';

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
				// defaults only when the project hasn't chosen
				target: base.target ?? 99, // ESNext
				module: base.module ?? 99, // ESNext
				moduleResolution: base.moduleResolution ?? 100, // Bundler
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
}
