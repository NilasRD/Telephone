'use strict';

class Eliza extends AbstractChatbot {
    async setup() {
        this.bot = new RiveScript();

        await this.bot.loadFile([
            './rive/eliza/eliza.rive',
        ]);

        this.bot.sortReplies();
    }

    async process(text) {
        return await this.bot.reply(this.username, text);
    }
}