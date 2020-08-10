extern describe, test, ok, eq, it

def fn blk, time
	return blk(time)
	
describe 'Syntax - Blockparam' do
	test 'specify position' do
		var res = fn( (|mult| 10 * mult), 2)
		eq res, 20

	test 'specify position using &' do
		var res = fn(&,2) do |mult| 10 * mult
		eq res, 20


