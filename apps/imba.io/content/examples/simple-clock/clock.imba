import './styles'

tag app-clock
	<self autorender=1fps>
		let ts = Date.now! / 60000 + utc * 60
		<div.location> <slot>
		<div.dial.hour[rotate:{ts / 720}]>
		<div.dial.minute[rotate:{ts / 60}]>
		<div.dial.second[rotate:{ts % 1000}]>
		<div.circle>

document.body.appendChild <div.grid>
	<app-clock[bg:pink2] utc=-5> 'New York'
	<app-clock[bg:purple2] utc=-8> 'San Fran'
	<app-clock[bg:indigo2] utc=0> 'London'
	<app-clock[bg:sky2] utc=9> 'Tokyo'