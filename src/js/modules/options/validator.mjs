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
    let requiredOptions = ['lists', 'jenkins', 'jira', 'rocketChat'];

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
        }
    });

    return errors;
};
