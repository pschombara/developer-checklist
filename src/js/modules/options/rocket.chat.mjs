import {SuperRocketChat} from '../super/super.rocket.chat';
import {Permissions} from "./permissions";

export class OptionsRocketChat extends SuperRocketChat{
    constructor() {
        super();

        this._inputs = {
            url: document.querySelector('#rc-url'),
            internal: document.querySelector('#rc-channel-internal'),
            external: document.querySelector('#rc-channel-external'),
        };

        this._btn = {
            user: document.querySelector('[data-rc-user]'),
            login: document.querySelector('#rc-btn-login'),
        };

        this._modal = document.querySelector('#rc-modal-user');
        this._form = document.querySelector('#rc-login');

        this._channels = {};
    }

    init() {
        this.checkOptions();

        this._inputs.url.addEventListener('focusout', () => {
            this.options.url = this._inputs.url.value;
            this.checkOptions();
        });

        this._btn.login.addEventListener('click', () => {
            let formData = new FormData(this._form);
            loginWithCredentials(formData.get('_username'), formData.get('_password'), this.options).then(result => {
                if ('success' === result.status) {
                    this.options.userId = result.data.userId;
                    this.options.authToken = result.data.authToken;
                    generatePersonalAccessToken(this.options).then(result => {
                        this.options.authToken = result;
                    });
                    this._btn.user.classList.remove('btn-danger');
                    this._btn.user.classList.add('btn-success');
                    changeUserBtn(false, this._btn.user);
                } else {
                    // todo show error message.
                }
            });
        });
    }

    checkOptions() {
        let checkUrl = new Promise(resolve => {
            let regexUrl = new RegExp('http(s):\/\/.+');

            if (false === regexUrl.test(this.options.url)) {
                this.options.url = '';
                resolve(false);
            } else {
                resolve(true);
            }
        });

        let checkPermissionAvailable = Permissions.check(this.options.url + '/api/*');
        let requestPermission = Permissions.request(this.options.url + '/api/*');

        let checkIsRocketChat = new Promise(resolve => {
            let client = getClient('GET', this.options.url + '/api/info');

            client.onreadystatechange = () => {
                if (XMLHttpRequest.DONE === client.readyState) {
                    if (200 === client.status) {
                        this._inputs.url.value = this.options.url;
                        resolve(true);
                    } else {
                        resolve(false);
                    }
                }
            };
            client.send();
        });

        let checkCredentials = checkIsAuthenticated(this.options);
        let requestChannels = getRoomList(this.options);

        checkUrl.then(result => {
            if (result) {
                return checkPermissionAvailable;
            } else {
                return false;
            }
        }).then(result => {
            if (result) {
                return requestPermission;
            } else {
                return false;
            }
        }).then(result => {
            if (result) {
                return checkIsRocketChat;
            } else {
                return false;
            }
        }).then(result => {
            if (result) {
                return checkCredentials;
            } else {
                changeUserBtn(false, this._btn.user);
                this._btn.user.classList.remove('btn-success');
                this._btn.user.classList.add('btn-danger');
                this.options.externalRoom = '';
                this.options.internalRoom = '';
                removeAllOptions(this._inputs.internal);
                removeAllOptions(this._inputs.external);

                return false;
            }
        }).then(result => {
            if (result) {
                changeUserBtn(false, this._btn.user);
                this._btn.user.classList.add('btn-success');
                this._btn.user.classList.remove('btn-danger');

                return requestChannels;
            } else {
                changeUserBtn(true, this._btn.user);
                this._btn.user.classList.remove('btn-success');
                this._btn.user.classList.add('btn-danger');

                return false;
            }
        }).then(result => {
            if ('object' === typeof result && result.success) {

            }
        });
    }
}

const removeAllOptions = (selectBox) => {
    for (let option of selectBox.children) {
        if ('-1' !== option.value) {
            selectBox.removeChild(option);
        }
    }
};

const changeUserBtn = (valid, btn) => {
    if (valid) {
        btn.removeAttribute('disabled');
    } else {
        btn.setAttribute('disabled', 'disabled');
    }
};

const loginWithCredentials = (username, password, options) => {
    return new Promise(resolve => {
        let client = getClient('POST', options.url + '/api/v1/login');

        client.onreadystatechange = () => {
            if (XMLHttpRequest.DONE === client.readyState) {
                resolve(JSON.parse(client.response));
            }
        };

        client.send(JSON.stringify({
            user: username,
            password: password
        }));
    });
};

const generatePersonalAccessToken = (options) => {
    return new Promise(resolve => {
        let client = getClient('POST', options.url + '/api/v1/users.generatePersonalAccessToken');

        clientSetAuth(client, options);

        client.onreadystatechange = () => {
            if (XMLHttpRequest.DONE === client.readyState) {
                let response = JSON.parse(client.response);
                resolve(response.success ? response.token : '');
            }
        };

        client.send(JSON.stringify({
            tokenName: "JiraDevChecklist"
        }));
    });
};

const getRoomList = (options) => {
    return new Promise(resolve => {
        let client = getClient('GET', options.url + '/api/v1/rooms.get');

        clientSetAuth(client, options);

        client.onreadystatechange = () => {
            if (XMLHttpRequest.DONE === client.readyState) {
                resolve(JSON.parse(client.response));
            }
        };

        client.send();
    });
};

const checkIsAuthenticated = (options) => {
    return new Promise(resolve => {
        if ('' === options.userId || '' === options.authToken) {
            resolve({success: false});
        } else {
            let client = getClient('GET', options.url + '/api/v1/me');

            clientSetAuth(client, options);

            client.onreadystatechange = () => {
                if (XMLHttpRequest.DONE === client.readyState) {
                    let response = JSON.parse(client.response);
                    resolve(response.hasOwnProperty('success') ? response.success : false);
                }
            };

            client.send();
        }
    });
};

const clientSetAuth = (client, options) => {
    client.setRequestHeader('X-Auth-Token', options.authToken);
    client.setRequestHeader('X-User-Id', options.userId);
};

const getClient = (method, url) => {
    let xhttp = new XMLHttpRequest();

    xhttp.open(method, url, true);
    xhttp.setRequestHeader("Content-Type", "application/json");

    return xhttp;
};
