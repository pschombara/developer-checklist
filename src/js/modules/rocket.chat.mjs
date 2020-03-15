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
    }

    set identifier(identifier) {
        this._identifier = identifier;
    }

    init() {
        if ('' !== this.options.internalRoom) {
            this._btn.internal.addEventListener('click', () => {
                sendMessage(JSON.stringify({
                    "message": {
                        "rid": this.options.internalRoom,
                        "alias": "Checklist",
                        "emoji": "heavy_check_mark",
                        "msg": "@here team planning for issue " + this._identifier + '!?',
                    }
                }), this.options);
            });
        } else {
           this._btn.internal.setAttribute('disabled', 'disabled');
        }

        if ('' !== this.options.externalRoom) {
            this._btn.external.addEventListener('click', () => {
                sendMessage(JSON.stringify({
                    "message": {
                        "rid": this.options.externalRoom,
                        "msg": "@here team planning for issue " + this._identifier,
                    }
                }), this.options);
            });
        } else {
           this._btn.external.setAttribute('disabled', 'disabled');
        }
    }
}

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
            console.log(client.status, client.response);
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


// xhttp.open("GET", "https://rocketchat.saitow.ag/api/v1/rooms.get", true);
// xhttp.setRequestHeader("X-Auth-Token", "OgX7FXyYVhTEA4yzLIt89ya_aI8avrp2LDO_O0aIFua");
// xhttp.setRequestHeader("X-User-Id", "nqjxnBxLfP6vrvAqe");
// xhttp.setRequestHeader("Content-Type", "application/json");
// xhttp.onreadystatechange = function () {
// if (xhttp.readyState === 4 && xhttp.status === 200) {
//       // var json = JSON.parse(xhttp.responseText);
//       // console.log(json.email + ", " + json.password);
//       console.log(xhttp.responseText);
//     }
// };
// //var data = JSON.stringify({"user": "checklist", "password": "letMeInRoger"});
// xhttp.send();
// "OgX7FXyYVhTEA4yzLIt89ya_aI8avrp2LDO_O0aIFua" = X AUTH personal
// user_id = nqjxnBxLfP6vrvAqe
// room id internal = CkJdMjtN4ycaJ4J3K
// room_id bdev 3 = iM3fvccnvWR8QLuPo
// var xhttp = new XMLHttpRequest();
