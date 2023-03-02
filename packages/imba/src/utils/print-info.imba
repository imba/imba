import fs from 'fs'
import cp from 'child_process'
import path from 'path'
import envinfo from 'envinfo'

import log from './logger'

export default def print-info fn=log.info

	try
		fn "Scripts:"
		for own key, val of JSON.parse(cp.execSync 'npm pkg get scripts')
			fn "  {key}: {val}"

	try
		(await envinfo.run
			System: ['OS', 'CPU']
			Binaries: ['Node']
			Browsers: ['Chrome', 'Firefox', 'Safari'],
			npmPackages: '*imba*'
			npmGlobalPackages: '*imba*'
		).split('\n').forEach do fn($1.slice(2)) if $1

	try
		fn "imba realPath: {fs.realpathSync(process.argv[1]).cyan}"
