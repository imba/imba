export default tag Counter < button
	prop count = 0

	<self @click=count++> `Count is {count}`
