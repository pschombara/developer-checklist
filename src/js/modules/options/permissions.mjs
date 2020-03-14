export class Permissions {
    constructor() {
    }

    static request(url) {
        return new Promise(resolve => {
            chrome.permissions.request({
                origins: [ url ]
            }, (granted) => {
                resolve(true === granted);
            });
        });
    }

    static check(url) {
        return new Promise(resolve => {
            chrome.permissions.contains({
                origins: [ url ]
            }, (granted) => {
                resolve(true === granted);
            });
        });
    }
}
