# toggling on and off
tag A
	prop enabled = yes

	def render
		<self @click.off(!enabled)>
		
# custom emit
tag B
	<self @test.log('hello')>
		<div @click.emit-test>

tag C
	prop age = 20

	<self>
		<button @click.if(age > 20).log('drink')> 'drink'
		<button @click.if(age > 16).log('drive')> 'drive'

# custom emit
tag D
	<self>
		<div @click.flag-busy>
		
imba.mount <C>


# custom emit
tag E
	def longHandler
		await new Promise do setTimeout($1,1000)

	<self @click.mod-clicking=longHandler>
		<div>

test do
	let el = <E>
	imba.mount el
	el.click!
	ok document.documentElement.classList.contains("mod-clicking")