"use strict";

import BaseNode from "./BaseNode.js";

export default class Translator extends BaseNode {
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
        const outLanguage = this.nodeElem.querySelector(`input[name="node--translator-${this.id}"]:checked`).value;

        // extract first two letters of language, like "en" from "en-US"
        const fromLanguage = language.substring(0, 2);
        const toLanguage = outLanguage.substring(0, 2);

        if (language !== outLanguage) {
            text = await this.fetchTranslation(text, fromLanguage, toLanguage);
        }

        if (this.nextNode) {
            this.nextNode.do(text, outLanguage);
        }
    }

    render() {
        super.render();

        // Container
        this.nodeElem.classList.add("node--translator");

        // Header
        const header = document.createElement("h1");
        header.innerText = "Translator";
        this.nodeElem.appendChild(header);

        // Language
        this.radioGroup = document.createElement("div");
        this.radioGroup.classList.add("node--radio-group");
        this.nodeElem.appendChild(this.radioGroup);

        // Create radio buttons
        const name = `node--translator-${this.id}`;
        let isFirst = true;

        for (const [langName, langCode] of Object.entries(this.languages)) {
            const id = `node--translator-${name}-${this.id}-${langCode}`;
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

            this.radioGroup.appendChild(label);
        }
    }

    serialize() {
        let data = {};
        data.id = this.id;
        data.checkedId = this.nodeElem.querySelector(`input[name="node--translator-${this.id}"]:checked`).id;

        return data;
    }

    deserialize(data) {
        document.getElementById(data.checkedId).checked = true;
    }

    /**
     * Fetch translation from host
     * @param {string} text
     * @param {language} fromLanguage
     * @param {language} toLanguage
     * @return {Promise<string>}
     */
    async fetchTranslation(text, fromLanguage, toLanguage) {
        // use LibreTranslate to translate the process
        // https://libretranslate.com requires API key!

        const hosts = [
            "https://libretranslate.de/translate",
            // "https://translate.astian.org/translate",
            "https://translate.mentality.rip/translate",
        ];

        this.shuffle(hosts);

        for (let i = 0; i < hosts.length; i++) {
            try {
                console.log(`Try translating at: ${hosts[i]}`);
                let res = await fetch(hosts[i], {
                    method: "POST",
                    body: JSON.stringify({
                        q: text,
                        source: fromLanguage,
                        target: toLanguage,
                        format: "text",
                        api_key: "",
                    }),
                    headers: {"Content-Type": "application/json"}
                });

                if (res.status === 200) {
                    console.log("Server responded with OK!");
                    let json = await res.json();

                    // success!
                    return json.translatedText;
                }
            } catch (err) {
                console.error(err);
            }
        }

        // nothing worked :(
        Notification.error("Translator error!");
        console.error("Response did not return 200 (OK)");

        return text;
    }

    shuffle(array) {
        let currentIndex = array.length, randomIndex;

        // While there remain elements to shuffle...
        while (currentIndex !== 0) {

            // Pick a remaining element...
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;

            // And swap it with the current element.
            [array[currentIndex], array[randomIndex]] = [
                array[randomIndex], array[currentIndex]];
        }

        return array;
    }
}