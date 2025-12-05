// Defines a custom element <hello-world> that logs a message when connected.
class HelloWorld extends HTMLElement {
  constructor(){
    super();
  }
  connectedCallback(){
    // Log to the console when the element is added to the DOM.
    console.log('Hello world! (from <hello-world>)');
  }
}

customElements.define('hello-world', HelloWorld);
