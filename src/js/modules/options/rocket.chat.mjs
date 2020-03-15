import {SuperRocketChat} from '../super/super.rocket.chat';
import {Permissions} from "./permissions";
import {Toast} from "../sweet";

export class OptionsRocketChat extends SuperRocketChat{
    constructor() {
        super();

        this._inputs = {
            url: document.querySelector('#rc-url'),
            internal: document.querySelector('#rc-channel-internal'),
            external: document.querySelector('#rc-channel-external'),
            internalMessage: document.querySelector('#rc-message-internal'),
            externalMessage: document.querySelector('#rc-message-external'),
        };

        this._btn = {
            user: document.querySelector('[data-rc-user]'),
            login: document.querySelector('#rc-btn-login'),
            modalDismiss: document.querySelector('#rc-modal-dismiss')
        };

        this._form = document.querySelector('#rc-login');
        this._datalist = document.querySelector('#rc-rooms');
    }

    init() {
        this._inputs.internalMessage.value = this.options.internalMessage;
        this._inputs.externalMessage.value = this.options.externalMessage;

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
                        getRoomList(this.options).then(result => {
                            if ('object' === typeof result && result.success) {
                                this.createRooms(result.update);
                            }
                        });
                    });
                    this._btn.user.classList.remove('btn-danger');
                    this._btn.user.classList.add('btn-success');
                    changeUserBtn(false, this._btn.user);
                    this._form.reset();
                    this._btn.modalDismiss.click();
                } else {
                    Toast.fire({
                        icon: 'error',
                        title: 'Authentication failure!'
                    });
                }
            });
        });

        const getRoomId = (input) => {
            let option = this._datalist.querySelector(`option[value="${input.value}"]`);

            if (null !== option) {
                return option.getAttribute('data-id');
            }

            return '';
        };

        this._inputs.internal.addEventListener('change', () => {
            this.options.internalRoom = getRoomId(this._inputs.internal);
        });

        this._inputs.external.addEventListener('change', () => {
            this.options.externalRoom = getRoomId(this._inputs.external);
        });

        this._inputs.internalMessage.addEventListener('change', () => {
            this.options.internalMessage = this._inputs.internalMessage.value;
        });

        this._inputs.externalMessage.addEventListener('change', () => {
            this.options.externalMessage = this._inputs.externalMessage.value;
        });
    }

    createRooms(rooms) {
        for (let room of rooms) {
            if (room.hasOwnProperty('name') && room.hasOwnProperty('_id')) {
                let option = document.createElement('option');
                option.value = room.name;
                option.setAttribute('data-id', room._id);

                this._datalist.appendChild(option);
            }
        }

        if ('' !== this.options.internalRoom) {
            setDatalistValue(this._datalist, this.options.internalRoom, this._inputs.internal)
        }

        if ('' !== this.options.externalRoom) {
            setDatalistValue(this._datalist, this.options.externalRoom, this._inputs.external)
        }
    }

    checkOptions() {
        let checkUrl = () => new Promise(resolve => {
            let regexUrl = new RegExp('http(s):\/\/.+');

            if (false === regexUrl.test(this.options.url)) {
                this.options.url = '';
                resolve(false);
            } else {
                resolve(true);
            }
        });

        let checkIsRocketChat = () => new Promise(resolve => {
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

        checkUrl().then(result => {
            if (result) {
                return Permissions.check(this.options.url + '/api/*');
            } else {
                return false;
            }
        }).then(result => {
            if (false === result) {
                return Permissions.request(this.options.url + '/api/*');
            } else {
                return true;
            }
        }).then(result => {
            if (result) {
                return checkIsRocketChat();
            } else {
                return false;
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

                return false;
            }
        }).then(result => {
            if (result) {
                changeUserBtn(false, this._btn.user);
                this._btn.user.classList.add('btn-success');
                this._btn.user.classList.remove('btn-danger');

                return getRoomList(this.options);
            } else {
                changeUserBtn(true, this._btn.user);
                this._btn.user.classList.remove('btn-success');
                this._btn.user.classList.add('btn-danger');

                return false;
            }
        }).then(result => {
            if ('object' === typeof result && result.success) {
                this.createRooms(result.update);
            }
        });
    }
}

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

const generatePersonalAccessToken = (options, count = 1) => {
    return new Promise(resolve => {
        let client = getClient('POST', options.url + '/api/v1/users.generatePersonalAccessToken');

        clientSetAuth(client, options);

        client.onreadystatechange = () => {
            if (XMLHttpRequest.DONE === client.readyState) {
                if (1 === count && 400 === client.status) {
                    removePersonalAccessToken(options).then(result => {
                       if (result) {
                           return generatePersonalAccessToken(options, 2);
                       } else {
                           resolve('');
                       }
                    }).then(result => {
                        resolve(result);
                    });
                } else {
                    let response = JSON.parse(client.response);
                    resolve(response.success ? response.token : '');
                }
            }
        };

        client.send(JSON.stringify({
            tokenName: "JiraDevChecklist"
        }));
    });
};

const removePersonalAccessToken = (options) => {
    return new Promise(resolve => {
        let client = getClient('POST', options.url + '/api/v1/users.removePersonalAccessToken');

        clientSetAuth(client, options);

        client.onreadystatechange = () => {
            if (XMLHttpRequest.DONE === client.readyState) {
                let response = JSON.parse(client.response);
                resolve(response.success);
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

const setDatalistValue = (datalist, id, input) => {
    let option = datalist.querySelector(`option[data-id="${id}"]`);

    if (null !== option) {
        input.value = option.value;
    }
};
