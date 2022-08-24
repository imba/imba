import entry from './client?web'
import worker from './worker?worker&url'

console.log entry, worker
console.log worker.body