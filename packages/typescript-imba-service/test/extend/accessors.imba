class Field
	static stuff = yes
	required = no
	lazy = no
	stuff = yes

	def $set value,target,name,key
		target[key] = value

	def $get target,key,name
		target[key]

class @test < Field
	static stuff = yes
	required = no

	lazy = no

	stuff = yes

	name = ''


class Hello
	
	prop something @test

	def @num val = 0
		new Field

	title @num.lazy.required
	description @test.required.name('hello').stuff
	score as @num(100).required
	other as @num.lazy.required.stuff

	def ping
		yes

tag app

	<self>
		<%title @click.meta.cooldown(200ms).trap=log('1232')>
		<section%main>
			<ul%list>

css .tab
	c:hue5

# %tab
#	c:hue4 c@hover:white
#	%icon h:16px w:auto mx:0.5 scale^@hover:1.15 c^@hover:hue5