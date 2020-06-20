
import {%button,%active} from './shared'

# css %button d:block ml:1px mr:1px
	
tag app-item
	css %button ml:2px
	<self> <i%button> 'hello'
	
tag app-root
	css %button mr:2px

	<self>
		<b%button %active=Math.random!> 'hello'
		<app-item>

imba.mount(<app-root>)

test do
	eqcss('app-root b', marginLeft: '1px', marginRight: '2px')
	eqcss('app-item i', marginLeft: '2px', marginRight: '1px')