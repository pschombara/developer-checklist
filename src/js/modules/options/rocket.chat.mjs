import {SuperRocketChat} from '../super/super.rocket.chat';

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

        let urlTimeout;
        this._inputs.url.addEventListener('change', () => {
            if (null !== urlTimeout) {
                window.clearTimeout(urlTimeout);
            }
            urlTimeout = window.setTimeout(() => {
                this.options.url = this._inputs.url.value;
                this.checkOptions();
            }, 300);
        });
        this._btn.login.addEventListener('click', () => {
            let formData = new FormData(this._form);
            loginWithCredentials(formData.get('_username'), formData.get('_password'), this.options).then(result => {
                if ('success' === result.status) {
                    this.options.userId = result.data.userId;
                    this.options.authToken = result.data.authToken;
                    this.options.authToken = generatePersonalAccessToken(this.options);
                    this._btn.user.classList.remove('btn-danger');
                    this._btn.user.classList.add('btn-success');
                } else {
                    // todo show error message.
                }
            });
        });
    }

    checkOptions() {
        new Promise(resolve => {
            let regexUrl = new RegExp('http(s):\/\/.+');

            if (false === regexUrl.test(url)) {
                resolve(false);
            } else {
                let client = getClient('GET', url + '/api/info');

                client.onreadystatechange = () => {
                    if (XMLHttpRequest.DONE === client.readyState && 200 === client.status) {
                        resolve(true);
                    }
                };
                client.send();
            }
        }).then(result => {
            if (result) {
                return checkIsAuthenticated(this.options);
            } else {
                changeUserBtn(false, this._btn.user);
                this._btn.user.classList.remove('btn-success');
                this._btn.user.classList.add('btn-danger');
                this.options.externalRoom = '';
                this.options.internalRoom = '';
                removeAllOptions(this._inputs.internal);
                removeAllOptions(this._inputs.external);
            }
        }).then(result => {
            if (result.success) {
                changeUserBtn(false, this._btn.user);
                this._btn.user.classList.add('btn-success');
                this._btn.user.classList.remove('btn-danger');

                return getChannelList(this.options);
            } else {
                changeUserBtn(true, this._btn.user);
                this._btn.user.classList.remove('btn-success');
                this._btn.user.classList.add('btn-danger');
            }
        }).then(result => {
            console.log(result);
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
                resolve('success' === response.status ? response.token : '');
            }
        };

        client.send(JSON.stringify({
            tokenName: "JiraDevChecklist"
        }));
    });
};

const getChannelList = (options) => {
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
                    resolve(JSON.parse(client.response));
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
