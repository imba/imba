global css html,body w:100% h:100% m:0 p:0
import { defineCustomElement as d23 } from '@ionic/core/components/ion-datetime';
import { initialize } from '@ionic/core/components';
initialize();
d23();

# Core CSS required for Ionic components to work properly */
import '@ionic/core/css/core.css';

# Basic CSS for apps built with Ionic */
import '@ionic/core/css/normalize.css';
import '@ionic/core/css/structure.css';
import '@ionic/core/css/typography.css';

# Optional CSS utils that can be commented out */
import '@ionic/core/css/padding.css';
import '@ionic/core/css/float-elements.css';
import '@ionic/core/css/text-alignment.css';
import '@ionic/core/css/text-transformation.css';
import '@ionic/core/css/flex-utils.css';
import '@ionic/core/css/display.css';

tag my-calendar
	# def mount
	# 	$dt.setValue data
	<self>
		<ion-datetime$dt value=data @ionChange=(data = e.detail.value)>

tag app
	count = 0
	val = "2000-03-{10 + count}T14:18:26+00:00"
	def onClick
		count++
		val = "2000-03-{10 + count}T14:18:26+00:00"

	<self>
		<button#inc @click=onClick> "inc {val}"
		<my-calendar bind=val>
imba.mount <app>
