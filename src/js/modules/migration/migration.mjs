import {SuperMigration} from './super-migration';
import {Uuid} from '../options/uuid';
import {StorageChecklist} from './storage-checklist';

export class Migration extends SuperMigration {
    constructor() {
        super();
        this._migrations = {
            '0.3.1': migrateTo0_4_0,
            '0.4.0': '0.4.1',
            '0.4.1': '0.4.2',
            '0.4.2': migrateTo0_5_0,
        };

        this._storageMigration = new StorageChecklist();
    }

    migrate(options) {
        if (false === options.hasOwnProperty('version')) {
            options.version = '0.3.1';
        }

        if (options.version !== this.currentVersion) {
            Object.keys(this._migrations).forEach((version) => {
                if (options.version === version) {
                    if ('function' === typeof this._migrations[version]) {
                        this._migrations[version](options);
                    } else if ('string' === typeof this._migrations['version']) {
                        options.version = this._migrations[version];
                    }
                }
            });

            // Finally set to new version
            options.version = this.currentVersion;
            this.migrated = true;
        }

        this._storageMigration.migrate();

        return options;
    }
}

const migrateTo0_4_0 = (options) => {
    options.version = '0.4.0';

    options.gitLab = {
        host: '',
        projects: [],
        categories: []
    };

    if (options.hasOwnProperty('git')) {
        options.gitLab.projects = options.git;
        delete options.git;
    }

    if (options.hasOwnProperty('gitCategories')) {
        options.gitLab.categories = options.gitCategories;
        delete options.gitCategories;
    }

    options.modules = {
        jenkins: true,
        cheatSheet: true,
        rocketChat: true,
        gitLab: true
    };

    const jenkins = {
        host: '',
        builds: [],
        categories: [],
    };

    if (options.hasOwnProperty('jenkins') && Array.isArray(options.jenkins)) {
        jenkins.builds = options.jenkins;
    }

    if (options.hasOwnProperty('jenkinsCategories')) {
        jenkins.categories = options.jenkinsCategories;

        delete options.jenkinsCategories;
    }

    options.jenkins = jenkins;
};

const migrateTo0_5_0 = (options) => {
    options.version = '0.5.0';

    const checklists = {
        0: {
            name: 'developer',
            enabled: true,
            icon: 'fas fa-keyboard',
            successRequiredAll: false,
            buttons: {
                success: {
                    text: 'Finish',
                    enabled: true,
                    comment: '',
                    autoComment: true
                },
                failed: {
                    text: '',
                    enabled: false,
                    comment: '',
                    autoComment: false
                }
            },
            checklist: []
        },
        1: {
            name: 'tester',
            enabled: true,
            icon: 'fas fa-gamepad',
            successRequiredAll: false,
            buttons: {
                success: {
                    text: 'Test OK',
                    enabled: true,
                    comment: '',
                    autoComment: true
                },
                failed: {
                    text: 'Test Failed',
                    enabled: true,
                    comment: '',
                    autoComment: false
                }
            },
            checklist: []
        },
        2: {
            name: 'reviewer',
            enabled: true,
            icon: 'fas fa-bug',
            successRequiredAll: false,
            buttons: {
                success: {
                    text: 'Review OK',
                    enabled: true,
                    comment: '',
                    autoComment: true
                },
                failed: {
                    text: 'Review Failed',
                    enabled: true,
                    comment: '',
                    autoComment: false
                }
            },
            checklist: []
        },
        3: {
            name: 'help',
            enabled: true,
            icon: 'fas fa-question-circle',
            successRequiredAll: false,
            buttons: {
                success: {
                    text: '',
                    enabled: false,
                    comment: '',
                    autoComment: false
                },
                failed: {
                    text: '',
                    enabled: false,
                    comment: '',
                    autoComment: false
                }
            },
            checklist: []
        },
        4: {
            name: '',
            enabled: false,
            icon: '',
            successRequiredAll: false,
            buttons: {
                success: {
                    text: '',
                    enabled: false,
                    comment: '',
                    autoComment: false
                },
                failed: {
                    text: '',
                    enabled: false,
                    comment: '',
                    autoComment: false
                }
            },
            checklist: []
        }
    };

    if (options.hasOwnProperty('lists')) {
        if (options.lists.hasOwnProperty('developer')) {
            checklists[0].checklist = options.lists.developer;
        }

        if (options.lists.hasOwnProperty('tester')) {
            checklists[1].checklist = options.lists.tester;
        }

        if (options.lists.hasOwnProperty('reviewer')) {
            checklists[2].checklist = options.lists.reviewer;
        }

        if (options.lists.hasOwnProperty('help')) {
            checklists[3].checklist = options.lists.help;
        }

        delete options.lists;
    }

    if (options.hasOwnProperty('jira') && options.jira.hasOwnProperty('comments')) {
        if (options.jira.comments.hasOwnProperty('develop-success')) {
            checklists[0].buttons.success.comment = options.jira.comments['develop-success'];
        }

        if (options.jira.comments.hasOwnProperty('test-success')) {
            checklists[1].buttons.success.comment = options.jira.comments['test-success'];
        }

        if (options.jira.comments.hasOwnProperty('test-failed')) {
            checklists[1].buttons.failed.comment = options.jira.comments['test-failed'];
        }

        if (options.jira.comments.hasOwnProperty('review-success')) {
            checklists[2].buttons.success.comment = options.jira.comments['review-success'];
        }

        if (options.jira.comments.hasOwnProperty('review-failed')) {
            checklists[2].buttons.failed.comment = options.jira.comments['review-failed'];
        }

        delete options.jira.comments;
    }

    Object.keys(checklists).forEach(key => {
       for (let category of checklists[key].checklist) {
           category.uid = Uuid.generate();
           delete category.id;

           for (let item of category.items) {
               delete item.checked;
           }
       }
    });

    options.jira.checklists = checklists;

    options.modules['chat'] = false;
    options.chat = {
        rocket: {
            enabled: options.modules['rocketChat'],
            rooms: {
                'fc8f6d32-dcde-486f-a07c-8e1604e022b4': {
                    name: 'internal',
                    url: options.rocketChat.internalRoom,
                },
                'a6676206-adc4-4863-bcee-789b71a177d8': {
                    name: 'external',
                    url: options.rocketChat.externalRoom,
                }
            },
            messages: {},
            url: options.rocketChat.url,
            authToken: options.rocketChat.authToken,
            userId: options.rocketChat.userId
        },
        google: {
            enabled: false,
            rooms: {},
            messages: {}
        },
        discord: {
            enabled: false,
            rooms: {},
            messages: {}
        }
    }

    for (let type of ['internal', 'external']) {
        if ('' !== options.rocketChat[`${type}Room`]) {
            options.chat.rocket.rooms[Uuid.generate()] = {
                name: type,
                url: options.rocketChat[`${type}Room`],
            }
        }

        if ('' !== options.rocketChat[`${type}Message`]) {
            options.chat.rocket.rooms[Uuid.generate()] = {
                name: type,
                message: options.rocketChat[`${type}Message`],
            }
        }
    }

    delete options.modules['googleChat'];
    delete options.modules['rocketChat'];
    delete options.rocketChat;
};
