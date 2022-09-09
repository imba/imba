export const TokenModifier = {
	declaration: 0
	static: 1
	async: 2
	readonly: 3
	defaultLibrary: 4
	local: 5
	_: 6
}

export const ImbaExtension = '.imba'

export const TokenType = {
	"class": 0
	"enum": 1
	"interface": 2
	"namespace": 3
	"typeParameter": 4
	"type": 5
	"parameter": 6
	"variable": 7
	"enumMember": 8
	"property": 9
	"function": 10
	"member": 11
	"_": 12
}

export const Extensions = [
	'.imba',
	'.svg',
	'.png',
	'.jpg',
	'.css',
	'.jpeg',
	'.gif',
	'.apng',
	'.webp',
	'.avif'
]


export const DefaultConfig = {
	include: ['**/*.imba','**/*']
	exclude: ['node_modules/**/*','node_modules/**/*.imba','dist/**/*']
	compilerOptions: {
		allowJs: true
		checkJs: true
		noEmit: true
		# emitDeclarationOnly: true
		skipLibCheck: true
		skipDefaultLibCheck: true
		allowUnreachableCode: true
		allowSyntheticDefaultImports: true
		allowUmdGlobalAccess: false
		esModuleInterop: true
		suppressExcessPropertyErrors: false
		suppressImplicitAnyIndexErrors: false
		declaration: false
		strict: false
		resolveJsonModule: true
		noResolve: false
		module: 'esnext'
		target: 'esnext'
		newLine: 'lf'
		moduleResolution: "node"
	}
}
###
const tsServiceOptions\CompilerOptions = {
	allowJs: true
	checkJs: true
	noEmit: true
	skipLibCheck: true
	skipDefaultLibCheck: true
	allowUmdGlobalAccess: true
	allowNonTsExtensions: true
	allowUnreachableCode: true
	allowUnusedLabels: true
	strictNullChecks: false
	noImplicitUseStrict: true
	noStrictGenericChecks: true
	allowSyntheticDefaultImports: true
	assumeChangesOnlyAffectDirectDependencies: false
	suppressExcessPropertyErrors: true
	suppressImplicitAnyIndexErrors: true
	traceResolution: false
	resolveJsonModule: true
	maxNodeModuleJsDepth:2
	incremental: true
	target: ts.ScriptTarget.ES2020
	module: ts.ModuleKind.ESNext
	forceConsistentCasingInFileNames: true
	moduleResolution: ts.ModuleResolutionKind.NodeJs
}
###