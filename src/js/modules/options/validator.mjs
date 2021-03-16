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

const checkChecklistsBtn = (data, key) => {
    const requiredKeys = ['success', 'failed'];
    const types = {
        success: 'object',
        failed: 'object',
    };

    let errors = checkObjectContainsKeys(data, requiredKeys, types, key);

    if (0 !== errors.length) {
        return errors;
    }

    return errors;
};

const checkChecklists = (data, key, enabled, parentKey) => {
    let errors = [];

    const listKeys = ['items', 'title', 'uid'];
    const listTypes = {
        items: 'array',
        title: 'string',
        uid: 'string',
    }

    const itemKeys = ['text', 'id'];
    const itemTypes = {
        text: 'string',
        id: 'string',
    };

    errors.push(...checkObjectContainsKeys(data, listKeys, listTypes, `${key}`));

    if (data.hasOwnProperty('items')) {
        data.items.forEach((item, itemKey) => {
            errors.push(...checkObjectContainsKeys(item, itemKeys, itemTypes, `${key}[items][${itemKey}]`));
        });

        if (enabled && 0 === data.items.length) {
            errors.push({
                err: `jira[checklists][${parentKey}] is enabled but ${key}[items] has no entries!`
            })
        }
    }

    return errors;
};

const checkJira = (data) => {
    const requiredKeys = ['url', 'cleanup', 'maximumIssues', 'boards', 'checklists'];
    const types = {
        url: 'string',
        cleanup: 'number',
        maximumIssues: 'number',
        boards: 'array',
        checklists: 'object',
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

    const checklistsKeys = ['name', 'enabled', 'icon', 'successRequiredAll', 'buttons', 'checklist'];
    const checklistsTypes = {
        name: 'string',
        enabled: 'boolean',
        icon: 'string',
        successRequiredAll: 'boolean',
        buttons: 'object',
        checklist: 'array',
    };

    Object.keys(data.checklists).forEach(key => {
        errors.push(...checkObjectContainsKeys(data.checklists[key], checklistsKeys, checklistsTypes, `jira[checklists][${key}]`));

        if (0 === errors.length) {
            errors.push(...checkChecklistsBtn(data.checklists[key].buttons, `jira[checklists][${key}][buttons]`));

            data.checklists[key].checklist.forEach((category, entryKey) => {
                errors.push(...checkChecklists(category, `jira[checklists][${key}][checklist][${entryKey}]`, data.checklists[key].enabled, key));
            });

            if (data.checklists[key].enabled && 0 === data.checklists[key].checklist.length) {
                errors.push({err: `jira[checklists][${key}] is enabled but has no checklist entry!`});
            }
        }
    });

    return errors;
};

const checkChat = data => {
 // todo
    return [];
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
};

const checkGoogleChat = (data) => {
    const requiredKeys = [
        'rooms',
        'messages',
    ];

    const types = {
        rooms: 'object',
        messages: 'object',
    }

    return checkObjectContainsKeys(data, requiredKeys, types, 'googleChat');
};

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
};

const checkModules = (data) => {
    const requiredKeys = [
        'jenkins',
        'cheatSheet',
        'chat',
        'gitLab',
    ];

    const types = {
        jenkins: 'boolean',
        cheatSheet: 'boolean',
        chat: 'boolean',
        gitLab: 'boolean',
    };

    return checkObjectContainsKeys(data, requiredKeys, types, 'modules');
};

const checkGitLab = (data) => {
    let errors = [];

    const requiredKeys = [
        'host',
        'projects',
        'categories',
    ];

    const types = {
        host: 'string',
        projects: 'array',
        categories: 'array',
    };

    errors.push(...checkObjectContainsKeys(data, requiredKeys, types, 'gitLab'));

    if (0 !== errors.length) {
        return errors;
    }

    errors.push(...checkCategories(data.categories, 'gitLab[categories]'));

    const projectRequiredKeys = ['domain', 'project'];
    const projectTypes = {
        domain: 'string',
        project: 'string',
    }

    data.projects.forEach((entry, key) => {
        errors.push(...checkObjectContainsKeys(entry, projectRequiredKeys, projectTypes, `gitLab[projects][${key}]`));
    });

    return errors;
};

const checkJenkins = (data) => {
    let errors = [];

    const requiredKeys = [
        'host',
        'builds',
        'categories',
    ];

    const types = {
        host: 'string',
        builds: 'array',
        categories: 'array',
    };

    errors.push(...checkObjectContainsKeys(data, requiredKeys, types, 'jenkins'));

    if (0 !== errors.length) {
        return errors;
    }

    errors.push(...checkCategories(data.categories, 'jenkins[categories]'));

    const buildRequiredKeys = ['job', 'label', 'name', 'type'];
    const buildTypes = {
        job: 'string',
        label: 'string',
        name: 'string',
        type: 'string',
    }

    data.builds.forEach((entry, key) => {
        errors.push(...checkObjectContainsKeys(entry, buildRequiredKeys, buildTypes, `jenkins[builds][${key}]`));
    });

    return errors;
}

const checkVersion = (data) => {
    if ('string' !== typeof data) {
        return [{
            err: 'Unsupported type for option version! Expected value is from type string.'
        }];
    }

    return [];
}

const check = {
    jenkins: checkJenkins,
    jira: checkJira,
    chat: checkChat,
    cheatSheet: checkCheatSheet,
    modules: checkModules,
    gitLab: checkGitLab,
    version: checkVersion,
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
    let requiredOptions = ['jenkins', 'jira', 'chat', 'cheatSheet', 'modules', 'gitLab', 'version'];

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
