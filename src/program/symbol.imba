import {M,SymbolKind,SemanticTokenTypes} from './types'
import {Converter} from './utils'

export const SymbolFlags = {
	None:                    0,
	ConstVariable:           1 << 0,   # Variable (var) or parameter
	LetVariable:             1 << 1,   # A block-scoped variable (let or const)
	Property:                1 << 2,   # Property or enum member
	EnumMember:              1 << 3,   # Enum member
	Function:                1 << 4,   # Function
	Class:                   1 << 5,   # Class
	LocalComponent:          1 << 6,   # Interface
	GlobalComponent:         1 << 7,   # 
	RegularEnum:             1 << 8,   #  Enum
	ValueModule:             1 << 9,   # Instantiated module - file etc
	Parameter:         1 << 10,  # Uninstantiated module
	TypeLiteral:             1 << 11,  # Type Literal or mapped type
	ObjectLiteral:           1 << 12,  # Object Literal
	Method:                  1 << 13,  # Method
	Constructor:             1 << 14,  # Constructor
	GetAccessor:             1 << 15,  # Get accessor
	SetAccessor:             1 << 16,  # Set accessor
	Signature:               1 << 17,  # Call, construct, or index signature
	TypeParameter:           1 << 18,  # Type parameter
	TypeAlias:               1 << 19,  # Type alias
	ExportValue:             1 << 20,  # Exported value marker (see comment in declareModuleMember in binder)
	Alias:                   1 << 21,  # An alias for another symbol (see comment in isAliasSymbolDeclaration in checker)
	Prototype:               1 << 22,  # Prototype property (no source representation)
	ExportStar:              1 << 23,  # Export * declaration
	Optional:                1 << 24,  # Optional property
	
	# Modifiers
	IsSpecial:        1 << 27
	IsImport:           1 << 28
	IsStatic:           1 << 29
	IsGlobal:           1 << 30
	IsRoot:           1 << 31
	
}

SymbolFlags.Component = SymbolFlags.LocalComponent | SymbolFlags.GlobalComponent
SymbolFlags.Variable = SymbolFlags.LetVariable | SymbolFlags.ConstVariable | SymbolFlags.Parameter
SymbolFlags.Accessor = SymbolFlags.GetAccessor | SymbolFlags.SetAccessor
SymbolFlags.ClassMember = SymbolFlags.Method | SymbolFlags.Accessor | SymbolFlags.Property
SymbolFlags.Scoped = SymbolFlags.Function | SymbolFlags.Variable | SymbolFlags.Class | SymbolFlags.Enum | SymbolFlags.LocalComponent
SymbolFlags.Type = SymbolFlags.Component | SymbolFlags.Class

SymbolFlags.GlobalVar = SymbolFlags.ConstVariable | SymbolFlags.IsGlobal
SymbolFlags.SpecialVar = SymbolFlags.ConstVariable | SymbolFlags.IsSpecial

const Conversions = [
	['entity.name.function',0,SymbolFlags.Function]
	['entity.name.class',0,SymbolFlags.Class]
	['entity.name.def',0,SymbolFlags.Method]
	['entity.name.get',0,SymbolFlags.GetAccessor]
	['entity.name.set',0,SymbolFlags.SetAccessor]
	['field',0,SymbolFlags.Property]
	['decl-let',0,SymbolFlags.LetVariable]
	['decl-var',0,SymbolFlags.LetVariable]
	['decl-param',0,SymbolFlags.Parameter]
	['decl-const',0,SymbolFlags.ConstVariable]
	['decl-import',0,SymbolFlags.ConstVariable | SymbolFlags.IsImport]
]

const ConversionCache = {}

export class Sym

	static def idToFlags type,mods = 0
		if ConversionCache[type] != undefined
			return ConversionCache[type]
		for [strtest,modtest,flags] in Conversions
			if type.indexOf(strtest) >= 0 # and (modtest == 0 or mods & modtest > 0)
				return ConversionCache[type] = flags
		return 0

	prop value
	prop body = null

	def constructor flags, name, node
		flags = flags
		name = name
		node = node

	get static?
		node && node.mods & M.Static

	get variable?
		flags & SymbolFlags.Variable
	
	get member?
		flags & SymbolFlags.ClassMember

	get scoped?
		flags & SymbolFlags.Scoped

	get type?
		flags & SymbolFlags.Type

	get global?
		flags & SymbolFlags.IsGlobal

	get escapedName
		name
	
	def addReference node
		references ||= []
		references.push(node)
		node.symbol = self
		return self

	def dereference tok
		let idx = references.indexOf(tok)
		if idx >= 0
			tok.symbol = null
			references.splice(idx,1)
		return self

	get kind
		if self.variable?
			SymbolKind.Variable
		elif flags & SymbolFlags.Class
			SymbolKind.Class
		elif flags & SymbolFlags.Property
			SymbolKind.Field
		elif flags & SymbolFlags.Method
			if escapedName == 'constructor'
				SymbolKind.Constructor
			else
				SymbolKind.Method
		elif flags & SymbolFlags.Function
			SymbolKind.Function
		else
			SymbolKind.Method
	
	get semanticKind
		if flags & SymbolFlags.Parameter
			'parameter'
		elif variable?
			'variable'
		elif type?
			'type'
		elif flags & SymbolFlags.Function
			'function'
		elif member?
			'member'
		else
			'variable'

	get semanticFlags
		let mods = 0
		if flags & SymbolFlags.ConstVariable
			mods |= M.ReadOnly

		if static?
			mods |= M.Static

		if flags & SymbolFlags.IsImport
			mods |= M.Import

		if flags & SymbolFlags.IsGlobal
			mods |= M.Global

		if flags & SymbolFlags.IsRoot
			mods |= M.Root
		
		if flags & SymbolFlags.IsSpecial
			mods |= M.Special

		return mods


export class SymbolMap