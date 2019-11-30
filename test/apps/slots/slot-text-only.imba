var name = "Hello"

tag deep-item
	def render
		<self>
			<span> '^'
			<input type='checkbox'>
			<slot>

tag shallow-item

tag app-root
	def render
		<self>
			<div> "This is the app"
			<deep-item.static-text> 'Labeled'
			<deep-item.dynamic-text> "Labeled {name}"
			<deep-item.dynamic> name
			<shallow-item.shallow-dynamic> name
			<deep-item.multi-dynamic>
				name
				<div> 'Yes'
				name
			# <checkbox-field.checkbox>
			# 	name
			# 	name
			# 	<div>

imba.mount <app-root>

test 'static text' do
	ok $(.static-text).textContent == '^Labeled'

test 'dynamic text' do
	ok $(.dynamic-text).textContent == '^Labeled Hello'

test 'dynamic' do
	ok $(.dynamic).textContent == '^Hello'

test 'shallow dynamic' do
	ok $(.shallow-dynamic).textContent == 'Hello'
	ok $(.shallow-dynamic).firstChild isa Text

test 'multi dynamic' do
	ok $(.multi-dynamic).textContent == '^HelloYesHello'