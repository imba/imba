tag my-counter
	count = 0
	<self>
		<button[bg:amber8 c:warm3 p:8] @click=count++> "external {process.env.IMBA_MY_NAME} counter {count}" 

if import.meta.vitest
	it "should be a good counter", do
		imba.mount <my-counter>
		# debugger
		logDOM()
		const counter = screen.getByText("external abdellah counter 0")
		expect(counter).toBeTruthy!
		counter.click!
		waitFor do expect(screen.getByText("external abdellah counter 1")).toBeTruthy!