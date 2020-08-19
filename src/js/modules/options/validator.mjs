export class Validator {
    constructor() {
        this.errors = [];
    }

    validate(data) {
        this.errors = [];
        this.addErrors(checkIsObject(data));
        this.addErrors(checkRootSchema(data));

        return 0 === this.errors.length;
    }

    addErrors(errors) {
        if (errors.length > 0) {
            this.errors.push(...errors);
        }
    }

    get htmlErrors() {
        let errors = '';

        for (let error of this.errors) {
            errors += error.err + '<br/>';
        }

        return errors.substr(0, errors.length - 5);
    }
}

const checkLists = (data) => {
    const requiredKeys = ['developer', 'help', 'reviewer', 'tester'];
    const types = {
        developer: 'array',
        help: 'array',
        reviewer: 'array',
        tester: 'array',
    };

    let errors = checkObjectContainsKeys(data, requiredKeys, types, 'lists');

    if (0 !== errors.length) {
        return errors;
    }

    const listKeys = ['id', 'items', 'title'];
    const listTypes = {
        id: 'number',
        items: 'array',
        title: 'string',
    }

    const itemKeys = ['text', 'checked', 'id'];
    const itemTypes = {
        text: 'string',
        checked: 'boolean',
        id: 'string',
    };

    for (let key of requiredKeys) {
        data[key].forEach((obj, entryKey) => {
            errors.push(...checkObjectContainsKeys(obj, listKeys, listTypes, `lists[${key}][${entryKey}]`));

            if (obj.hasOwnProperty('items')) {
                obj.items.forEach((item, itemKey) => {
                    errors.push(...checkObjectContainsKeys(item, itemKeys, itemTypes, `lists[${key}][${entryKey}][items][${itemKey}]`));
                });
            }
        })
    }

    return errors;
}

const checkJenkins = (data) => {
    if (false === Array.isArray(data)) {
        return [{
            err: 'Unsupported type for option jenkins! Expected value is from type array.',
        }];
    }

    const requiredKeys = ['name', 'job', 'type', 'label'];
    const types = {
        name: 'string',
        job: 'string',
        type: 'string',
        label: 'string',
    };

    let errors = [];

    data.forEach((entry, key) => {
        errors.push(...checkObjectContainsKeys(entry, requiredKeys, types, `jenkins[${key}]`));
    });

    return errors;
}

const checkCategories = (data, optionKey) => {
    if (false === Array.isArray(data)) {
        return [{
            err: `Unsupported type for option ${optionKey}! Expected value is from type array.`,
        }];
    }

    let errors = [];

    data.forEach((entry, key) => {
        if ('string' !== typeof entry) {
            errors.push({
                err: `Unsupported type for entry ${optionKey}[${key}]! Expected value from type string.`
            });
        }
    });

    return errors;
}

const checkJenkinsCategories = (data) => {
    return checkCategories(data, 'jenkinsCategories');
}

const checkGitCategories = (data) => {
    return checkCategories(data, 'gitCategories');
}

const checkObjectContainsKeys = (entry, requiredKeys, types, optionKey) => {
    let errors = [];

    if ('object' !== typeof entry) {
        errors.push({
            err: `Unsupported type for entry ${optionKey}! Expected value is from type object.`,
        });
    } else {
        for (let requiredKey of requiredKeys) {
            if (false === entry.hasOwnProperty(requiredKey)) {
                errors.push({
                    err: `Missing key ${requiredKey} for entry ${optionKey}!`,
                });
            } else if ('array' === types[requiredKey]) {
                if (false === Array.isArray(entry[requiredKey])) {
                    errors.push({
                        err: `Unsupported type for entry ${optionKey}[${requiredKey}]! Expected value is from type array`,
                    });
                }
            } else if (types[requiredKey] !== typeof entry[requiredKey]) {
                errors.push({
                    err: `Unsupported type for entry ${optionKey}[${requiredKey}]! Expected value is form type ${types[requiredKey]}`,
                });
            }
        }

        Object.keys(entry).forEach((name) => {
            if (-1 === requiredKeys.indexOf(name)) {
                errors.push({
                    err: `Unknown key ${name} for option ${optionKey}!`
                });
            }
        });
    }

    return errors;
}

