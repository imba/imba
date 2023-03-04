css .box fw:300

# should declarations inside here have same or higher priority
# than styles applied by outer class?
tag A1
	css fw:400

test do eqcss <A1>, 400
test do eqcss <A1.box>, 300 # class names should have higher specificity

tag A2
	# should this apply to the self?
	css &.bold fw:600
	css &.box fw:700

# should
test do eqcss <A2.bold>, 600
test do eqcss <A2.bold.box>, 700

tag A3
	# should this apply to the self?
	css &.bold fw:600

# should
test do eqcss <A3.bold>, 600
