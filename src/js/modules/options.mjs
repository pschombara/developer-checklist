import {Validator} from "./options/validator";
import {ConfirmationPrompt, SuccessPrompt} from "./sweet";
import {OptionsRocketChat} from "./options/rocket.chat";
import {Uuid} from "./options/uuid";
import {Jira} from "./options/jira";
import {Storage} from "./storage";
import {Config} from "./options/config";
import {CheatSheet} from "./options/cheat-sheet";
import {Jenkins} from "./options/jenkins";
import {Modules} from './options/modules';
import {GitLab} from './options/gitLab';
import {Migration} from './migration/migration';

export class Options {
    constructor() {
        this._storage = new Storage();
        this._jira = new Jira();
        this._validator = new Validator();
        this._config = new Config(this._storage, this._validator);
        this._rocketChat = new OptionsRocketChat();
        this._cheatSheet = new CheatSheet();
        this._jenkins = new Jenkins();
        this._gitLab = new GitLab();
        this._modules = new Modules();
        this._migration = new Migration();

        this._templates = {
            cardList: document.querySelector('[data-template="cardList"]'),
            listEntry: document.querySelector('[data-template="listEntry"]'),
        };

        this._buttonRestoreOptions = document.querySelector('[data-default="btn"]');

        this._listTypes = ['developer', 'tester', 'reviewer', 'help']; // todo replace with options
        this._options = {};
    }

    get validator() {
        return this._validator;
    }

    get storage() {
        return this._storage;
    }

    get config() {
        return this._config;
    }

    get options() {
        return this._options;
    }

    set options(options) {
        this._options = options;
    }

    get jenkins() {
        return this._jenkins;
    }

    get cheatSheet() {
        return this._cheatSheet;
    }

    get jira() {
        return this._jira;
    }

    get rocketChat() {
        return this._rocketChat;
    }

    get gitLab() {
        return this._gitLab;
    }

    get modules() {
        return this._modules;
    }

    init() {
        this.storage.loadOptions().then(stored => {
            if (0 === Object.keys(stored).length) {
                this.config.restore().then(stored => {
                    if (this.options.hasOwnProperty('rocketChat')) {
                        stored.rocketChat.userId = this.options.rocketChat.userId;
                        stored.rocketChat.authToken = this.options.rocketChat.authToken;
                    }

                    this.options = stored;
                    this.storage.write('options', stored);
                });
            } else {
                this.options = this._migration.migrate(stored);

                if (this._migration.migrated) {
                    this.storage.write('options', stored);
                }
            }

            create(this).then(() => {
                this.modules.init();
                this.jenkins.init();
                this.cheatSheet.init();
                this.config.init();
                this.gitLab.init();
                this.jira.init();

                this._buttonRestoreOptions.addEventListener('click', () => {
                    ConfirmationPrompt.fire({
                        title: 'Are you sure?',
                        text: "You won't be able to revert this!",
                        confirmButtonText: 'Yes, restore it!',
                    }).then((result) => {
                        if (result.value) {
                            this.config.restore().then(options => {
                                if (this.options.hasOwnProperty('rocketChat')) {
                                    options.rocketChat.userId = this.options.rocketChat.userId;
                                    options.rocketChat.authToken = this.options.rocketChat.authToken;
                                }

                                this.storage.write('options', options);

                                SuccessPrompt.fire({
                                    title: 'Restored!',
                                    text: 'Your options have been restored.',
                                    onClose: () => {
                                        location.reload();
                                    },
                                })
                            });
                        }
                    });
                });

                $('[data-toggle="tooltip"]').tooltip();
                $('[data-toggle="popover"]').popover({
                    trigger: 'hover',
                });
                $('[data-toggle="collapse"]').collapse();
            });
        });
    }

