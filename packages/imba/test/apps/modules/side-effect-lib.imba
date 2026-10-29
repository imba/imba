# Helper module imported only for its side effects (by imports.imba and
# syntax/env-flags.imba). Records every evaluation on globalThis.

globalThis.IMBA_TEST_SIDE_EFFECTS ||= []
globalThis.IMBA_TEST_SIDE_EFFECTS.push('side-effect-lib')

export const marker = 'side'
