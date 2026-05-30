###
Synthetic tag-heavy compile sample.
Designed to stress tag parsing, tag AST traversal, attributes, handlers,
references, nested tag bodies, and generated tag code.
###

tag tag-heavy-board < op-view

	css
		d:vss
		g:10px
		p:16px
		.card p:10px rd:8px bg:#17212d
		.row d:hcb g:8px
		.cell p:6px rd:4px bg:#202d3c

	def select item
		data.selected = item

	def render
		<self>
			<header.card>
				<h1> "Tag heavy"
				<nav.row>
					<button @click=select('overview')> "Overview"
					<button @click=select('activity')> "Activity"
					<button @click=select('settings')> "Settings"
			<main.row>
				<section.card key='alpha'>
					<header.row>
						<h2> "Alpha"
						<button @click=select('alpha')> "Open"
					<div.row>
						<span.cell> "A1"
						<span.cell> "A2"
						<span.cell> "A3"
					<ul>
						<li>
							<strong> "Status"
							<span> "ready"
						<li>
							<strong> "Queue"
							<span> "12"
						<li>
							<strong> "Owner"
							<span> "team-a"
				<section.card key='beta'>
					<header.row>
						<h2> "Beta"
						<button @click=select('beta')> "Open"
					<div.row>
						<span.cell> "B1"
						<span.cell> "B2"
						<span.cell> "B3"
					<ul>
						<li>
							<strong> "Status"
							<span> "busy"
						<li>
							<strong> "Queue"
							<span> "8"
						<li>
							<strong> "Owner"
							<span> "team-b"
				<section.card key='gamma'>
					<header.row>
						<h2> "Gamma"
						<button @click=select('gamma')> "Open"
					<div.row>
						<span.cell> "G1"
						<span.cell> "G2"
						<span.cell> "G3"
					<ul>
						<li>
							<strong> "Status"
							<span> "idle"
						<li>
							<strong> "Queue"
							<span> "3"
						<li>
							<strong> "Owner"
							<span> "team-c"
			<section.card>
				<header.row>
					<h2> "Pipeline"
					<button @click=select('pipeline')> "Inspect"
				<div.row>
					<article.card>
						<header.row>
							<h3> "Parse"
							<span> "ok"
						<p> "Token stream normalized"
						<footer.row>
							<button @click=select('parse-a')> "A"
							<button @click=select('parse-b')> "B"
					<article.card>
						<header.row>
							<h3> "Analyze"
							<span> "ok"
						<p> "Scopes visited"
						<footer.row>
							<button @click=select('analyze-a')> "A"
							<button @click=select('analyze-b')> "B"
					<article.card>
						<header.row>
							<h3> "Emit"
							<span> "ok"
						<p> "JavaScript generated"
						<footer.row>
							<button @click=select('emit-a')> "A"
							<button @click=select('emit-b')> "B"
			<section.card>
				<header.row>
					<h2> "Nested controls"
					<button @click=select('controls')> "Open"
				<div>
					<form>
						<label.row>
							<span> "Name"
							<input name='name' value=data..name>
						<label.row>
							<span> "Mode"
							<select value=data..mode>
								<option value='auto'> "Auto"
								<option value='manual'> "Manual"
								<option value='safe'> "Safe"
						<label.row>
							<span> "Enabled"
							<input type='checkbox' checked=data..enabled>
						<div.row>
							<button type='button' @click=select('save')> "Save"
							<button type='button' @click=select('cancel')> "Cancel"
			<footer.card>
				<div.row>
					<span> "Selected"
					<strong> data..selected or 'none'
				<div.row>
					<button @click=select('one')> "One"
					<button @click=select('two')> "Two"
					<button @click=select('three')> "Three"
					<button @click=select('four')> "Four"
					<button @click=select('five')> "Five"
