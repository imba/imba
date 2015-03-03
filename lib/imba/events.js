ev$ = {};

ImbaObservable = imba$baseclass.prototype;
ImbaObserver = imba$baseclass.prototype;

// Should take receiver as an argument instead of
// calling on the receiver itself.

ImbaObservable.on = function(event, callback) {
  var cbs, list, tail;
  cbs = this.__callbacks__ || (this.__callbacks__ = {});
  list = cbs[event] || (cbs[event] = {});
  tail = list.tail || (list.tail = (list.next = {}));
  tail.callback = callback;
  list.tail = tail.next = {};
  return tail;
};

ImbaObservable.once = function(event, callback) {
  var tail;
  tail = this.on(event, callback);
  tail.times = 1;
  return tail;
};

ImbaObservable.un = function(event, callback, scope) {
  var cbs, node, prev;
  if (!event) {
    this['__callbacks__'] = null;
  } else if (cbs = this['__callbacks__']) {
    if (!callback) {
      cbs[event] = null;
    } else if (node = cbs[event]) {
      while ((prev = node) && (node = node.next)) {
        if (node === callback || node.callback === callback) {
          prev.next = node.next;
          node.callback = null;
          break;
        }
      }
    }
  }
  return this;
};

ImbaObservable.emit = function(event) {
  var args, cb, cb1, cb2, listener, node, observer, prefix, target;
  cb1 = this["on" + event.replace(/\:/g, "")];
  cb2 = this.onemit;
  listener = this.__callbacks__;
  observer = this.__observers__;
  if (!(cb1 || cb2 || listener || observer)) return;
  args = [];
  args.push.apply(args, arguments);
  args.shift();

  if (cb1) cb1.apply(this, args);
  if (cb2) cb2.apply(this, args);

  this.__emit(event, args, listener);
  args.unshift(event);
  this.__emit('emit', args, listener);
  if (node = observer) {
    while (node = node.next) {
      if (target = node.observer) {
        args[0] = event;
        if (prefix = node.prefix) {
          if (cb = target["on" + prefix + "emit"]) {
            cb.call(target, args, node, this);
          }
          args[0] = prefix + ':' + event;
        }
        target.emit.apply(target, args);
      }
    }
  }
  return this;
};

ImbaObservable.__emit = function(event, args, cbs) {
  var cb, node, prev, ret;
  if (cbs && (node = cbs[event])) {
    while ((prev = node) && (node = node.next)) {
      if (cb = node.callback) ret = cb.apply(node, args);
      if (node.times && (--node.times <= 0)) {
        prev.next = node.next;
        node.callback = null;
      }
    }
  }
  return this;
};

ImbaObserver.observe = function(target, options) {
  var obs, tail;
  if (!target) return null;
  obs = target.__observers__ || (target.__observers__ = {});
  tail = obs.tail || (obs.tail = (obs.next = {}));
  tail.observer = this;
  tail.prefix = options && options.as;
  tail.options = options;
  obs.tail = tail.next = {};
  if (target.__observed instanceof Function) target.__observed(tail);
  return tail;
};

ImbaObserver.forget = function(target) {
  var node, prev;
  if (target && (node = target.__observers__)) {
    while ((prev = node) && (node = node.next)) {
      if (node.observer !== this) continue;
      prev.next = node.next;
      if (target.__unobserved instanceof Function) target.__unobserved(node);
      node.callback = null;
      node.observer = null;
      break;
    }
  }
  return this;
};