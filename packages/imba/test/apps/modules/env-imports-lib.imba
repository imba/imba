# Helper for syntax/env-flags.imba: imports behind env flags.
# Test pages compile for the browser, so the $node$ / $tsc$ / $worker$ imports
# must be stripped. Their specifiers cannot be resolved in the browser, so
# loading this module fails if any of them is kept. env-flags.imba loads it with
# a dynamic import() so that such a failure shows up as a failing test.

$node$ import nfs from 'node:fs'
$node$ import np from 'node:path'
$node$ import {execFile} from 'node:child_process'
$node$ import * as nos from 'node:os'
$node$ import notes from './missing-notes.md?text'
$node$ import type {ServerOnly} from 'imba-test-types-only'
$node$ import 'node:process'
$nodeish$ import {escape as qs-escape} from 'node:querystring'
$tsc$ import * as typings from 'imba-test-types-only'
$tsc$ import 'imba-test-types-only'
$worker$ import {worker-only} from 'imba-test-worker-only'

$web$ import {alpha} from './named-lib.imba'
$web$ import {
	beta
	gamma
} from './named-lib.imba'
$web$ $js$ import {make-label} from './named-lib.imba'
$web$ import star-default, {star-one} from './star-lib.imba'
$web$ import './side-effect-lib.imba'

# the same local name imported for each platform
$node$ import {readFile as platform-read} from 'node:fs/promises'
$web$ import {add as platform-read} from './named-lib.imba'

export def kept
	{
		alpha: alpha
		beta: beta
		gamma: gamma
		label: make-label('x')
		star-default: star-default
		star-one: star-one
		platform-read: platform-read
	}

export def stripped
	[typeof nfs, typeof np, typeof execFile, typeof nos, typeof notes, typeof qs-escape, typeof typings, typeof worker-only]
