class MafanFramework {
    #element;

    constructor(id) {
        this.#element = id;
        this.#jQuery = document.createElement('script');
        script.src = 'https://cdn-script.com/ajax/libs/jquery/3.7.1/jquery.js';;
    }

    getElement() {
        return this.#element;
    }

    createElement(context) {
        this.#jQuery(this.#element).appendChild(context);
    }

    Debug(text) {
        console.log(text);
    }
}
