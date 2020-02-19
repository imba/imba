require '../lib/index'
var api = require './api'

tag Customer < section
	prop list
	prop orders
	
	def load params, next
		data = null

		for item in list
			if item:id == params:id
				break data = item
		
		orders = await api.rpc("/customers/{params:id}/orders.json")
		return data ? 200 : 404

	def render
		unless data
			return <self> "Loading!"

		<self>
			<h2> data:name

			<div.details>
				<a route-to='info'> 'Info'
				<a route-to='orders'> 'Orders'
				# <div> "Has {orders.len} orders"

			<div route='info'>	
				<h2> data:name
				<input[data:name] type='text'>

			<div route='orders' =>
				<h2> "Orders"
				<ul> for order in orders
					<li route-to="/orders/{order:id}"> "Order #{order:id}"

tag Page

tag Customers < Page
	
	prop query
	
	def load params
		data = await api.rpc('/customers.json')
		return 200
		
	def filtered
		!query ? data : data.filter do |item|
			item:name.indexOf(query) >= 0
	
	def render
		<self>
			<nav>
				<button> "add customer"

			<aside>
				<input[query] type='text'>
				<ul.entries>
					for item in filtered
						<li.entry route-to.sticky=item:id ->
							<span.name> item:name
					<li.entry route-to="14" ->
						<span.name> "Unknown"

			<Customer.main route=':id' list=data>

tag Order
	prop list

	def render
		<self>
			<section>
				"Order "

tag Orders < Page

	def load params, next
		data = await api.rpc('/orders.json')
		return 200

	def render
		<self>
			<nav> <button> "new order"
			<aside>
				<ul.entries> for item in data
					<li.entry.order route.link=item:id>
						<span.name> "Order #" + item:id
			<Order.main route=':id' list=data>

tag Nested
	
	def ontap
		log 'Nested.ontap?!?'
		router.go('/customers')
		
	def testing
		log 'testing'
		self

	def render
		<self>
			<div :tap.testing> "Button?"
			<span> "To customers"
			<a route-to='/about'> "To about"
			<div route-to="/orders">
				<div> "To orders"
				<div :tap.prevent.stop> "Cancel click before route-to"
				<a route-to='/about'> "To about"
				
tag Home
	def render
		<self>
			<section> "Welcome"
			<Nested>
			
	
tag About < Page
	def render
		<self>
			<nav>
				<a route-to='team'> 'Team'
				<a route-to='contact'> 'Contact'
				
			<section route='team'> "About us"
			<section route='contact'> "Contact us"
				
	
export tag App
	def render
		<self>
			<nav.main>
				<a route-to='/'> 'Home'
				<a route-to.sticky='/customers'> 'Customers'
				<a route-to.sticky='/orders'> 'Orders'
				<a route-to.sticky='/about'> 'About'
			
			<Home route.exact='/'>
			<Customers route='/customers'>
			<Orders route='/orders'>
			<About route='/about'>
