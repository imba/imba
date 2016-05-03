(function(){
	var Imba_;
	require('./manager');
	
	Imba.TagManager = new Imba.TagManagerClass();
	
	require('./tag');
	require('./html');
	require('./svg');
	require('./pointer');
	require('./touch');
	require('./event');
	require('./event-manager');
	require('./selector');
	
	if (ENV_WEB) {
		require('./reconciler');
	};
	
	if (ENV_NODE) {
		require('./server');
	};
	
	if (ENV_WEB) {
		Imba.POINTER || (Imba.POINTER = new Imba.Pointer());
		
		Imba.Events = new Imba.EventManager(Imba.document(),{events: [
			'keydown','keyup','keypress',
			'textInput','input','change','submit',
			'focusin','focusout','blur',
			'contextmenu','dblclick',
			'mousewheel','wheel','scroll',
			'beforecopy','copy',
			'beforepaste','paste',
			'beforecut','cut'
		]});
		
		var hasTouchEvents = window && window.ontouchstart !== undefined;
		
		if (hasTouchEvents) {
			Imba.Events.listen('touchstart',function(e) {
				return Imba.Touch.ontouchstart(e);
			});
			
			Imba.Events.listen('touchmove',function(e) {
				return Imba.Touch.ontouchmove(e);
			});
			
			Imba.Events.listen('touchend',function(e) {
				return Imba.Touch.ontouchend(e);
			});
			
			Imba.Events.listen('touchcancel',function(e) {
				return Imba.Touch.ontouchcancel(e);
			});
		};
		
		Imba.Events.register('click',function(e) {
			// Only for main mousebutton, no?
			if ((e.timeStamp - Imba.Touch.LastTimestamp) > Imba.Touch.TapTimeout) {
				var tap = new Imba.Event(e);
				tap.setType('tap');
				tap.process();
				if (tap._responder) {
					return e.preventDefault();
				};
			};
			// delegate the real click event
			return Imba.Events.delegate(e);
		});
		
		Imba.Events.listen('mousedown',function(e) {
			if ((e.timeStamp - Imba.Touch.LastTimestamp) > Imba.Touch.TapTimeout) {
				if (Imba.POINTER) { return Imba.POINTER.update(e).process() };
			};
		});
		
		Imba.Events.listen('mouseup',function(e) {
			if ((e.timeStamp - Imba.Touch.LastTimestamp) > Imba.Touch.TapTimeout) {
				if (Imba.POINTER) { return Imba.POINTER.update(e).process() };
			};
		});
		
		Imba.Events.register(['mousedown','mouseup']);
		return (Imba.Events.setEnabled(true),true);
	};

})();