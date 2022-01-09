'use strict';

/**
 * Base class for personalities
 */
class AbstractPersonality {
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
        return true;
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