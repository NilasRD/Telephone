"use strict";

import BaseNode from "./BaseNode.js";

export default class Transcriber extends BaseNode {
    constructor(id) {
        super(id);

        this.render();
    }

    async do(text, language) {
        this.textField.innerText = text;

        if (this.nextNode) {
            this.nextNode.do(text, language);
        }
    }

    render() {
        super.render();

        // Container
        this.nodeElem.classList.add("node--transcriber");

        // Header
        const header = document.createElement("h1");
        header.innerText = "Transcriber";
        this.nodeElem.appendChild(header);

        // Locked input field
        this.textField = document.createElement("div");
        this.textField.innerHTML = "&nbsp;";
        this.textField.classList.add("node--textarea");
        this.nodeElem.appendChild(this.textField);
    }

    serialize() {
        let data = {};
        data.id = this.id;

        return data;
    }

    deserialize(data) {
        // nothing to do
    }
}