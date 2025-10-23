class MafanFramework {
    #element;
    constructor(id) {
        this.#element = id;
    }

    Debug(text) {
        console.log(text);
    }
}

document.addEventListener("DOMContentLoaded", ()=> {
    console.log("Connected with successfuly");
});
