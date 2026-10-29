# Helper for imports.imba: type-only imports must be erased from the JS output.
# The specifier cannot be resolved in the browser, so loading this module fails
# if any of them is kept. imports.imba loads it with a dynamic import() so that
# such a failure shows up as a failing test.

import type {SomeType, OtherType as RenamedType} from 'imba-test-types-only'
import type DefaultType from 'imba-test-types-only'
import type {
	MultiTypeA
	MultiTypeB
} from 'imba-test-types-only'
$web$ import type {WebType} from 'imba-test-types-only'
$node$ import type {NodeType} from 'imba-test-types-only'
import {alpha} from './named-lib.imba'

export let typed-value\WebType = alpha

export def typed-sum a\SomeType, b\RenamedType, c\DefaultType
	a + b + c

export def typed-pair a\MultiTypeA, b\MultiTypeB
	[a, b]

export def typed-node value\NodeType
	value
