'use strict';

const Notification = (function() {
    const elem = {};
    const queue = [];
    let busy = false;

    function setup() {
        elem.notification = document.getElementById('notification');
        elem.notificationMessage = document.getElementById('notification-message');
    }

    function normal(message) {
        console.log(message);
        enqueue(message, 'normal');
    }

    function warning(message) {
        console.warn(message);
        enqueue(message, 'warning');
    }

    function error(message) {
        console.error(message);
        enqueue(message, 'error');

        const sound = new Audio('sounds/material/04-Secondary-System-Sounds/alert_error-02.mp3');
        sound.play();
    }

    function enqueue(message, type) {
        queue.push({message: message, type: type});
        nextNotification();
    }

    function nextNotification() {
        if (busy || queue.length === 0)
            return;

        busy = true;

        // show notification
        const notification = queue.shift()

        elem.notificationMessage.innerText = notification.message;
        elem.notification.classList.add('visible');
        elem.notificationMessage.classList.add(notification.type);

        // hide notification and show the next one
        setTimeout(() => {
            elem.notification.classList.remove('visible');

            // wait for notification to disappear
            setTimeout(() => {
                elem.notificationMessage.innerText = '';
                elem.notificationMessage.classList.remove(notification.type);

                busy = false;
                nextNotification();
            }, 500);
        }, 4000);
    }

    document.addEventListener('DOMContentLoaded', setup);

    return {
        normal: normal,
        warning: warning,
        error: error,
    };
})();

