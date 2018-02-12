
tag View
	
	def render
		<self>
			<div.view>
				<label :dblclick='edit'> "{@data:title}"
				<input.toggle type='checkbox' model='completed'>
				<button.destroy :tap='drop'>
			<input@input.edit type='text' :keydown.enter.submit :keydown.esc.cancel>