def buildCircle x, y, size = 30 do {x, y, size}
def cloneObject obj do JSON.parse(JSON.stringify(obj))
def areObjectsEqual a, b do JSON.stringify(a) === JSON.stringify(b)

export class State
	inspector = false
	undoAmount = 0
	selected = null
	history = [[]]

	#newSize = null
	get newSize
		#newSize
	
	set newSize v
		chopHistory() if v !== #newSize and #newSize != null
		#newSize = v

	get selectedCircle
		currentView[selected]

	get currentRawView
		cloneObject(history[history.length - 1 - undoAmount])

	get currentView
		const v = currentRawView
		if selected != null and newSize != null
			v[selected].size = newSize
		return v

	def commitResize
		hideInspector()
		if newSize != null and selected != null
			update do(view)
				view[selected].size = newSize
				return view
		newSize = null
	
	def chopHistory
		# if we are in an undo, remove all future states, this is the new top state
		if undoAmount > 0
			history = history.slice(0, history.length - undoAmount)
			undoAmount = 0

	def update updateFn
		const result = updateFn(cloneObject([...currentView]))
		unless areObjectsEqual(currentRawView, result)
			chopHistory()
			history.push result
	
	def clearLingeringSelection
		if selectedCircle == null
			deselect()

	def showInspector do
		newSize = selectedCircle..size
		inspector = true

	def hideInspector do
		# commitResize()
		inspector = false
	
	def deselect
		selected = null

	def add x, y do
		commitResize()
		deselect()
		update do(view)
			view.push buildCircle(x, y)
			return view

	def select index do
		selected = index
	
	def undo
		if newSize != null
			commitResize()
		undoAmount++
		clearLingeringSelection()

	def redo do
		undoAmount--
	
	get canUndo
		history.length === 0 or undoAmount + 1 === history.length

	get canRedo
		undoAmount === 0