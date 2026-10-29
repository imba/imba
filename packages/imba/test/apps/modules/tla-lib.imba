# Helper for dynamic-import.imba: a module that awaits a dynamic import at the
# top level. Test pages themselves cannot use top-level await, since the test
# harness starts running before an async page module has finished evaluating.

export const star = await import('./star-lib.imba')
export const star-default = (await import('./star-lib.imba')).default
