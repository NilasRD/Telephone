"use strict";

import BaseNode from "./BaseNode.js";

export default class Connector extends BaseNode {
    socket = null;
    userCount = 0;
    room = {
        id: "",
        message: "",
        language: "",
        pass_key: "acfd0422-feff-4869-bf32-acbda6b7445c",
    };

    // sounds
    connectSound = new Audio("sounds/material/03-Primary-System-Sounds/navigation_forward-selection.mp3");
    closeSound = new Audio("sounds/material/03-Primary-System-Sounds/navigation_backward-selection.mp3");

    constructor(id) {
        super(id);

        this.connect = this.connect.bind(this);
        this.onConnect = this.onConnect.bind(this);
        this.close = this.close.bind(this);
        this.onReceive = this.onReceive.bind(this);
        this.handleUserChange = this.handleUserChange.bind(this);
        this.getHost = this.getHost.bind(this);
        this.sanitizeRoomId = this.sanitizeRoomId.bind(this);
        this.getRandomRoomName = this.getRandomRoomName.bind(this);

        this.render();
        this.getRandomRoomName();
    }

    async do(text, language) {
        if (this.socket && this.socket.readyState === 1) {
            // send message to server
            this.room.message = text;
            this.room.language = language;
            await this.socket.send(JSON.stringify(this.room));
        } else if (this.nextNode) {
            // pass on to next node
            this.nextNode.do(text, language);
        }
    }

    render() {
        super.render();

        // Node
        this.nodeElem.classList.add("node--connector");

        // Header
        const header = document.createElement("h1");
        header.innerText = "Connector";
        this.nodeElem.appendChild(header);

        // User count
        this.usersElem = document.createElement("div");
        this.usersElem.innerText = "Agents: ";
        this.usersElem.classList.add("node--connector--users");

        this.userCountElem = document.createElement("span");
        this.userCountElem.innerText = "0";

        this.usersElem.appendChild(this.userCountElem);
        this.nodeElem.appendChild(this.usersElem);

        // Server
        const serverElem = document.createElement("div");
        serverElem.classList.add("node--label-input");
        this.nodeElem.appendChild(serverElem);

        // Host
        const hostId = `node--connector--host-${this.id}`;
        const hostLabel = document.createElement("label");
        hostLabel.innerText = "Server";
        hostLabel.setAttribute("for", hostId);
        serverElem.appendChild(hostLabel);

        this.hostInput = document.createElement("input");
        this.hostInput.type = "text";
        this.hostInput.id = hostId;
        this.hostInput.name = hostId;
        this.hostInput.placeholder = "localhost";
        this.hostInput.value = "playlab.amorten.com/ws";
        serverElem.appendChild(this.hostInput);

        // Port
        /*
        const portId = `node--connector--port-${this.id}`;
        const portLabel = document.createElement("label");
        portLabel.setAttribute("for", portId);
        portLabel.classList.add("node--connector--port");
        portLabel.innerText = ":";
        serverElem.appendChild(portLabel);

        this.portInput = document.createElement("input");
        this.portInput.id = portId;
        this.portInput.name = portId;
        this.portInput.classList.add("node--connector--port");
        this.portInput.type = "number";
        this.portInput.min = "0";
        this.portInput.max = "65535";
        this.portInput.placeholder = "8081";
        this.portInput.value = "443";
        serverElem.appendChild(this.portInput);
         */

        // Room
        const roomElem = document.createElement("div");
        roomElem.classList.add("node--label-input");
        this.nodeElem.appendChild(roomElem);

        const roomId = `node--connector--room-${this.id}`;
        const roomLabel = document.createElement("label");
        roomLabel.innerText = "Room";
        roomLabel.setAttribute("for", roomId);
        roomElem.appendChild(roomLabel);

        this.roomInput = document.createElement("input");
        this.roomInput.type = "text";
        this.roomInput.id = roomId;
        this.roomInput.name = roomId;
        this.roomInput.maxLength = 32;
        this.roomInput.placeholder = "only letters, numbers and underscores";
        this.roomInput.addEventListener("keypress", this.onRoomInputChange);
        this.roomInput.addEventListener("focus", this.sanitizeRoomId);
        this.roomInput.addEventListener("blur", this.sanitizeRoomId);
        roomElem.appendChild(this.roomInput);

        const generateButton = document.createElement("button");
        generateButton.classList.add("node--connector--room-generate");
        generateButton.addEventListener("click", this.getRandomRoomName);
        roomElem.appendChild(generateButton);

        const generateIcon = document.createElement("span");
        generateIcon.classList.add("material-icons");
        generateIcon.innerText = "refresh";
        generateButton.appendChild(generateIcon);

        // Connect button
        this.connectButton = document.createElement("button");
        this.connectButton.classList.add("node--button");
        this.connectButton.innerText = "Connect";
        this.connectButton.addEventListener("click", this.connect);
        this.nodeElem.appendChild(this.connectButton);
    }

