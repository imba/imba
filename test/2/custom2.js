class CustomProgressBar extends HTMLElement {
  static get observedAttributes() { return ['value']; }
  attributeChangedCallback(name, oldValue, newValue, namespaceURI) {
      if (name === 'value') {
          const newPercentage = newValue === null ? 0 : parseInt(newValue);
          this._progressElement.setAttribute('aria-valuenow', newPercentage);
          this._label.textContent = newPercentage + '%';
          this._bar.style.width = newPercentage + '%';
      }
  }
  get progress() { return this.getAttribute('value'); }
  set progress(newValue) { this.setAttribute('value', newValue); }
}

class ImbaBar extends HTMLElement {
  constructor(){
    super();
  }
  connectedCallback(){
    this.innerHTML = "<b>Hello there</b>";
  }
}

Object.defineProperty(ImbaBar.prototype,'progress',{
  get: function() { return this.getAttribute('value'); },
  set: function(newValue) { this.setAttribute('value', newValue); }
});

class ImbaInheritedBar extends ImbaBar {
  constructor(){
    super();
  }
  connectedCallback(){
    super.connectedCallback();
    var el = document.createElement('em')
    el.textContent = "Emphasis";
    this.appendChild(el); // = "<b>Hello there again!</b>";
  }
}




customElements.define('custom-bar', CustomProgressBar);
customElements.define('imba-bar', ImbaBar);
customElements.define('inherited-bar', ImbaInheritedBar);

class TodoItem extends HTMLLIElement {
  constructor(){
    super();
    this.innerHTML = "<b>List item!</b>";
  }
  connectedCallback(){
    this.innerHTML = "<b>Hello there</b>";
  }
}

// customElements.define('todo-item', TodoItem, {extends: 'li'});
// document.body.appendChild(document.createElement('li', { is: "todo-item" }))

