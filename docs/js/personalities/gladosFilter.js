'use strict';

class GladosFilter extends AbstractPersonality {
    async setup() {
        this.bot = new RiveScript();

        await this.bot.loadFile([
            './rive/gladosPers/gladosFilter.rive',
        ]);

        this.bot.sortReplies();
    }

    async process(text) {
        return await this.bot.reply(this.username, text);
    }
}