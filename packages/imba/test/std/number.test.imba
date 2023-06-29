test "to" do
	eq 0.to(5), [0, 1, 2, 3, 4, 5]
	eq 1.to(5), [1, 2, 3, 4, 5]
	eq 14.to(22), [14, 15, 16, 17, 18, 19, 20, 21, 22]

test "round" do
	eq 4.5.round!, 5
	eq 4.49.round!, 4

	eq 4.45.round(.1), 4.5
	eq 4.44.round(.1), 4.4

	eq 5.1.round(2.5), 5
	eq 7.round(2.5), 7.5

test "lerp" do
	eq .5.lerp(0,1,0,100), 50
	eq .5.lerp(0,2,0,200), 50
	eq .5.lerp(0,1,0,200), 100
	eq 10.5.lerp(10,11,0,200), 100
