export * from './decorators.imba'

# Decorators for Cucumber support
# I've put them here because the compiler
# imports global @decorators from imba if not defined/imported in the same file
# I would have put them in a vitest setup file otherwise
export def @given target, name, descriptor
	Steps.add(this[0], name, target)
	descriptor

export def @when target, name, descriptor
	Steps.add(this[0], name, target)
	descriptor
	
export def @then target, name, descriptor
	Steps.add(this[0], name, target)
	descriptor

