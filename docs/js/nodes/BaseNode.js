"use strict";

import NodeManager from "../modules/NodeManager.js";

export default class BaseNode {
    constructor(id) {
        this.root = document.getElementById("node-container");
        this.nodeElem = null;
        this.id = id;
        this.nextNode = null;

        this.do = this.do.bind(this);
        this.render = this.render.bind(this);
        this.serialize = this.serialize.bind(this);
        this.deserialize = this.deserialize.bind(this);
        this.connectNode = this.connectNode.bind(this);
        this.disconnectNode = this.disconnectNode.bind(this);
        this.onConnectNode = this.onConnectNode.bind(this);
        this.onDisconnectNode = this.onDisconnectNode.bind(this);
        this.onDragStart = this.onDragStart.bind(this);
        this.onDragMove = this.onDragMove.bind(this);
        this.onDragEnd = this.onDragEnd.bind(this);
        this.onRemove = this.onRemove.bind(this);
    }

    /**
     * Execute the Node
     * @param {string} text - The text message, e.g. "Hello, world"
     * @param {string} language - The incoming language, e.g. "en-US"
     * @return {Promise<{language, text}>}
     */
    async do(text, language) {
        // override method in child classes
        if (this.nextNode) {
            this.nextNode.do(text, language);
        }
    }

    /**
     * Render the Node HTML and add to the root
     */
    render() {
        // Node
        this.nodeElem = document.createElement("div");
        this.nodeElem.classList.add("node");
        this.root.appendChild(this.nodeElem);

        // Handle
        const handle = document.createElement("div");
        handle.classList.add("node--handle");
        handle.innerHTML = "<span class=\"material-icons\">more_horiz</span>";
        handle.addEventListener("mousedown", this.onDragStart);
        handle.addEventListener("mouseup", this.onDragEnd);
        this.nodeElem.appendChild(handle);

        // Remove
        const remove = document.createElement("div");
        remove.classList.add("node--remove");
        remove.innerHTML = "<span class=\"material-icons\">clear</span>";
        remove.addEventListener("click", this.onRemove);
        this.nodeElem.appendChild(remove);
    }

    connectNode(node) {
        this.nextNode = node;
        this.onConnectNode();
    }

    disconnectNode() {
        this.nextNode = null;
        this.onDisconnectNode();
    }

    onConnectNode() {
    }

    onDisconnectNode() {
    }

    onDragStart(event) {
        window.addEventListener("mousemove", this.onDragMove);
        this.nodeElem.classList.add("dragging");
        this.dragStartPosition = {x: event.clientX, y: event.clientY};
    }

    onDragMove(event) {
        const x = event.clientX - this.dragStartPosition.x;
        const y = event.clientY - this.dragStartPosition.y;
        this.nodeElem.style.transform = `translate(${x}px, ${y}px)`;
    }

    onDragEnd(event) {
        window.removeEventListener("mousemove", this.onDragMove);
        const y = this.nodeElem.getBoundingClientRect().y;

        this.nodeElem.classList.remove("dragging");
        this.nodeElem.style.transform = "";

        NodeManager.dropNode(this, y);
    }

    onRemove(event) {
        NodeManager.removeNode(this);
    }

    /**
     * Return an object with properties
     * @return {{}}
     */
    serialize() {
        let data = {};
        data.id = this.id;

        return data;
    }

    /**
     * Reconstruct object properties from already parsed JSON
     * @param data
     */
    deserialize(data) {

    }
}