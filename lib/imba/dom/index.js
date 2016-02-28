(function(){
	var Imba_;
	require('./tag');
	require('./html');
	require('./svg');
	
	require('./pointer');
	require('./touch');
	require('./event');
	require('./event-manager');
	require('./selector');
	
	if (Imba.CLIENT) {
		require('./reconciler');
	} else {
		require('./server');
	};
	
	if (Imba.CLIENT) {
		
		Imba.POINTER || (Imba.POINTER = new Imba.Pointer());
		
		Imba.Events = new Imba.EventManager((Imba.CLIENT ? (Imba.document()) : ({})),{events: [
			'keydown','keyup','keypress','textInput','input','change','submit',
			'focusin','focusout','blur','contextmenu','dblclick',
			'mousewheel','wheel','scroll'
		]});
		
		var doc = Imba.document();
		var hasTouchEvents = window && window.ontouchstart !== undefined;
		
		if (hasTouchEvents) {
			Imba.Events.listen('touchstart',function(e) {
				var Events_, v_;
				(((Events_ = Imba.Events).setCount(v_ = Events_.count() + 1),v_)) - 1;
				return Imba.Touch.ontouchstart(e);
			});
			
			Imba.Events.listen('touchmove',function(e) {
				var Events_, v_;
				(((Events_ = Imba.Events).setCount(v_ = Events_.count() + 1),v_)) - 1;
				return Imba.Touch.ontouchmove(e);
			});
			
			Imba.Events.listen('touchend',function(e) {
				var Events_, v_;
				(((Events_ = Imba.Events).setCount(v_ = Events_.count() + 1),v_)) - 1;
				return Imba.Touch.ontouchend(e);
			});
			
			Imba.Events.listen('touchcancel',function(e) {
				var Events_, v_;
				(((Events_ = Imba.Events).setCount(v_ = Events_.count() + 1),v_)) - 1;
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