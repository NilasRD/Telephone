'use strict';

import NodeManager from "./NodeManager.js";

const TextMessaging = (function() {
    const elem = {};

    function setup() {
        elem.message = document.getElementById('message');
        elem.sendButton = document.getElementById('send');

        // send message events
        elem.sendButton.addEventListener('click', sendMessage);
        elem.message.addEventListener('keypress', (evt) => {
            if (evt.key === 'Enter')
                sendMessage();
        });
    }

    function sendMessage() {
        let text = elem.message.value;
        if (!text)
            return;

        text = text.trim();

        elem.message.value = '';

        // Client.send(msg);
        let language = document.querySelector('input[name="language"]:checked').value;
        NodeManager.do(text, language);
    }

    document.addEventListener('DOMContentLoaded', setup);

    return {};
})();