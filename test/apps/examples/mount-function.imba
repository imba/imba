let counter = 0

def incr amount
	counter += amount

imba.mount do
	<div :click.{counter++}>
		<span> "Clicked {counter} times!"
		<button :click.stop.{incr(10)}> "Add 10"