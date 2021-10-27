let count = 0

imba.mount do
	<div>
		<input.num-input type='number' bind=count>
		<button @click=(count++)> 'count'

test do
	ok document.querySelector('.num-input').value === '0'