import 'util/styles'
# https://github.com/eugenkiss/7guis/wiki#timer

tag app-timer

	duration = 5000
	step = 50
	
	elapsed = 0

	css progress
		w:8rem h:0.6rem rd:md
		&::-webkit-progress-bar bg:gray2 rd:md
		&::-webkit-progress-value bg:blue4 rd:md
	
	get elapsedTime do (elapsed / 1000).toFixed(1)
	get durationInSeconds do (duration/1000).toFixed(1)
	
	def runTimer
		#interval = setInterval(&, step) do
			elapsed = elapsed >= duration ? 0 : elapsed + step
			imba.commit!
	
	def stopTimer do #interval && clearInterval(#interval)
	def resetTimer do elapsed = 0
	
	def mount do runTimer!
	def unmount do stopTimer!

	css section d:hflex cg:4 ai:center mb:4
	css footer d:hflex cg:2
	
	def render
		<self>

			<section>
				<span> "Elapsed time"
				<progress value=(elapsed / duration)>
			
			<section> "{elapsedTime}s"
			
			<section>
				<span> "Duration {durationInSeconds}s"
				<input type="range" min="1000" max="10000" bind=duration>
			
			<footer>
				<button @click=resetTimer!> "Reset"

imba.mount <app-timer>