"use strict";

class Dog extends AbstractPersonality {
    async process(text) {
        const words = text.split(" ");

        let output = "";
        words.forEach(w => {
            output += this.replaceWord(w) + " ";
        });

        return output;
    }

    replaceWord(w) {
        // grab any of , . ! ?
        let end = "";
        if (/[,.!?]$/.test(w)) {
            end = w.slice(-1);
            w = w.slice(0, -1);
        }

        const key = Math.min(w.length, Object.keys(this.replacements).length);
        const arr = this.replacements[key];

        // pick a random element in the list of replacements that matches the replaceWord's length
        return arr[Math.floor(Math.random() * arr.length)] + end;
    }

    replacements = {
        1: ["r", "vu"],
        2: ["ru", "gr"],
        3: ["vov", "vuf", "vaf", "waf", "wof"],
        4: ["woof", "vuuf", "vaff", "vrof", "wrof", "bark"],
        5: ["vovov", "vufuv", "wooof", "graaa", "grrar"],
        6: ["vufvuf", "vovvov", "vovvuf", "vufvov"],
        7: ["vuuuuuf", "wuuuuuf", "vuffeli", "grerere"],
    };
}