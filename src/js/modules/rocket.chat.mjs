import {SuperRocketChat} from "./super/super.rocket.chat";

export class RocketChat extends SuperRocketChat
{
    constructor() {
        super();
    }

    createInternalMessage(identifier) {
        sendMessage(JSON.stringify({
            "message": {
                "rid": this._options.internalRoom,
                "msg": "@here team planning for issue " + identifier + '!?',
            }
        }), this._options);
    }

    createExternalMessage(identifier) {
        sendMessage(JSON.stringify({
            "message": {
                "rid": this._options.externalRoom,
                "msg": "@here team planning for issue " + identifier + '!?',
            }
        }), this._options);
    }
}

const sendMessage = (data, options) => {
    let xhttp = new XMLHttpRequest();

    xhttp.open('POST', options.url + '/api/v1/chat.sendMessage');
    xhttp.setRequestHeader("X-Auth-Token", options.authToken);
    xhttp.setRequestHeader("X-User-Id", options.userId);
    xhttp.setRequestHeader("Content-Type", "application/json");

    xhttp.onreadystatechange = () => {
        if (XMLHttpRequest.DONE === xhttp.readyState) {
            console.log(xhttp.status, xhttp.response);
        }
    };

    xhttp.send(data);
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
