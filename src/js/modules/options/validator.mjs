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

    return [];
}

const checkJenkins = (data) => {

    return [];
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
        if ('object' !== typeof entry) {
            errors.push({
                err: `Unsupported type for entry git[${key}]! Expected value is from type object.`
            });
        } else {
            for (let requiredKey of requiredKeys) {
                if (false === entry.hasOwnProperty(requiredKey)) {
                    errors.push({
                        err: `Missing key ${requiredKey} for entry git[${key}]!`
                    });
                } else if (types[requiredKey] !== typeof entry[requiredKey]) {
                    errors.push({
                        err: `Unsupported type for entry git[${key}]! Expected value is form type ${types[requiredKey]}`
                    });
                }
            }

            Object.keys(entry).forEach((name) => {
                if (-1 === requiredKeys.indexOf(name)) {
                    errors.push({
                        err: `Unknown key ${name} for option git[${key}]!`
                    });
                }
            });
        }
    });

    return errors;
}

const checkJira = (data) => {
    return [];
}

const checkRocketChat = (data) => {
    return [];
}

const checkCheatSheet = (data) => {
    return [];
}

const check = {
    lists: checkLists,
    jenkins: checkJenkins,
    jenkinsCategories: checkJenkinsCategories,
    git: checkGit,
    gitCategories: checkGitCategories,
    jira: checkJira,
    rocketChat: checkRocketChat,
    cheatSheet: checkCheatSheet
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
    let requiredOptions = ['lists', 'jenkins', 'jenkinsCategories', 'git', 'gitCategories', 'jira', 'rocketChat', 'cheatSheet'];

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
