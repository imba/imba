

tag App
	
	def resized e,typ
		log 'resized!!',typ
	
	<self>
		"App"
		<global @resize.throttle(250ms)=resized(e,'throttled')>
		<global @resize.debounce(250ms)=resized(e,'debounced')>

imba.mount <App>