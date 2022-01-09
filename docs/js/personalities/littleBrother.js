'use strict';

class LittleBrother extends AbstractPersonality {
    async process(text) {
        const pauseChance = 0.30;

        let sentence = text;
        const words = text.split(' ');

        let output = '';
        let newSentence = true;

        if (words.length > 1)
        {
          output = sentence + '. Thats what you sound like';
          //  newSentence = w.endsWith('.') || w.endsWith('?');
        } else{
            sentence += ' ';
            output = sentence + sentence + sentence + '. Thats what you sound like';
        }
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