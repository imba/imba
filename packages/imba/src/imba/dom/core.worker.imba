# DOM is not available in workers
# Should we not include the node based dom?
export def createElement name, parent, flags, text
	return