    serialize() {
        let data = {};
        data.id = this.id;
        data.host = this.hostInput.value;
        data.room = this.roomInput.value;
        
        return data;
    }

    deserialize(data) {
        this.hostInput.value = data.host;
        this.roomInput.value = data.room;
    }

    onRemove(event) {
        super.onRemove(event);
        this.close();
    }

    onRoomInputChange(evt) {
        if (evt.key && /^[a-z0-9_]+$/i.test(evt.key)) {
            // accept key
        } else {
            evt.preventDefault();
        }
    }

    /**
     * Connect to server
     * @param {MouseEvent} evt
     */
    async connect(evt) {
        if (!this.roomInput.value) {
            return;
        }

        if (!this.socket || this.socket.readyState === 3) { // CLOSED
            // connect to server
            this.socket = await new WebSocket(this.getHost());

            // listen for socket events
            this.socket.addEventListener("open", this.onConnect);
            this.socket.addEventListener("message", this.onReceive);
            this.socket.addEventListener("error", (evt) => {
                Notification.error("Server error!");
                console.error(evt);
            });
        } else if (this.socket.readyState === 1) { // OPEN
            this.socket.close(1000, "User disconnected");
        }
    }

    /**
     * Handle when the connection is open
     * @param evt
     */
    async onConnect(evt) {
        // set room id and person, and lock input fields
        this.room.id = this.roomInput.value;

        if (this.socket && this.socket.readyState === 1) {  // OPEN
            this.room.message = "";
            this.room.language = "en-US";

            // send dummy message to assign person and room
            await this.socket.send(JSON.stringify(this.room));
            await this.sleepAsync(100); // why was this?

            // listen for close event
            this.socket.addEventListener("close", this.close);

            // disable input
            this.hostInput.disabled = true;
            // this.portInput.disabled = true;
            this.roomInput.disabled = true;

            this.connectButton.innerText = "Disconnect";
            this.connectButton.classList.add("node--button--active");

            this.connectSound.play();
        }
    }

    /**
     * Handle when server connection has close
     * @param evt
     */
    close(evt) {
        this.socket.removeEventListener("close", this.close);

        // enable input
        this.hostInput.disabled = false;
        // this.portInput.disabled = false;
        this.roomInput.disabled = false;

        this.connectButton.innerText = "Connect";
        this.connectButton.classList.remove("node--button--active");

        this.userCount = 0;
        this.userCountElem.innerText = this.userCount.toString();

        this.closeSound.play();
    }

    /**
     * Handle messages from the server
     * @param event
     */
    onReceive(event) {
        let data;
        try {
            // parse the received data as JSON
            data = JSON.parse(event.data);
        } catch (err) {
            Notification.warning("Issue processing received data");
            return;
        }

        // check if we received any server error messages
        if (data.hasOwnProperty("error")) {
            Notification.error(data.error);
            return;
        }

        // there was a change of users
        if (data.hasOwnProperty("users")) {
            this.handleUserChange(data["users"]);
            return;
        }

        // message received, pass to next node
        if (this.nextNode) {
            this.nextNode.do(data.message, data.language);
        }
    }

    /**
     * Update user/agent count
     * @param {int} users
     */
    handleUserChange(users) {
        if (this.socket.readyState !== 1) { // OPEN
            return;
        }

        if (this.userCount > 0 && this.userCount < users) {
            Notification.normal("Some agent joined the room!");
        } else if (this.userCount > users) {
            Notification.normal("Some agent left the room");
        }

        this.userCount = users;
        this.userCountElem.innerText = this.userCount.toString();
    }

    /**
     * Get the full websocket host
     * @return {string}
     */
    getHost() {
        const host = this.hostInput.value.trim().replace(/^(.+?:\/\/)/, "");
        // const port = this.portInput.value.toString();

        return "wss://" + host;
    }

    /**
     * Remove unwanted characters from the room id
     */
    sanitizeRoomId() {
        let str = this.roomInput.value;
        str = str.replace(" ", "_");
        this.roomInput.value = str.replace(/[^a-z0-9_]/g, "");
    }

    /**
     * async sleep function
     */
    sleepAsync(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    getRandomRoomName() {
        this.roomInput.value = Word.getRandomWords(16);
        this.sanitizeRoomId();
    }
}