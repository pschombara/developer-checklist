export class Migration {
    constructor() {
        this._currentVersion = '0.4.1';
        this._migrations = {
            '0.3.1': migrateTo0_0_4,
        };
        this._migrated = false;
    }

    get migrated() {
        return this._migrated;
    }

    get currentVersion() {
        return this._currentVersion;
    }

    migrate(options) {
        if (false === options.hasOwnProperty('version')) {
            options.version = '0.3.1';
        }

        if (options.version !== this._currentVersion) {
            Object.keys(this._migrations).forEach((version) => {
                if (options.version === version) {
                    this._migrations[version](options);
                    this._migrated = true;
                }
            });
        }

        return options;
    }
}

const migrateTo0_0_4 = (options) => {
    options.version = '0.4.0';

    options.gitLab = {
        host: "",
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
}
