import MyWebWorker from './worker?worker'
let worker = new MyWebWorker()

import MySharedWorker from './worker?sharedworker'
# let shared = new MySharedWorker()

import MyWebWorkerUrl from './worker?worker&url'
# console.log "url for worker",MyWebWorkerUrl

global css @root bg:blue1
