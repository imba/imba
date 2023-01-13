tag ui-button < button

	<self>
		css ol:none e:400ms rd:6px py:1 px:3 bg:hue2 hue:emerald
			bd:1px solid transparent c:gray8 cursor:default

			@hover
				filter:brightness(1.15)
				bc:cool4

			@.nobg
				bg:transparent c:#site-c bc:#4B4B4B
				@hover bc:warm5

		<slot>