const checkGit = (data) => {
    if (false === Array.isArray(data)) {
        return [{
            err: 'Unsupported type for option git! Expected value is from type array.'
        }];
    }

    let errors = [];
    const requiredKeys = ['domain', 'project'];
    const types = {
        domain: 'string',
        project: 'string',
    }

    data.forEach((entry, key) => {
        errors.push(...checkObjectContainsKeys(entry, requiredKeys, types, `git[${key}]`));
    });

    return errors;
}

const checkJira = (data) => {
    const requiredKeys = ['url', 'cleanup', 'maximumIssues', 'boards', 'comments'];
    const types = {
        url: 'string',
        cleanup: 'number',
        maximumIssues: 'number',
        boards: 'array',
        comments: 'object',
    };

    let errors = checkObjectContainsKeys(data, requiredKeys, types, 'jira');

    if (0 !== errors.length) {
        return errors;
    }

    const boardKeys = ['id', 'key'];
    const boardTypes = {
        id: 'number',
        key: 'string',
    };

    data.boards.forEach((entry, key) => {
        errors.push(...checkObjectContainsKeys(entry, boardKeys, boardTypes, `jira[boards][${key}]`))
    });

    const commentKeys = ['develop-success', 'review-failed', 'review-success', 'test-failed', 'test-success',
    ];
    const commentTypes = {
        'develop-success': 'string',
        'review-failed': 'string',
        'review-success': 'string',
        'test-failed': 'string',
        'test-success': 'string',
    }

    errors.push(...checkObjectContainsKeys(data.comments, commentKeys, commentTypes, 'jira[comments]'));

    return errors;
}

const checkRocketChat = (data) => {
    const requiredKeys = [
        'url',
        'authToken',
        'userId',
        'internalRoom',
        'externalRoom',
        'internalMessage',
        'externalMessage',
    ];

    const types = {
        url: 'string',
        authToken: 'string',
        userId: 'string',
        internalRoom: 'string',
        externalRoom: 'string',
        internalMessage: 'string',
        externalMessage: 'string',
    };

    return checkObjectContainsKeys(data, requiredKeys, types, 'rocketChat');
}

const checkCheatSheet = (data) => {
    if (false === Array.isArray(data)) {
        return [{
            err: 'Unsupported type for option cheatSheet! Expected value is from type array.'
        }];
    }

    let errors = [];
    const requiredKeys = ['label', 'command'];
    const types = {
        label: 'string',
        command: 'string',
    }

    data.forEach((entry, key) => {
        errors.push(...checkObjectContainsKeys(entry, requiredKeys, types, `cheatSheet[${key}]`));
    });

    return errors;
}

const checkModules = (data) => {
    const requiredKeys = [
        'jenkins',
        'cheatSheet',
        'rocketChat',
        'gitLab',
    ];

    const types = {
        jenkins: 'boolean',
        cheatSheet: 'boolean',
        rocketChat: 'boolean',
        gitLab: 'boolean',
    };

    return checkObjectContainsKeys(data, requiredKeys, types, 'modules');
};

const check = {
    lists: checkLists,
    jenkins: checkJenkins,
    jenkinsCategories: checkJenkinsCategories,
    git: checkGit,
    gitCategories: checkGitCategories,
    jira: checkJira,
    rocketChat: checkRocketChat,
    cheatSheet: checkCheatSheet,
    modules: checkModules,
}

const checkIsObject = (data) => {
    if ('object' !== typeof data) {
        return [{
            err: 'Format is invalid!'
        }];
    }

    if (0 === Object.keys(data).count) {
        return [{
            err: 'The given Object is empty.'
        }];
    }

    return [];
};

const checkRootSchema = (data) => {
    let errors = [];
    let requiredOptions = ['lists', 'jenkins', 'jenkinsCategories', 'git', 'gitCategories', 'jira', 'rocketChat', 'cheatSheet', 'modules'];

    for (let option of requiredOptions) {
        if (false === data.hasOwnProperty(option)) {
            errors.push({
                err: `Missing option "${option}"!`,
            });
        }
    }

    Object.keys(data).forEach((key) => {
        if (-1 === requiredOptions.indexOf(key)) {
            errors.push({
                err: `Unsupported option "${key}"!`,
            });
        } else {
            errors.push(...check[key](data[key]));
        }
    });

    return errors;
};
