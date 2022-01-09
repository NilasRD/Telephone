"use strict";

import Connector from "../nodes/Connector.js";
import Personality from "../nodes/Personality.js";
import Translator from "../nodes/Translator.js";
import Speaker from "../nodes/Speaker.js";
import Transcriber from "../nodes/Transcriber.js";
import Language from "../nodes/Language.js";

/**
 * Class for processing the user added Nodes
 */
class NodeManager {
    nodeTypes = {
        Connector: Connector,
        Language: Language,
        Personality: Personality,
        Speaker: Speaker,
        Transcriber: Transcriber,
        Translator: Translator,
    }

    constructor() {
        this.nodes = [];
        this.elem = document.getElementById("node-manager");
        this.counter = 0;

        this.do = this.do.bind(this);
        this.dropNode = this.dropNode.bind(this);
        this.removeNode = this.removeNode.bind(this);
        this.serializeNodes = this.serializeNodes.bind(this);
        this.deserializeNodes = this.deserializeNodes.bind(this);

        this.render();

        // restore nodes
        window.addEventListener("load", () => {
            this.deserializeNodes();
        });

        // save data when window is closed or reloaded
        window.addEventListener("beforeunload", this.serializeNodes);
    }

    addNode(node, id = undefined) {
        if (id === undefined) {
            id = this.counter++;
        }

        node = new node(id.toString());
        this.nodes.push(node);

        // connect second last node to new node
        if (this.nodes.length > 1) {
            this.nodes[this.nodes.length - 2].connectNode(node);
        }

        return node;
    }

    removeNode(node) {
        const i = this.nodes.indexOf(node);

        if (i !== -1) {
            // re-connect the one before
            if (i > 0) {
                this.nodes[i - 1].connectNode(node.nextNode);
            }

            // remove DOM
            node.nodeElem.remove();

            // cut it out
            this.nodes.splice(i, 1);
        } else {
            console.error("Could not find index of node to remove");
        }
    }

    async do(text, language = "en-US") {
        // start chain reaction
        if (this.nodes.length > 0) {
            this.nodes[0].do(text, language);
        }
    }

    render() {
        // Header
        const header = document.createElement("h1");
        header.innerText = "Nodes";
        this.elem.appendChild(header);

        // Node container
        const nodeContainer = document.createElement("div");
        nodeContainer.classList.add("node-manager--nodes");
        this.elem.appendChild(nodeContainer);

        // Node buttons
        for (const [name, obj] of Object.entries(this.nodeTypes)) {
            const button = document.createElement("button");
            button.innerText = name;
            button.addEventListener("click", () => this.addNode(obj));
            button.classList.add("node-add");

            nodeContainer.appendChild(button);
        }
    }

    serializeNodes() {
        let data = [];

        try {
            for (let node of this.nodes) {
                data.push({
                    nodeType: node.constructor.name,
                    data: node.serialize(),
                });
            }

            localStorage.setItem("nodes", JSON.stringify(data));
        } catch(err) {
            console.warn(err);
        }

    }

    deserializeNodes() {
        let json = localStorage.getItem("nodes");
        if (!json) {
            return;
        }

        let data;
        try {
            data = JSON.parse(json);
        } catch (err) {
            console.error(err);
            localStorage.setItem("nodes", "");
            return;
        }

        let maxId = 0;

        try {
            for (let item of data) {
                let id = parseInt(item.data.id);
                if (maxId < id) maxId = id;

                let node = this.nodeTypes[item.nodeType];
                node = this.addNode(node, id);
                node.deserialize(item.data);
            }
        } catch (err) {
            console.error(err);
            localStorage.setItem("nodes", "");
        }

        this.counter = maxId + 1;
    }

    dropNode(node, targetY) {
        // remove node from array
        this.nodes.splice(this.nodes.indexOf(node), 1);

        // find the node we dropped above
        let newIndex = 0;

        for (let i = 0; i < this.nodes.length; i++) {
            let rect = this.nodes[i].nodeElem.getBoundingClientRect();
            if (rect.y < targetY) {
                newIndex = i + 1;
            } else {
                break;
            }
        }

        // re-insert the node
        this.nodes.splice(newIndex, 0, node);

        // re-connect all nodes
        for (let i = 0; i < this.nodes.length - 1; i++) {
            this.nodes[i].nextNode = this.nodes[i + 1];
        }

        // disconnect last
        this.nodes[this.nodes.length - 1].nextNode = null;

        // re-order DOM
        for (let n of this.nodes) {
            n.root.append(n.nodeElem);
        }
    }
}

export default new NodeManager();