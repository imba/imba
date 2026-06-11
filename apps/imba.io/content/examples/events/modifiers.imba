imba.mount do <fieldset>
	<button @click.throttle(1s).log('clicked')> 'click me'
	<div> "Not clickable within 1 second of previous invocation."