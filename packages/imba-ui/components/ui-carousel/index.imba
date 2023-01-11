import * as MATERIAL from 'imba-material-icons'

tag ui-carousel

	data = []
	index = 0

	def right
		index++
		if index >= data.length
			index = 0

	def left
		index--
		if index < 0
			index = data.length - 1

	def end
		imba.unmount(self)

	<self
		@hotkey('esc')=end
		@hotkey('left')=left
		@hotkey('right')=right
		ease
	>
		css us:none

		<%bg@click=end>
			css zi:9999 h:100vh e:300ms bg:black/75 pos:fixed inset:0 d:vflex
				@off o:0

			<%top>
				css d:hflex jc:space-evenly ai:center fl:1 h:90vh
					> d:box fl:1 h:100vh
					%left, %right w:10vw d:hcc e:200ms bg@hover:white/5
					svg w:20 h:auto c:cool3

				if data.length > 1
					<%left@click.trap=left>
						<svg src=MATERIAL.ARROW_LEFT>

				<%middle>
					css miw:80vw w:80vh d:vflex

					<%top>
						css h:90vh d:hcc
						<img src=data[index]>
							css rd:5 maw:90% mah:90%

					if data.length > 1
						<%bottom>
							css h:10vh w:100% fs:70px c:white d:hcc g:2
							for url, i in data
								<img src=url @click.trap=(index = i)>
									css height:80% rd:3 w:32 object-fit:cover e:400ms
										bd:2px solid transparent
										@hover bc:blue2
									if index is i
										css bc:blue2

				if data.length > 1
					<%right@click.trap=right>
						<svg src=MATERIAL.ARROW_RIGHT>
