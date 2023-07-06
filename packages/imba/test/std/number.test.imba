test "to" do
	ok 0.to(5), [0, 1, 2, 3, 4, 5]
	ok 1.to(5), [1, 2, 3, 4, 5]
	ok 14.to(22), [14, 15, 16, 17, 18, 19, 20, 21, 22]

test "round" do
	ok 4.5.round!, 5
	ok 4.49.round!, 4

	ok 4.45.round(.1), 4.5
	ok 4.44.round(.1), 4.4

	ok 5.1.round(2.5), 5
	ok 7.round(2.5), 7.5

test "lerp" do
	ok .5.lerp(0,1,0,100), 50
	ok .5.lerp(0,2,0,200), 50
	ok .5.lerp(0,1,0,200), 100
	ok 10.5.lerp(10,11,0,200), 100

test "clamp" do
	ok 5.clamp(0,1), 1
	ok 5.clamp(-1,0), 0

	ok -5.clamp(0,1), 0
	ok -5.clamp(-1,0), -1

	ok 5.clamp(no,1), 1
	ok 5.clamp(-1), 5

	ok -5.clamp(no,1), -5
	ok -5.clamp(-1), -1

	ok 5.clamp(10,20), 10
	ok 5.clamp(-20,-10), -10

	ok -5.clamp(10,20), 10
	ok -5.clamp(-20,-10), -10
