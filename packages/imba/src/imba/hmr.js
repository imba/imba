function iter$__(a){ let v; return a ? ((v=a.toIterable) ? v.call(a) : a) : a; };
var $1 = Symbol();

class DevTools {
	
	constructor(){
		
		this.start();
		this.debug = false;
		this;
	}
	
	log(...params){
		
		// return unless debug
		return console.log(...params);
	}
	
	refresh(manifest){
		
		this.manifest = manifest;
		
		let dirty = {
			css: [],
			js: []
		};
		
		let urls = Object.values(manifest).map(function(_0) { return _0.url; }).filter(function(_0) { return _0; });
		let regex = /\.[A-Z\d]{8}\./;
		
		for (let sheet of iter$__(globalThis.document.styleSheets)){
			
			let url = sheet.ownerNode.getAttribute('href') || '';
			let match = urls.find(function(_0) { return _0 && _0.replace(regex,'') == url.replace(regex,''); });
			if (match && url != match) {
				
				sheet.ownerNode.href = match;
			};
		};
		
		let scripts = Object.keys(globalThis.IMBA_LOADED || {});
		
		for (let $2 = 0, $3 = iter$__(scripts), $4 = $3.length; $2 < $4; $2++) {
			let url = $3[$2];
			let match = urls.find(function(_0) { return _0 && _0.replace(regex,'') == url.replace(regex,''); });
			if (match && url != match && urls.indexOf(url) == -1) {
				
				dirty.js.push([url,match]);
			};
		};
		if (dirty.js.length) {
			
			globalThis.document.location.reload();
		};
		return this;
	}
	
	start(){
		var self = this;
		
		if (this.socket) { return };
		
		this.socket = new EventSource("/__hmr__");
		this.socket.onmessage = function(e) {
			
			return self.log('sse.onmessage',e);
		};
		
		this.socket.addEventListener("paused",function(e) {
			
			self.log("server paused");
			return true;
		});
		
		this.socket.addEventListener("resumed",function(e) {
			
			self.log("server resumed");
			return true;
		});
		
		this.socket.addEventListener("reloaded",function(e) {
			
			self.log("server reloaded");
			setTimeout(function() {
				
				self.socket.close();
				self.socket = null;
				return self.start();
			},200);
			return true;
		});
		
		this.socket.addEventListener("rebuild",function(e) {
			
			let manifest = JSON.parse(e.data);
			return self.refresh(manifest);
		});
		
		this.socket.addEventListener("init",function(e) {
			
			let manifest = JSON.parse(e.data);
			return self.refresh(manifest);
		});
		
		this.socket.addEventListener("state",function(e) {
			
			let json = JSON.parse(e.data);
			return self.log("server state",json);
		});
		
		this.socket.addEventListener("errors",function(e) {
			
			let json = JSON.parse(e.data);
			for (let $5 = 0, $6 = iter$__(json), $7 = $6.length; $5 < $7; $5++) {
				let item = $6[$5];
				console.error(("error in " + (item.location.file) + ": " + (item.location.lineText) + " (" + (item.text) + ")"));
			};
			return;
		});
		
		this.socket.addEventListener("reload",function(e) {
			
			self.log('asked to reload by server');
			return globalThis.document.location.reload();
		});
		
		this.socket.onerror = function(e) {
			return self.log('hmr disconnected',e);
		};
	}
};

globalThis.imba_devtools = new DevTools;
