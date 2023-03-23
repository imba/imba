css div
	bd:blue4 p:4 m:4

tag App
	prop bool = yes
	<self>
		<input type='checkbox' bind=bool>
		<div @touch.self.log('touching')>
			'.self'
			<div> 'inner'

		<div @touch.meta.log('touching')> '.meta'
		<div @touch.pen.log('touching')> '.pen'
		<div @touch.mouse.log('touching')> '.mouse'
		<div @touch.touch.log('touching')> '.touch'

		<div @touch.sel('.test').log('touching')> '.test'
		<div.test @touch.sel('.test').log('touching')>
			'.test'
			<div> 'inner'

		<div @touch.if(bool).log('touching')> 'bool'
		<div @touch.if(!bool).log('touching')> '!bool'

		<div @pointerdown.log('pointerdown')> 'down'
			<div @touch.meta.stop.log('touching')> 'meta stop'

		<div @click.log('clicked')> 'click'
			<div @touch.cancel.log('touching')> 'cancel'

imba.mount <App>