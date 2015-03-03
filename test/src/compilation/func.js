(function(){
var x, y, $1, $2;
var x = 10, y = 20;
$1=(x += 20,y), $2=x, x = $1, y = $2;
console.log(x,y);
}())