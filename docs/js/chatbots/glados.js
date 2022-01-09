'use strict';

class Glados extends AbstractChatbot {
    async setup() {
        this.bot = new RiveScript();

        await this.bot.loadFile([
            './rive/glados/gladosBot.rive',
        ]);

        this.bot.sortReplies();
    }

    async process(text) {
        return await this.bot.reply(this.username, text);
    }
}