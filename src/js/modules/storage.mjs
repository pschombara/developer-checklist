export let cleanUpDays = 6;

export function loadOptions() {
    return new Promise((resolve => {
        chrome.storage.local.get('options', (stored) => {
            if (undefined === stored.options) {
                resolve({});
            } else {
                resolve(stored.options);
            }
        });
    }));
}

export function loadIssue(identifier) {
    return new Promise(resolve => {
        chrome.storage.local.get(identifier, (stored) => {
            if (undefined === stored[identifier]) {
                resolve([]);
            } else {
                resolve(stored[identifier]);
            }
        });
    });
}

export function loadIdentifiers() {
    let regexIssue = new RegExp('\\w+-\\d+');

    return new Promise(resolve => {
        chrome.storage.local.get(null, (items) => {
            let identifiers = [];

            Object.keys(items).forEach((key) => {
                if (regexIssue.test(key)) {
                    identifiers.push({
                        key: key,
                        title: items[key].title ? items[key].title : '',
                        date: items[key].updateDate
                    });
                }
            });

            identifiers.sort((a, b) => {
                return b.date - a.date;
            });

            // sort by date desc

            resolve(identifiers);
        });
    });
}

export function cleanUp() {
    chrome.storage.local.get(null, (items) => {
        let currentDate = Math.floor(Date.now() / 1000);
        let pattern = new RegExp("\\w+-\\d+");

        Object.keys(items).forEach((key) => {
            if (pattern.test(key)) {
                let date = items[key].hasOwnProperty('updateDate') ? items[key].updateDate : 0;

                if (currentDate - date > cleanUpDays * 86400) {
                    chrome.storage.local.remove(key);
                }
            }
        });
    })
}

export function write(identifier, data) {
    let obj = {};

    obj[identifier] = data;

    chrome.storage.local.set(obj);
}
