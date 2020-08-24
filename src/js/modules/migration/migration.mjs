import {SuperMigration} from './super-migration';

export class Migration extends SuperMigration {
    constructor() {
        super();
        this._migrations = {
            '0.3.1': migrateTo0_4_0,
            '0.4.0': migrateTo0_5_0,
        };
    }

    migrate(options) {
        if (false === options.hasOwnProperty('version')) {
            options.version = '0.3.1';
        }

        if (options.version !== this.currentVersion) {
            Object.keys(this._migrations).forEach((version) => {
                if (options.version === version) {
                    this._migrations[version](options);
                }
            });

            // Finally set to new version
            options.version = this.currentVersion;
            this.migrated = true;
        }

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

    const checklists = [
        {
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
        {
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
        {
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
        {
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
                    enabled: true,
                    comment: '',
                    autoComment: false
                }
            },
            checklist: []
        },
        {
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
                    enabled: true,
                    comment: '',
                    autoComment: false
                }
            },
            checklist: []
        }
    ];

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
        if (options.jira.comments.hasOwnProperty('developer-success')) {
            checklists[0].buttons.success.comment = jira.comments['developer-success'];
        }

        if (options.jira.comments.hasOwnProperty('tester-success')) {
            checklists[1].buttons.success.comment = jira.comments['tester-success'];
        }

        if (options.jira.comments.hasOwnProperty('tester-failed')) {
            checklists[1].buttons.failed.comment = jira.comments['tester-failed'];
        }

        if (options.jira.comments.hasOwnProperty('reviewer-success')) {
            checklists[2].buttons.success.comment = jira.comments['reviewer-success'];
        }

        if (options.jira.comments.hasOwnProperty('reviewer-failed')) {
            checklists[2].buttons.failed.comment = jira.comments['reviewer-failed'];
        }

        delete options.jira.comments;
    }

    options.jira.checklists = checklists;
};
