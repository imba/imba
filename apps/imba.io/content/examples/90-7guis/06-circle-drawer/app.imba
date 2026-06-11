import 'util/styles'
import { State } from './state.imba'
		
global css html,body w:100% h:100% m:0 p:0 fs:13px
	button@disabled o:0.5 cursor:default

tag circle-drawer

	state = new State()

	css
		.canvas inset:0 bgc:gray1
		.panel pos:absolute p:10px bgc:white rd:lg shadow:lg, 0 0 0 1px black/5
		.inspector b:10px l:10px d:vflex g:5px w:250px
		.toolbar t:10px l:10px d:flex g:10px jc:stretch fs:13px ai:center
			.divider min-width:1px w:1px my:3px bgc:gray3 h:15px

	def render
		<self>
			<div.canvas @click=state.add(e.x, e.y)>
				<Circles
					circles=state.currentView
					selectedIndex=state.selected
					@toggleSelection=state.select(e.detail.index)
					@showInspector=state.showInspector
				>

			<div.panel.toolbar>
				<button @click=state.undo disabled=state.canUndo> "Undo"
				<button @click=state.redo disabled=state.canRedo> "Redo"
				<div.divider>
				<button @click=state.showInspector disabled=(state.selected == null)> "Resize"

			if state.inspector and state.selectedCircle != null
				const {x, y} = state.selectedCircle
				<div.panel.inspector>
					<div> "Adjust diameter of circle at {x}, {y}"
					<div[d:flex ja:center g:10px]>
						<input bind=state.newSize type="range" [w:100%]>
						<button @click=state.hideInspector> "Done"

tag Circles
	circles = []
	selectedIndex = null
	css .circle bgc:gray3 pos:absolute rd:full shadow:0 0 0 1px gray4 x:-50% y:-50%
		&.selected bgc:gray4 shadow:0 0 0 1px gray5
	<self>
		for circle, i in circles
			const selected? = selectedIndex === i
			<div.circle
				.selected=(selected?)
				[size:{circle.size}px l:{circle.x}px t:{circle.y}px]
				@click.stop.emit('toggleSelection', {index: i})
				@contextmenu.if(selected?).stop.prevent.emit('showInspector')
			>


imba.mount <circle-drawer>
