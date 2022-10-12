import path from 'path'
import decamelize from 'decamelize'
import {test} from './test-no-dep.imba'
import {Router} from 'imba'

console.log test, path.resolve("h.imba"), decamelize("testGUILabel"), Router
console.log <div> "test"