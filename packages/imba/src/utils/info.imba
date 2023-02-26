import fs from 'fs'
import path from 'path'
import log from './logger'
import {resolvePackage} from '../bundler/utils'

export default def info fn=log.info

	fn ""
	fn "node version: {process.version.slice(1)}"
	fn "node path: {process.argv[0]}"
	fn "node realpath: {fs.realpathSync(process.argv[0])}"

	fn ""
	fn "imba version: {(resolvePackage(path.resolve(__dirname,'..')) or {}).version}"
	fn "imba path: {process.argv[1]}"
	fn "imba realpath: {fs.realpathSync(process.argv[1]).green}"
