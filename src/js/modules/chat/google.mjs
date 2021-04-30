import {SuperChat} from '../super/super.chat.mjs';

export class Google extends SuperChat {
    constructor() {
        super('Google Chat', 'google');
    }

    send(roomId, messageId, issueList) {
        return new Promise((resolve, reject) => {
            const request = new XMLHttpRequest();

            const room = this.options.rooms[roomId];
            const message = this.options.messages[messageId];

            request.open('POST', room.url);

            request.onreadystatechange = () => {
                if (XMLHttpRequest.DONE === request.readyState) {
                    if (200 === request.status) {
                        resolve();
                    } else {
                        reject(request.response);
                    }
                }
            };

            request.setRequestHeader('Content-Type', 'application/json; charset=utf-8');

            request.send(this.formatMessage(message, issueList));
        });
    }

    formatMessage(message, issueList) {
        let formattedMessage = {
            text: message.content,
        };

        if (issueList.length > 0) {
            formattedMessage.cards = [
                {
                    header: {
                        title: 'Issues',
                    },
                    sections: [
                        {
                            widgets: [],
                        }
                    ],
                }
            ];
        }

        for (let issue of issueList) {
            formattedMessage.cards[0].sections[0].widgets.push({
                buttons: {
                    textButton: {
                        text: issue.text,
                        onClick: {
                            openLink: {
                                url: issue.url,
                            },
                        },
                    },
                },
            });
        }

        return JSON.stringify(formattedMessage);
    }
}
