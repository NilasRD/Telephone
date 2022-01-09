"use strict";

import BaseNode from "./BaseNode.js";

export default class Personality extends BaseNode {
    personalities = [
        new AbstractPersonality("None"),
        new Dog("Doggy"),
        new Hesitant("Hesitant"),
        new LittleBrother("Little Brother"),
        new GladosFilter("Glados Filter"),
        new GladosBot("Glados Bot"),
        // new Eskild("Eskild"),
        // new Karuni("Karuni"),
    ];

    personality = this.personalities[0];

    constructor(id) {
        super(id);

        this.setPersonality = this.setPersonality.bind(this);

        this.render();
    }

    async do(text, language) {
        text = await this.personality.process(text);

        if (this.nextNode) {
            this.nextNode.do(text, language);
        }
    }

    render() {
        super.render();

        // Container
        this.nodeElem.classList.add("node--personality");

        // Header
        const header = document.createElement("h1");
        header.innerText = "Personality";
        this.nodeElem.appendChild(header);

        // List
        const listContainer = document.createElement("div");
        listContainer.classList.add("node--personality--list");
        this.nodeElem.appendChild(listContainer);

        // Label and Select
        const name = `node--personality--list-${this.id}`;

        this.selectionList = document.createElement("select");
        this.selectionList.id = name;
        this.selectionList.name = name;
        this.selectionList.classList.add("node--select");
        this.selectionList.addEventListener("change", this.setPersonality);
        listContainer.appendChild(this.selectionList);

        // Options
        for (const p of this.personalities) {
            let option = document.createElement("option");
            option.textContent = p.name;
            this.selectionList.appendChild(option);
        }
    }

    serialize() {
        let data = {};
        data.id = this.id;
        data.selectedIndex = this.selectionList.selectedIndex;

        return data;
    }

    deserialize(data) {
        try {
            this.selectionList.selectedIndex = data.selectedIndex;
            this.personality = this.personalities[data.selectedIndex];
        } catch (err) {
            console.warn(err);
        }
    }

    setPersonality() {
        const i = this.selectionList.selectedIndex;
        this.personality = this.personalities[i];
    }
}
