import {greet} from './main'

tag App
	prop count = 0

	def bump
		count++
		imba.commit!

	<self>
		<button @click.silent=bump> "count is {count}"
		<button @boom.silent=bump> "boom"
		<div @touch.meta=bump> "touchable"
		<div> greet("imba")

setTimeout(&,100) do
	imba.mount <App>
