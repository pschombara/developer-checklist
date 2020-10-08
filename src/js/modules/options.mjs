import {Validator} from "./options/validator";
import {ConfirmationPrompt, SuccessPrompt} from "./sweet";
import {OptionsRocketChat} from "./options/rocket.chat";
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

        this._buttonRestoreOptions = document.querySelector('[data-default="btn"]');

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
        // start with clean state
        this.options = {};
        this.options.jira = this.jira.save();
        this.options.jenkins = this.jenkins.save();
        this.options.rocketChat = this.rocketChat.options;
        this.options.cheatSheet = this.cheatSheet.save();
        this.options.gitLab = this.gitLab.save();
        this.options.modules = this.modules.save();
        this.options.version = this._migration.currentVersion;

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

        resolve();
    });
};
