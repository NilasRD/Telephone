'use strict';

class ChatbotTemplate extends AbstractChatbot {
    async setup() {
        this.bot = new RiveScript();

        await this.bot.loadFile([
            './rive/myBot/myBot.rive',
        ]);

        this.bot.sortReplies();
    }

    async process(text) {
        let result = await this.bot.reply(this.username, text);
        return result;
    }
}