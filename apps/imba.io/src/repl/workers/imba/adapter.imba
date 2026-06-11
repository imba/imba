import {SemanticTokenTypes,SemanticTokenModifiers,M} from 'imba/program'

export class Adapter
	
	worker
	selector

	constructor defaults, selector, worker
		defaults = defaults
		selector = selector
		worker = worker
		disposables = []
		listener = Object.create(null)
		self

	def dispose
		for item in disposables
			item.dispose!

		for own key,val of listener
			val.dispose!

		disposables = []
		listener = Object.create(null)
		self

	get editor
		global.monaco.editor

export class DiagnosticsAdapter < Adapter
	
	constructor defaults, selector, worker
		super

		var onModelAdd = do(model)
			if model.getModeId! != selector
				return

			addModel(model)

		var onModelRemoved = do(model)
			removeModel(model)

		disposables.push editor.onDidCreateModel(onModelAdd)
		disposables.push editor.onWillDisposeModel(onModelRemoved)

		disposables.push editor.onDidChangeModelLanguage do(event)
			onModelRemoved(event.model)
			onModelAdd(event.model)

		editor.getModels!.forEach(onModelAdd)

	def addModel model
		# console.log "Diagnostics.addModel",model
		var uri = model.uri.toString!

		if listener[uri]
			return

		var handle

		model.IMBA_ADAPTER = self

		var sub = model.onDidChangeContent do(e)
			prevalidate(uri)
			clearTimeout(handle)
			handle = setTimeout(&,200) do validate(uri)

		listener[uri] =
			dispose: do
				clearTimeout(handle)
				sub.dispose!

		validate(uri)

	def removeModel model
		var key = model.uri.toString
		# console.log "removeModel",model,key
		if listener[key]
			listener[key].dispose!
			delete listener[key]

	def locToRange model, loc
		var a = model.getPositionAt(loc[0])
		var b = model.getPositionAt(loc[1])
		return new global.monaco.Range(a.lineNumber,a.column,b.lineNumber,b.column)

	def varToDecoration model,item,loc
		if item isa Array
			loc = [item[0],item[0] + item[1]]
			item = {type: 'variable'}

		return {
			range: locToRange(model,loc)
			options: { inlineClassName: 'variable' }
		}

	def warningToMarker model, item
		if item isa Array
			item = {
				loc: [item[0],item[0] + item[1]]
				message: item[2]
			}

		var marker = locToRange(model, item.loc)
		marker.severity = 3
		marker.message = item.message
		return marker

	def warningToDecoration model, orig
		var range = locToRange(model, orig.loc)
		return {
			range: range
			options: {
				name: 'error'
				linesDecorationsClassName: 'error'
			}
		}
	
	def errorToDecoration model,item,loc
		if item isa Array
			item = {
				loc: [item[0],item[0] + item[1]]
				message: item[2]
			}

		return {
			range: locToRange(model,item.loc)
			options: {
				name: 'error'
				inlineClassName: 'error'
				linesDecorationsClassName: 'error-line'
				marginClassName: 'error'
				glyphMarginHoverMessage: item.message
				hoverMessage: item.message
			}
		}

	def prevalidate uri
		var model = editor.getModel(uri)
		var meta = model.imbaEntities or {}
		if meta.warnings
			# remove error markers immediately
			editor.setModelMarkers(model,selector,[])

		self

	def updateSemanticTokens model, ranges
		let markers = []
		let i = 0
		let l = 1
		let c = 1
		while i < ranges.length
			
			let lo = ranges[i++]
			if lo
				c = 1

			let co = ranges[i++]
			let len = ranges[i++]
			let typ = ranges[i++]
			let mods = ranges[i++]
			let kind = SemanticTokenTypes[typ] + '_ '
			let range = new global.monaco.Range(l + lo,c + co,l + lo,c + co + len)

			if mods & M.Import
				kind += 'import_ '
			if mods & M.Root
				kind += 'root_ '
			if mods & M.Global
				kind += 'global_ '
			if mods & M.Special
				kind += 'special_ '
			
			let decoration = {
				range: range
				options: { inlineClassName: kind }
			}
			markers.push decoration
			l += lo
			c += co

		# console.log 'markers',markers
		# let markers = ranges.map do varToDecoration(model,$1)
		model.varDecorations = model.deltaDecorations(model.varDecorations ||= [],markers)

	def updateDiagnostics model, data
		let errors = data.errors.map do errorToDecoration(model,$1)
		model.errorDecorations = model.deltaDecorations(model.errorDecorations ||= [],errors)

		let markers = data.errors.map do warningToMarker(model,$1)
		editor.setModelMarkers(model,selector,markers)

		if model.$file
			model.$file.hasErrors = data.errors.length > 0

		

	def validate uri
		var model = editor.getModel(uri)
		var worker = await worker(uri)
		var semantics = await worker.getSemanticTokens(uri)
		updateSemanticTokens(model,semantics)
		var meta = await worker.getDiagnostics(uri)
		# console.log "returned from worker?",meta,semantics
		return updateDiagnostics(model,meta)

		var decorations = []
		var markers = []

		model.imbaEntities = meta

		for warn in meta.warnings
			# var loc = locToRange(model, warn:loc)
			decorations.push(warningToDecoration(model,warn))
			markers.push(warningToMarker(model, warn))

		editor.setModelMarkers(model,selector,markers)
		return []