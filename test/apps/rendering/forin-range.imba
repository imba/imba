tag App
	<self>
		<div> for num in [2 ... 5]
			<div.item> num
		<div> for num in [2,3,4]
			<div.item> num

test "remove from end" do
	let app = <App>
	