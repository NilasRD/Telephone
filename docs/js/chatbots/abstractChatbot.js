'use strict';

/**
 * Base class for personalities
 */
class AbstractChatbot {
    username = 'human';
    bot = null;

    /**
     * @param {string | null} name
     */
    constructor(name = null) {
        if (name != null) {
            this.name = name;
        }

        this.setup();
    }

    /**
     * Empty method that can be overriden by child-classes
     */
    async setup() {
        this.bot = new RiveScript();
    }

    /**
     * Process an entire process or sentence
     * @param {string} text
     * @return {Promise}
     */
    async process(text) {
        return text;
    }
}