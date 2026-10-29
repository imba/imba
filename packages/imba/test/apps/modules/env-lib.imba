# Helper module for exports.imba: export declarations behind env flags.
# Test pages compile for the browser, so the $node$ ones must be stripped.
# A kept `from 'node:fs'` would make this module fail to load in the browser.

export const shared = 'shared'

const web-value = 'web'
const node-value = 'node'

$web$ export {web-value}
$node$ export {node-value}
$web$ export {alpha as web-alpha} from './named-lib.imba'
$node$ export {beta as node-beta} from './named-lib.imba'
$web$ export * as web-star from './star-lib.imba'
$node$ export * as node-fs from 'node:fs'
$node$ export * from 'node:fs'
