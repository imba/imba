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

export const SymbolFlags = {
	None: 0,
	FunctionScopedVariable: 1,
	BlockScopedVariable: 2,
	Property: 4,
	EnumMember: 8,
	Function: 16,
	Class: 32,
	Interface: 64,
	ConstEnum: 128,
	RegularEnum: 256,
	ValueModule: 512,
	NamespaceModule: 1024,
	TypeLiteral: 2048,
	ObjectLiteral: 4096,
	Method: 8192,
	Constructor: 16384,
	GetAccessor: 32768,
	SetAccessor: 65536,
	Signature: 131072,
	TypeParameter: 262144,
	TypeAlias: 524288,
	ExportValue: 1048576,
	Alias: 2097152,
	Prototype: 4194304,
	ExportStar: 8388608,
	Optional: 16777216,
	Transient: 33554432,
	Assignment: 67108864,
	ModuleExports: 134217728,
	Enum: 384,
	Variable: 3,
	Value: 111551,
	Type: 788968,
	Namespace: 1920,
	Module: 1536,
	Accessor: 98304,
	FunctionScopedVariableExcludes: 111550,
	BlockScopedVariableExcludes: 111551,
	ParameterExcludes: 111551,
	PropertyExcludes: 0,
	EnumMemberExcludes: 900095,
	FunctionExcludes: 110991,
	ClassExcludes: 899503,
	InterfaceExcludes: 788872,
	RegularEnumExcludes: 899327,
	ConstEnumExcludes: 899967,
	ValueModuleExcludes: 110735,
	NamespaceModuleExcludes: 0,
	MethodExcludes: 103359,
	GetAccessorExcludes: 46015,
	SetAccessorExcludes: 78783,
	TypeParameterExcludes: 526824,
	TypeAliasExcludes: 788968,
	AliasExcludes: 2097152,
	ModuleMember: 2623475,
	ExportHasLocal: 944,
	BlockScoped: 418,
	PropertyOrAccessor: 98308,
	ClassMember: 106500
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