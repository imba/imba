tag context-page
	<self page="context">
		<t-menu>

tag t-menu
	<self>
		<dropdown>
			<span> "open dropdown"
			<div slot="dropdown">
				<t-comp>

tag t-comp
	<self>
		<span#target> "page: {#context.page}"

tag dropdown
	prop shown? = false
	<self>
		<button type="button" @click=(shown? = true)>
			<slot>
		if shown?
			<teleport to="#dropdown">
				<div[pos:fixed t:0 r:0 l:0 b:0 z:99998 bg:black/20%] @click.stop=(shown? = false)>
					<slot name="dropdown">




