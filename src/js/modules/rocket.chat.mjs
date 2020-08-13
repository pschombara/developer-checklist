import {SuperRocketChat} from "./super/super.rocket.chat";

export class RocketChat extends SuperRocketChat
{
    constructor() {
        super();

        this._btn = {
            internal: document.querySelector('[data-chat="internal"]'),
            external: document.querySelector('[data-chat="external"]'),
        };

        this._identifier = '';
        this._board = '';
    }

    set identifier(identifier) {
        this._identifier = identifier;
    }

    set board(board) {
        this._board = board;
    }

    init() {
        const attachEventListener = (btn, room, message) => {
            if ('' !== room && '' !== this.options.userId && '' !== this.options.authToken) {
                btn.addEventListener('click', () => {
                   sendMessage(getMessage(room, message, this._identifier, this._board), this._options);
                });
            } else {
                btn.setAttribute('disabled', 'disabled');
            }
        };

        attachEventListener(this._btn.internal, this.options.internalRoom, this.options.internalMessage);
        attachEventListener(this._btn.external, this.options.externalRoom, this.options.externalMessage);
    }
}

const getMessage = (roomId, message, identifier, board) => {
    if ('' !== board) {
        let url = `[${identifier}](${board}/browse/${identifier})`;
        message = message.replace(new RegExp('\{issue\}', 'g'), url);
    } else {
        message = message.replace(new RegExp('\{issue\}', 'g'), identifier);
    }

    return JSON.stringify({
        message: {
            rid: roomId,
            alias: "Checklist",
            emoji: ":heavy_check_mark:",
            msg: message
        }
    });
};

const sendMessage = (data, options) => {
    let client = getClient('POST', options.url + '/api/v1/chat.sendMessage', options);

    client.onreadystatechange = () => {
        if (XMLHttpRequest.DONE === client.readyState) {
            if (200 === client.status) {
                let response = JSON.parse(client.response);

                // use timeout rest api calls are rate limited
                setTimeout(() => {addReaction(response.message._id, 'eyes', options)}, 500);
                setTimeout(() => {addReaction(response.message._id, 'thumbsup', options)}, 1000);
                setTimeout(() => {addReaction(response.message._id, 'thumbsdown', options)}, 1500);
            }
        }
    };

    client.send(data);
};

const addReaction = (messageId, emoji, options) => {
    let client = getClient('POST', options.url + '/api/v1/chat.react', options);

    client.send(JSON.stringify({
        messageId: messageId,
        emoji: emoji,
        shouldReact: true,
    }));
};

const getClient = (method, url, options) => {
    let xHttp = new XMLHttpRequest();

    xHttp.open('POST', url);
    xHttp.setRequestHeader("X-Auth-Token", options.authToken);
    xHttp.setRequestHeader("X-User-Id", options.userId);
    xHttp.setRequestHeader("Content-Type", "application/json");

    return xHttp;
};
