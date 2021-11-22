let a = "a"
let fn = do(val) val

test do	
	let el = <div> a
		<span> "b"
	eq el.textContent, "ab"

test do
	let el = <div> fn a
		<span> "b"
	eq el.textContent, "ab"

test do
	let el = <div> fn a
		fn
			a
		<span> "b"
	eq el.textContent, "aab"
