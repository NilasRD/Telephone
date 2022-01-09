'use strict';

class Hesitant extends AbstractPersonality {
    async process(text) {
        const pauseChance = 0.30;

        const words = text.split(' ');

        let output = '';
        let newSentence = true;

        words.forEach((w) => {
            if (!newSentence && Math.random() < pauseChance) {
                // pick random pause: uh, eh, etc.
                output = output.trimEnd();
                output += this.pauses[Math.floor(Math.random() * this.pauses.length)] + ' ';
            }

            output += w + ' ';
            newSentence = w.endsWith('.') || w.endsWith('?');
        });

        return output.trimEnd();
    }

    // make sure to put a space before a word
    pauses = [
        " eh...",
        " em...",
        "... eeeeh...",
        "... ehm...",
        "... uh...",
        " like,",
        " like...",
        " you know,",
        "... you know,",
    ];
}