import 'util/styles'
# https://github.com/eugenkiss/7guis/wiki#crud

let people = [
	{ first: "Hans", last: "Emil" }
	{ first: "Max", last: "Mustermann" }
	{ first: "Roman", last: "Tisch" }
]

tag app-crud

	index = 0 @set
		first = selected..first || ""
		last = selected..last || ""
		query = ""
	
	query = ""
	first = people[0].first
	last = people[0].last

	get selected do people[index]
	
	get filteredPeople
		people.filter do(p) p.last.toLowerCase!.startsWith(query.toLowerCase!)

	def createPerson
		people = people.concat({ first, last })
		index = people.length - 1
	
	def updatePerson
		people[index] = { first, last }
	
	def deletePerson
		people = people.filter do(p, i) i != index
		index = people.length ? people.length - 1 : 0
	
	css .container d:block max-width:60rem m:6rem auto
	css .button-group d:hflex cg:2 mt:2
	css button px:2 py:1 bg:gray2 bd:gray3 rd:sm cursor:pointer cursor@disabled:not-allowed bg@hover:gray3
	
	def render

		<self.container>

			<input[d:block mb:2] placeholder="Filter prefix" bind=query>
			
			<div[d:hflex ai:flex-start cg:2]>
			
				<select[w:10rem] size=5 bind=index>  for person, i in filteredPeople
					<option value=i.toString!> "{person.last}, {person.first}"

				<div[d:inline-flex fld:column g:2]>
					<input placeholder="First name" bind=first>
					<input placeholder="First name" bind=last>
			
			<div.button-group>
				<button disabled=(!first || !last) @click=createPerson> "Create"
				<button disabled=(!first || !last) @click=updatePerson> "Update"
				<button disabled=!people.length @click=deletePerson> "Delete"

imba.mount <app-crud>