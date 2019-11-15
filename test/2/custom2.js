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

class ImbaBar extends HTMLElement {}

Object.defineProperty(ImbaBar.prototype,'progress',{
  get: function() { return this.getAttribute('value'); },
  set: function(newValue) { this.setAttribute('value', newValue); }
});




customElements.define('custom-bar', CustomProgressBar);
customElements.define('imba-bar', ImbaBar);