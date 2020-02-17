
import {Router} from '../src'
import {App} from './app'

var router = Router.new()
var app = <App router=router>

# to make sure page does not flash to white
# we wait until the router has finished loading
# until we replace the document with our mounted app
router.onReady do 
	document:body:innerHTML = ''
	Imba.mount app