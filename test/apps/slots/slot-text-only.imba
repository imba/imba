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
	ok document.querySelector('.static-text').textContent == '^Labeled'

test 'dynamic text' do
	ok document.querySelector('.dynamic-text').textContent == '^Labeled Hello'

test 'dynamic' do
	ok document.querySelector('.dynamic').textContent == '^Hello'

test 'shallow dynamic' do
	ok document.querySelector('.shallow-dynamic').textContent == 'Hello'
	ok document.querySelector('.shallow-dynamic').firstChild isa Text

test 'multi dynamic' do
	ok document.querySelector('.multi-dynamic').textContent == '^HelloYesHello'