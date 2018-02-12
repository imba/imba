var list = [1,2,3,4,5]
var state = "hello"

var e = <div .{state}>

var e = <div .{state}>
	<h1> "Hello"
	<h2> title
	<h3> "Yes!"
	for item in list
		<div> item

var e = <div@ok .{state}>
	<h1> "Hello"
	<h2> "Other"
	<h3> "Yes!"
	
var closed = <div .{state} =>
	<h1> "Hello"
	<h2> title
	<h3> "Yes!"
	<ul> for item in list
		<li>
			<span> item
	
var open = <div .{state} ->
	<h1> "Hello"
	<h2> title
	<h3> "Yes!"
	<ul> for item in list
		<li>
			<span> item

var a = <div>
	<ul> for item in list
		<li> item
		
var b = <div ->
	<ul> for item in list
		<li> item

var c = <div .{state}>
	<ul> for item in list
		<li> item
		
var d = <div .{state} =>
	<h1> "Hello"
	<ul> for item in list
		<li> item
	

# should basically be
# div.setTemplate(function(){ cache.. this.setFlag(state).setChildren(...) })

class A
	
	def build
		<div>
			if title
				<something>				