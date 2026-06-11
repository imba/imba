import { DiagnosticsAdapter } from './adapter'
import {SemanticTokenTypes,SemanticTokenModifiers} from 'imba/program'

const STOP_WHEN_IDLE_FOR = 2 * 60 * 1000 # 2min

export class WorkerManager

	constructor path, defaults
		path = path
		defaults = defaults
		worker = null
		idleCheckInterval = setInterval(&,30 * 1000) do checkIfIdle!
		lastUsedTime = 0

	def stopWorker
		if worker
			worker.dispose!
			worker = null
		client = null

	def dispose
		clearInterval(idleCheckInterval)
		stopWorker!

	# should be disabled
	def checkIfIdle
		return unless worker
		let elapsed = Date.now! - lastUsedTime
		if elapsed > STOP_WHEN_IDLE_FOR
			stopWorker!

	def getClient
		# console.log "worker getClient!"
		lastUsedTime = Date.now!

		unless client
			worker = global.monaco.editor.createWebWorker(
				moduleId: path
				label: 'imba'
				createData: { defaults: defaults }
			)
			client = worker.getProxy!

		return client

	def getLanguageServiceWorker ...resources
		let client = await getClient!
		worker.withSyncedResources(resources).then do client

export def setupMode modeId
	let url = import('./worker?worker&url')
	console.log 'starting worker at',url
	let client = new WorkerManager(url, {})
	let worker = client.getLanguageServiceWorker.bind(client)
	new DiagnosticsAdapter({}, modeId, worker)