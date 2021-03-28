import {SuperChat} from '../super/super.chat.mjs';

export class Google extends SuperChat {
    constructor() {
        super('Google Chat', 'google');
    }

    send(roomId, messageId) {
        return new Promise((resolve, reject) => {
            const request = new XMLHttpRequest();

            const room = this.options.rooms[roomId];
            const message = this.options.messages[messageId];

            request.open('POST', room.url);

            request.onreadystatechange = () => {
                if (XMLHttpRequest.DONE === request.readyState) {
                    console.log(request.status, request.response);
                    if (200 === request.status) {
                        resolve();
                    } else {
                        reject(request.response);
                    }
                }
            };

            request.setRequestHeader('Content-Type', 'application/json; charset=utf-8');

            request.send(this.formatMessage(message));
        });
    }

    formatMessage(message) {
        let formattedMessage = message.content;


        // todo issue list


        return JSON.stringify({
            text: formattedMessage,
            cards: [
                {
                    header: {
                        title: "Test",
                    },
                    sections: [
                        {
                            widgets: [
                                {
                                    textParagraph: {
                                        text: "Test 123"
                                    }
                                }
                            ],
                        }
                    ],
                }
            ]
        });
    }
}
