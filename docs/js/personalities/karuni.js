"use strict";

class Karuni extends AbstractPersonality {
    async setup() {
        this.karuni = new RiveScript();

        const riveScripts = [];
        riveScripts.push("./rive/karuni/karuni.rive");

        await this.karuni.loadFile(riveScripts);

        this.karuni.sortReplies();
    }

    async process(text) {
        return await this.karuni.reply("Human", text);
    }
}