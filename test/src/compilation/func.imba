# var obj = {a: 1, "{key}": 2, c: 3}

var x,y = 10,20
x,y = (x+=20,y),x
# eq [x,y],[20,30]
console.log x,y