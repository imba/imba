# [preview=lg]
import {Box} from 'controls'
# ---
tag App
	<self>	
		<Box @intersect.out.log('outside of viewport')> 'drag'
		<Box @intersect(self).out.log('outside of App')> 'drag'
		<Box @intersect(self,0.5).out.log('halfway')> 'drag'
		<Box @intersect(self,1).out.log('covered')> 'drag'
# ---
imba.mount <App.frame>