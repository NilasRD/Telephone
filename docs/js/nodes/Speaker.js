"use strict";

import BaseNode from "./BaseNode.js";

var synthesis = window.speechSynthesis;

export default class Speaker extends BaseNode {
    currentLanguage = "*";

    constructor(id) {
        super(id);

        this.voices = [];

        this.speak = this.speak.bind(this);
        this.onSystemVoicesChanged = this.onSystemVoicesChanged.bind(this);
        this.onLanguageChanged = this.onLanguageChanged.bind(this);
        this.onVoiceChanged = this.onVoiceChanged.bind(this);
        this.listLanguages = this.listLanguages.bind(this);
        this.listVoices = this.listVoices.bind(this);

        this.render();

        this.onSystemVoicesChanged();
        if (synthesis) {
            synthesis.onvoiceschanged = this.onSystemVoicesChanged;
        }
    }

    async do(text, language) {
        await this.speak(text);

        if (this.nextNode) {
            this.nextNode.do(text, language);
        }
    }

    render() {
        super.render();

        // Node Container
        this.nodeElem.classList.add("node--speaker");

        // Header
        const header = document.createElement("h1");
        header.innerText = "Speaker";
        this.nodeElem.appendChild(header);


        // Language Select
        {
            const name = `node--speaker--language-${this.id}`;

            // Language Container
            const container = document.createElement("div");
            container.classList.add("node--label-input", "node--speaker--list-container");
            this.nodeElem.appendChild(container);

            // Label
            const label = document.createElement("label");
            label.innerText = "Language";
            label.setAttribute("for", name);
            container.appendChild(label);

            // Select
            this.languageSelect = document.createElement("select");
            this.languageSelect.name = name;
            this.languageSelect.id = name;
            this.languageSelect.classList.add("node--select");
            this.languageSelect.addEventListener("change", this.onLanguageChanged);
            container.appendChild(this.languageSelect);
        }

        // Voice Select
        {
            const name = `node--speaker--voice-${this.id}`;

            // Voice Container
            const container = document.createElement("div");
            container.classList.add("node--label-input", "node--speaker--list--container");
            this.nodeElem.appendChild(container);

            // Label
            const label = document.createElement("label");
            label.innerText = "Voice";
            label.setAttribute("for", name);
            container.appendChild(label);

            // Select
            this.voiceSelect = document.createElement("select");
            this.voiceSelect.name = name;
            this.voiceSelect.id = name;
            this.voiceSelect.classList.add("node--select");
            this.voiceSelect.addEventListener("change", this.onVoiceChanged);
            container.appendChild(this.voiceSelect);
        }
    }

    serialize() {
        let data = {};
        data.id = this.id;
        data.languageIndex = this.languageSelect.selectedIndex;
        data.voiceIndex = this.voiceSelect.selectedIndex;

        return data;
    }

    deserialize(data) {
        try {
            this.languageSelect.selectedIndex = data.languageIndex;
            this.onLanguageChanged();
            this.voiceSelect.selectedIndex = data.voiceIndex;
        } catch (err) {
            console.warn(err);
        }
    }

    async speak(text) {
        const voiceName = this.voiceSelect.selectedOptions[0].dataset.name;
        const voice = this.voices.find(voice => voice.name === voiceName);

        if (voice) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.voice = voice;
            synthesis.speak(utterance);

            // resolve promise when utterance has ended
            return new Promise(res => {
                utterance.onend = res;
            });
        }
    }

    onSystemVoicesChanged() {
        this.voices = synthesis.getVoices();
        this.listLanguages();
        this.listVoices();
    }

    onLanguageChanged() {
        this.currentLanguage = this.languageSelect.selectedOptions[0].dataset.lang;
        this.listVoices();
    }

    onVoiceChanged() {
    }

    listLanguages() {
        const langs = new Set();

        for (let voice of this.voices) {
            langs.add(voice.lang);
        }

        const displayNames = new Intl.DisplayNames(["en"], {type: "language"});
        const languages = [];

        langs.forEach(lang => {
            languages.push({
                name: displayNames.of(lang),
                lang: lang,
            });
        });

        // Sort by name
        languages.sort((a, b) => {
            return (a.name < b.name) ? -1 : ((a.name === b.name) ? 0 : 1);
        });

        // Add * to top of list
        languages.unshift({name: "Any", lang: "*"});

        // Populate list
        this.languageSelect.innerHTML = "";
        for (let language of languages) {
            const option = document.createElement("option");
            option.textContent = language.name;
            option.dataset.lang = language.lang;
            this.languageSelect.appendChild(option);
        }
    }

    listVoices() {
        this.voiceSelect.innerHTML = "";

        const showAll = this.currentLanguage === "*";

        for (let voice of this.voices) {
            if (showAll || this.currentLanguage === voice.lang) {
                const option = document.createElement("option");
                option.textContent = voice.name;
                option.dataset.name = voice.name;
                option.dataset.lang = voice.lang;
                this.voiceSelect.appendChild(option);
            }
        }
    }
}