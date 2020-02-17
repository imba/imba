
export const ROUTES = {};

export default class Location {
	
	static parse(url,router){
		if (url instanceof Location) {
			return url;
		};
		return new this(url,router);
	}
	
	constructor(url,router){
		this.router = router;
		this.parse(url);
	}
	
	parse(url){
		console.log('parsing',url);
		if (!((url instanceof URL))) { url = new URL(url,this.router.origin) };
		this.url = url;
		return this;
	}
	
	// should definitely add match here
	
	search(){
		let str = this.searchParams ? this.searchParams.toString() : '';
		return str ? (('?' + str)) : '';
	}
	
	update(value){
		console.log('updating location',value);
		if (value instanceof Object) {
			for (let v, i = 0, keys = Object.keys(value), l = keys.length, k; i < l; i++){
				k = keys[i];v = value[k];this.query(k,v);
			};
		} else if ((typeof value=='string'||value instanceof String)) {
			this.parse(value);
		};
		return this;
	}
	
	query(name,value){
		let q = this.searchParams();
		if (value === undefined) { return q.get(name) };
		return (value == null || value == '') ? q.delete(name) : q.set(name,value);
	}
	
	clone(){
		return new Location(this.url.href,this.router);
	}
	
	equals(other){
		return this.toString() == String(other);
	}
	
	get href(){
		return this.url.href;
	}
	
	get path(){
		return this.url.href.slice(this.url.origin.length);
	}
	
	get pathname(){
		return this.url.pathname;
	}
	
	toString(){
		return this.href;
	}
	
	match(str){
		let route = ROUTES[str] || (ROUTES[str] = new Route(null,str));
		return route.test(this);
	}
};
