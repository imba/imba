(function(){
function fn(blk,time){
	return blk(time);
};
describe('Syntax - Blockparam',function (){
	test('specify position',function (){
		var res = fn((function (mult){
			return 10 * mult;
		}),2);
		return eq(res,20);
	});
	return test('specify position using &',function (){
		var res = fn(function (mult){
			return 10 * mult;
		},2);
		return eq(res,20);
	});
});
}())