    save(type) {
        this.options.jira = this.jira.save();
        this.options.jenkins = this.jenkins.save();
        this.options.rocketChat = this.rocketChat.options;
        this.options.cheatSheet = this.cheatSheet.save();
        this.options.gitLab = this.gitLab.save();
        this.options.modules = this.modules.save();
        this.options.version = this._migration.currentVersion;

        for (let type of this._listTypes) {
            let items = document.querySelectorAll(`[data-type=${type}][data-items]`);
            let saveLists = {};
            saveLists = this.options.lists[type];

            for (let item of items) {
                let id = item.getAttribute('data-items');
                let inputs = item.querySelectorAll(`[data-item="${id}"]`);
                let deletes = item.querySelectorAll(`[data-delete="${id}"]`);
                let identifiers = item.querySelectorAll(`[data-identifier="${id}"]`);

                saveLists[id - 1].items = [];

                for (let key in inputs) {
                    if (false === deletes[key].checked) {
                        saveLists[id - 1].items.push({
                            text: inputs[key].value,
                            checked: false,
                            id: identifiers[key].value
                        });
                    }
                }

                this.options.lists[type] = saveLists;
            }
        }

        if (false === this.validator.validate(this.options)) {
            return false;
        }

        this.storage.write('options', this.options);

        if ('export' === type) {
            this.config.exportToJson(this.options);
        }

        return true;
    }
}

const createCardList = (op, id, title, items, type) => {
    let temp = op._templates.cardList.innerHTML;
    let cardList = document.querySelector(`[data-accordion="${type}"]`);

    temp = temp.replace(new RegExp('%number%', 'g'), id);
    temp = temp.replace('%name%', title);
    temp = temp.replace(new RegExp('%type%', 'g'), type);

    let elem = document.createElement('div');
    elem.innerHTML = temp;

    cardList.appendChild(elem.children[0]);

    createListEntries(op, id, items, type);

    let addBtn = document.querySelector(`[data-type="${type}"][data-add="${id}"]`);
    addBtn.addEventListener('click', () => {
        createListEntry(op, document.querySelector(`[data-type="${addBtn.getAttribute('data-type')}"][data-items="${id}"]`), {text: '', id: Uuid.generate()}, id);
    });
};

const createListEntries = (op, id, items, type) => {
    let target = document.querySelector(`[data-type="${type}"][data-items="${id}"]`);

    for (let item of items) {
        createListEntry(op, target, item, id);
    }
};

const createListEntry = (op, target, item, id) => {
    let temp = op._templates.listEntry.innerHTML;

    temp = temp.replace(new RegExp('%number%', 'g'), id);
    temp = temp.replace(new RegExp('%identifier%', 'g'), item.id);

    let elem = document.createElement('div');
    elem.innerHTML = temp;
    elem.children[0].querySelector('input').value = item.text;

    target.appendChild(elem.children[0]);
};

const create = (op) => {
    return new Promise(resolve => {
        if (op.options.hasOwnProperty('modules')) {
            op.modules.options = op.options.modules;
        }

        if (op.options.hasOwnProperty('jenkins')) {
            op.jenkins.options = op.options.jenkins;
        }

        if (op.options.hasOwnProperty('gitLab')) {
            op.gitLab.options = op.options.gitLab;
        }

        if (op.options.hasOwnProperty('cheatSheet')) {
            for (let item of op.options.cheatSheet) {
                op.cheatSheet.create(item.label, item.command);
            }
        }

        if (op.options.hasOwnProperty('jira')) {
            op.jira.options = op.options.jira;
        }

        if (op.options.hasOwnProperty('rocketChat')) {
            op.rocketChat.options = op.options.rocketChat;
        }

        // need user action to request permission
        document.querySelector('#rocket-chat-tab').addEventListener('click', () => {
            op.rocketChat.init();
        });

        for (let type of op._listTypes) {
            for (let entry of op.options.lists[type]) {
                createCardList(op, entry.id, entry.title, entry.items, type);
            }
        }

        resolve();
    });
};
