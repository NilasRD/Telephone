"use strict";

class Eskild extends AbstractPersonality {
    async setup() {
        this.eskild = new RiveScript();

        const riveScripts = [];
        riveScripts.push("./rive/karuni/karuni.rive");

        await this.eskild.loadFile(riveScripts);

        this.eskild.sortReplies();
    }

    async process(text) {
        return await this.eskild.reply("Human", text);
    }
}