"use strict";

import BaseNode from "./BaseNode.js";

export default class Language extends BaseNode {
    languages = {
        English: "en-US",
        Spanish: "es-ES",
        German: "de-DE",
        Chinese: "zh-CN",
        Japanese: "ja-JP",
    };

    constructor(id) {
        super(id);

        this.render();
    }

    async do(text, language) {
        language = this.nodeElem.querySelector(`input[name="node--language-${this.id}"]:checked`).value;

        if (this.nextNode) {
            this.nextNode.do(text, language);
        }
    }

    render() {
        super.render();

        // Container
        this.nodeElem.classList.add("node--language");

        // Header
        const header = document.createElement("h1");
        header.innerText = "Language";
        this.nodeElem.appendChild(header);

        // Language
        const languageContainer = document.createElement("div");
        languageContainer.classList.add("node--language--list", "node--radio-group");
        this.nodeElem.appendChild(languageContainer);

        // Create radio buttons
        const name = `node--language-${this.id}`;
        let isFirst = true;

        for (const [langName, langCode] of Object.entries(this.languages)) {
            const id = `node--language-${name}-${this.id}-${langCode}`;
            const label = document.createElement("label");
            label.setAttribute("for", id);

            const input = document.createElement("input");
            input.type = "radio";
            input.id = id;
            input.name = name;
            input.value = langCode;
            input.checked = isFirst;
            isFirst = false;

            const span = document.createElement("span");
            span.classList.add("radio");

            const text = document.createTextNode(langName);

            label.appendChild(input);
            label.appendChild(span);
            label.appendChild(text);

            languageContainer.appendChild(label);
        }
    }

    serialize() {
        let data = {};
        data.id = this.id;
        data.checkedId = this.nodeElem.querySelector(`input[name="node--language-${this.id}"]:checked`).id;

        return data;
    }

    deserialize(data) {
        document.getElementById(data.checkedId).checked = true;
    }
}