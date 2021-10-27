# should declarations inside here have same or higher priority
# than styles applied by outer class?
tag A1
	css --num:500
	css fw:var(--num)

test do eqcss <A1>, 500

# than styles applied by outer class?
tag A2
	css $num:500
	css fw:$num

test do eqcss <A2>, 500

imba.mount <div>
	<A1>
	<A2>