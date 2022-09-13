import * as util from './util'
import np from 'path'
const userPrefs = {
	includeCompletionsForModuleExports:true
	importModuleSpecifierPreference: "shortest"
	importModuleSpecifierEnding: "minimal"
	includePackageJsonAutoImports:"on"
	includeAutomaticOptionalChainCompletions:false
}
# Array.from(t.autoImports.exportInfoMap.keys()).map(v=>v.split('|')[2]).filter((v,i,s)=>s.indexOf(v)==i)

const builtinMap = {
	fs: {ns: 'fs'}
	
	'fs/promises': {ns: 'fs'}
	child_process: {ns: 'cp'}
	os: {ns: 'os'}
	v8: {ns: 'v8'}
	crypto: {ns: 'crypto'}
	http: {ns: 'http'}
	https: {ns: 'https'}
	http2: {ns: 'http2'}
	net: {ns: 'net'}
	sys: {ns: 'sys'}
}

export default class AutoImportContext
	
	constructor c
		checker = c
		tsc = checker.checker
		script = c.script
		self
		
	get ts
		global.ts
		
	get ils
		global.ils
		
	get ps
		global.ils.ps
		
	get exportInfoMap
		unless ts.codefix.getSymbolToExportInfoMap isa Function or ts.getExportInfoMap isa Function
			return #exportInfoMap ||= new Map()
		
		# @ts-ignore
		return #exportInfoMap if #exportInfoMap
			
		let debugs = ts.Debug.isDebugging
		ts.Debug.isDebugging = true
		if ts.getExportInfoMap
			map = ts.getExportInfoMap(checker.sourceFile,checker.project,checker.program)
		else
			map = ts.codefix.getSymbolToExportInfoMap(checker.sourceFile,checker.project,checker.program)
		ts.Debug.isDebugging = debugs
		#exportInfoMap = map

	def getExportMetaInfo info
		try
			let variable = info.moduleSymbol.valueDeclaration.locals.get('EXPORT_NS')
			if variable
				let starName = variable.valueDeclaration.initializer.text
				if starName
					return {
						exportKind: 3
						exportName: '*'
						important: true
						importName: starName
						modulePath: info.modulePath
						packageName: info.packageName
						symbol: info.moduleSymbol
						commitCharacters: ['.']
						exportedSymbolIsTypeOnly: false
					}
		return null

	
	get exportInfoEntries
		return #exportInfoEntries if #exportInfoEntries
		let t0 = Date.now!

		let map = exportInfoMap
		let t1 = Date.now!
		
		
		let groups = {}
		let out = #exportInfoEntries = []
		
		try
			if map.releaseSymbols isa Function
				let nr = 0
				let action = do(info,name,isAmbient)
					# continue if ns.match(/^imba_/)
					info = info[0] if info isa Array
					return if isAmbient and !builtinMap[info.moduleName]
					let path = getResolvePathForExportInfo(info) or info.moduleName
					# util.log("got",nr++,name,path,info.moduleName,info)
					return if util.isImbaDts(path)
					info.modulePath = path
					info.packageName = getPackageNameForPath(path)
					# info.#key = key
					info.exportName = name

					if util.isTagIdentifier(name) or util.isClassExtension(name)
						return
					
					let gid = info.packageName or info.modulePath
					let group = groups[gid] ||= {
						symbol: info.moduleSymbol
						modulePath: gid,
						name: util.pathToImportName(gid)
						exports: []
					}

					if group.exports.length == 0
						if let meta = getExportMetaInfo(info)
							group.exportStar = meta
							# out.push(meta)
							return

					if group.exportStar
						return

					

					
					group.exports.push(info)
					
					if info.exportKind == 2 or info.exportKind == 1
						group.default = info
						
					if group.exports.length == 2
						# now we are ready to add a shared export for this whole file
						let ginfo = {
							exportKind: 3
							exportName: '*'
							importName: group.name
							modulePath: info.modulePath
							packageName: info.packageName
							symbol: info.moduleSymbol
							exportedSymbolIsTypeOnly: false
						}
						out.push(ginfo)
					
					let isTag = try info.symbol.exports..has('$$TAG$$')
					info.isTag = isTag
					
					info.isDecorator = name and name[0] == 'α'

					out.push(info)
					
					if info.exportKind == 2
						info.exportName = util.pathToImportName(info.packageName or info.modulePath)

				let matcher = do yes

				map.search(checker.sourceFile.path,false,matcher,action)
			else
				map = map.__cache or map

				for [key,[info]] of map
					let [name,ref,ns] = key.split('|')
					# continue if ns.match(/^imba_/)	
					continue if ns[0] != '/' and !builtinMap[ns]
					let path = getResolvePathForExportInfo(info) or ns
					continue if util.isImbaDts(path)

					if util.isTagIdentifier(name) or util.isClassExtension(name)
						continue

					info.modulePath = path
					info.packageName = getPackageNameForPath(path)
					info.#key = key
					info.exportName = name
					
					let gid = info.packageName or info.modulePath
					let group = groups[gid] ||= {
						symbol: info.moduleSymbol
						modulePath: gid,
						name: util.pathToImportName(gid)
						exports: []
					}

					if group.exports.length == 0
						if let meta = getExportMetaInfo(info)
							group.exportStar = meta
							# out.push(meta)
							return

					group.exports.push(info)
					info.#group = group
					
					if info.exportKind == 2 or info.exportKind == 1
						group.default = info
						
					if group.exports.length == 2
						# now we are ready to add a shared export for this whole file
						let ginfo = {
							exportKind: 3
							exportName: '*'
							importName: group.name
							modulePath: info.modulePath
							packageName: info.packageName
							symbol: info.moduleSymbol
							exportedSymbolIsTypeOnly: false
						}
						group.#entry = ginfo
						ginfo.#group = group
						out.push(ginfo)
					
					let isTag = try info.symbol.exports..has('$$TAG$$')
					info.isTag = isTag
					out.push(info)

					if info.exportKind == 2
						info.exportName = util.pathToImportName(info.packageName or info.modulePath)

		catch e
			util.log "error in exportInfoEntries",e
		util.log "exportInfoEntries in {Date.now! - t0}ms {Date.now! - t1}ms"
		return out
		
	get exportPaths
		let packages = getVisiblePackages!
		let entries = exportInfoEntries
		
		let map = {}

		for entry in entries
			continue if entry.packageName and !packages[entry.packageName]
			let src = entry.packageName or entry.modulePath
			let source = map[src] ||= {
				modulePath: src,
				name: entry.packageName or np.basename(src).replace(/\.(d\.ts|tsx?|imba|jsx?)$/)
				exports: []
			}
			source.exports.push(entry)
			if entry.exportKind == 2 or entry.exportKind == 1
				source.default = entry
		
		let items = Object.values(map)
		items.#map = map
		return items
		
	def getExportedValues
		let entries = exportInfoEntries.filter do !$1.exportedSymbolIsTypeOnly and !$1.isTypeOnly

	def getVisibleExportedValues
		let entries = getExportedValues!
		let packages = getVisiblePackages!

		entries = entries.filter do(entry)
			!entry.packageName or packages[entry.packageName]
			
	def getExportedDecorators
		exportInfoEntries.filter do $1.isDecorator
		
	def getExportedTypes
		exportInfoEntries.filter do
			$1.exportedSymbolIsTypeOnly or $1.isTypeOnly or ($1.symbol.flags & ts.SymbolFlags.Type)
	
	def getExportedTags
		exportInfoEntries.filter do $1.isTag
			
	def getPackageNameForPath path
		let m
		if m = path.match(/\@types\/((?:\@\w+\/)?[\w\.\-]+)\/index\.d\.ts/)
			return m[1]
			
		if m = path.match(/\/node_modules\/((?:\@\w+\/)?[\w\.\-]+)\//)
			return m[1]
		
		# @ts-ignore
		if !ts.pathIsAbsolute(path)
			return path
					
		return null
		
	def getPackageJsonsVisibleToFile
		ps.getPackageJsonsVisibleToFile(script.fileName)
	
	def getVisiblePackages
		let jsons = getPackageJsonsVisibleToFile(script.fileName)
		let packages = {}
		while let pkg = jsons.pop!
			let deps = Object.fromEntries(pkg.dependencies or new Map)
			let devDeps = Object.fromEntries(pkg.devDependencies or new Map)
			Object.assign(packages,deps,devDeps)
		return packages
		
	def getResolvePathForExportInfo info
		if let ms = info.moduleSymbol
			let path = ms.valueDeclaration..fileName
			path ||= util.unquote(ms.escapedName or '')
			return path
		return null
