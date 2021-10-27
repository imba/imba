import cp from 'child_process'
import {version} from '../package.json'

const cmd = "npm dist-tag add imba@{version} latest"

cp.execSync(cmd)