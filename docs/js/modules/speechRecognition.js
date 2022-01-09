'use strict';

import NodeManager from "./NodeManager.js";

const Recognition = (function () {
    // setup speech recognition
    try {
        var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;
        // var SpeechGrammarList = SpeechGrammarList || webkitSpeechGrammarList;
        // var SpeechRecognitionEvent = SpeechRecognitionEvent || webkitSpeechRecognitionEvent;
    } catch (err) {
        let div = document.createElement('div');
        div.classList.add('unsupported');
        div.innerText = 'Speaker recognition is not supported in this browser. Try Chrome or Safari.';

        document.body.prepend(div);
    }

    // shared variables
    let elem = {};
    let listening = false;
    let recognition;

    /**
     * Initial setup
     */
    function setup() {
        elem.human = document.getElementById('human-wrapper');
        elem.listenButton = document.getElementById('listen');
        elem.continuous = document.getElementById('continuous');

        elem.listenButton.addEventListener('click', listenButtonClicked);
    }

    /**
     * Handle when the "Listen" button is clicked
     */
    function listenButtonClicked() {
        if (listening) {
            stopListening();
        } else {
            startListening();
        }

        listening = !listening;
    }

    /**
     * Begin listening
     */
    function startListening() {
        let language = document.querySelector('input[name="language"]:checked');
        let langIn = language ? language.value : 'en-US';

        recognition = new SpeechRecognition();
        recognition.continuous = elem.continuous.checked;
        recognition.lang = langIn; // da-DK, en-US, es-ES, de-DE, zh-CN, ja-JP
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.addEventListener('result', speechResults);
        recognition.addEventListener('start', recognitionStarted);
        recognition.addEventListener('end', recognitionStopped);
        recognition.start();
    }

    function stopListening() {
        if (!recognition) {
            return;
        }

        recognition.stop();
    }

    async function speechResults(evt) {
        /*
        console.log(evt.results);

        // input language
        let language = document.querySelector('input[name="language"]:checked');
        let langIn = language ? language.value.substring(0, 2) : 'en';

        // output language
        let languageSpeech = document.querySelector('input[name="language-speech"]:checked');
        let langOut = languageSpeech ? languageSpeech.value.substring(0, 2) : 'en';

        // get latest recognition result
        let phrase = evt.results[evt.resultIndex][0].transcript;

        // translate the process
        let translated = await Translate.translate(phrase, langIn, langOut);

        Speech.speak(translated);
         */

        let language = document.querySelector('input[name="language"]:checked').value;
        let text = evt.results[evt.resultIndex][0].transcript;

        NodeManager.do(text, language);
    }

    function recognitionStarted(evt) {
        const sound = new Audio('sounds/material/03-Primary-System-Sounds/state-change_confirm-up.mp3');
        sound.play()
            .catch(err => {
                console.error(err)
            });

        elem.human.classList.add('module-active');
        elem.listenButton.classList.add('button-active');
        elem.listenButton.innerText = 'Listening...';

        for (let el of elem.human.getElementsByTagName('input')) {
            el.setAttribute('disabled', '');
        }

        listening = true;
    }

    function recognitionStopped(evt) {
        if (recognition) {
            recognition.removeEventListener('result', speechResults);
            recognition.removeEventListener('start', recognitionStarted);
            recognition.removeEventListener('end', recognitionStopped);
            recognition.abort();
            recognition = null;
        }

        const sound = new Audio('sounds/material/03-Primary-System-Sounds/state-change_confirm-down.mp3');
        sound.play()
            .catch(err => {
                console.error(err)
            });

        elem.human.classList.remove('module-active');
        elem.listenButton.classList.remove('button-active');
        elem.listenButton.innerText = 'Listen';

        for (let el of elem.human.getElementsByTagName('input')) {
            el.removeAttribute('disabled');
        }

        listening = false;
    }

    document.addEventListener('DOMContentLoaded', setup);

    // export functions to Recognition namespace
    return {
        startListening: startListening,
        stopListening: stopListening,
    };
})();