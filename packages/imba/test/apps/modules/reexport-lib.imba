# Helper module for exports.imba: re-exports in the shapes real apps use.

import {UPPER_CASE, gamma as imported-gamma} from './named-lib.imba'

export {alpha, beta} from './named-lib.imba'
export {add as sum, make-label} from './named-lib.imba'
export {
	revealed
	renamed-fn as again-renamed
} from './named-lib.imba'
export * from './star-lib.imba'
export * as named from './named-lib.imba'
export {default as named-main} from './named-lib.imba'
export {default} from './star-lib.imba'

# re-export bindings that were imported above
export {UPPER_CASE}
export {imported-gamma as gamma-again}

export const own = 'own'
