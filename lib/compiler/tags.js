/*

__ top-level cache for this and parent nodes
_n the outer tag at level n -- 

*/


var a = new Map();
var o = {};
var b = {};


a.set(o,"test");
a.get(o);

a.set(b,"tast");

a[o] = "test"; // a["[Object object]"] = "test"
a[b] = "tast";
a[o]; // tast a["[Object object]"]

