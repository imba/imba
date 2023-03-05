import {screen, waitFor} from "@testing-library/dom"

export default tag Counter < button
	prop count = 0
	<self @click=count++> `Count is {count}`

if import.meta.vitest
	it "should be a good counter", do
		imba.mount <Counter>
		const counter = screen.getByText("Count is 0")
		expect(counter).toBeTruthy!
		counter.click!
		waitFor do expect(screen.getByText("Count is 1")).toBeTruthy!

