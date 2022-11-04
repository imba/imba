import './shared.imba'
import 'imba/spec'

tag App

	def render
		<self.app[d:hflex ja:center g:10] tabIndex=0>

			<div.flagged.other>
				<div[fw:500 ^.flagged:501] eq={fontWeight:501}>
				<div[fw:500 ^.flagged.other:501] eq={fontWeight:501}>
				<div[fw:500 .other^.flagged:501] eq={fontWeight:500}>
				<div .inner[fw:500 .inner^.flagged:501] eq={fontWeight:501}>
				<div[fw:500 ..flagged:501] eq={fontWeight:501}>
				<div[fw:500 ^^.flagged:501] eq={fontWeight:500}>
				<div[fw:500 .flagged:501] eq={fontWeight:500}>
				<div.flagged[fw:500 .flagged:501] eq={fontWeight:501}>

imba.mount(let app = <App>)

for el in app.querySelectorAll('*') when el.eq
	test do eqcss el, el.eq