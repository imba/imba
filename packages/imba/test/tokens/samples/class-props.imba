class State
	@watch prop timeline

	def timelineDidSet newValue, oldValue
		oldValue..deactivate!
		newValue..activate!
		dirty!


class State
	set timeline value
		if value != #timeline
			#timeline..deactivate!
			#timline = value
			value..activate!
	
	get timeline
		#timeline

class State
	let timeline
		watch
			oldValue..deactivate!
			newValue..activate!
