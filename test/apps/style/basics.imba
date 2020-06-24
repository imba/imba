tag Button
	css &
		fw:500

tag App
	<self> <Button[fw:600].btn>


test do eqcss <App>, 600, '.btn'