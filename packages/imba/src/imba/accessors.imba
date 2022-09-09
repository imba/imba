export def accessor value, target, key, name, slot, context
	if value and value.accessor isa Function
		return value.accessor(target, key, name, slot, context)
	return value
