import './canvas'
import './pickers'

global css body m:0 p:0 rd:lg bg:yellow1 of:hidden

const strokes = [1,2,3,5,8,12]
const colors = ['#F59E0B','#10B981','#3B82F6','#8B5CF6']
const state = {stroke: 5, color: '#3B82F6'}

tag App
	<self>
		<div[ta:center pt:20 o:0.2 fs:xl]> 'draw here'
		<app-canvas[pos:abs inset:0] state=state>
		<div.tools[pos:abs b:0 w:100% d:hgrid ja:center]>
			<stroke-picker options=strokes bind=state.stroke>
			<color-picker options=colors bind=state.color>

imba.mount <App[pos:abs inset:0]>
# ~rd:lg|16,4.6,-1.8,50,26,4,52,0.8,0/-~ tailwind-like css shorthands
# ~yellow1|16,3.5,-0.8,50,12,10,55,1.3,0/-~ and colors
# ~ta:center|16,6,-1,34,,1,49,5.8,-0.5/-~ inline styles
# ~state.color|16,-2.3,0.8,42,25,44,20,-0.8,1.3/-~ two-way databinding
# ~global css|18,7.3,-0.5,31,12,8,46,7.5,-0.3/18,7,-0.6,31,12,10,43,8.1,0~ built-in css
# ~tag|18,11.8,-0.8,75,24,8,45,7.3,0.5/18,8.8,-0.8,15,22,4,50,7.5,0.8~ native web components