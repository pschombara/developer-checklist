let errors = [];
let checkData = {};
let valid = true;

const requiredOptions = ['lists', 'jenkins', 'boards', 'url', 'cleanup', 'maximumIssues'];

export function validate(data) {
    if ('object' !== typeof data) {
        errors.push({
            err: 'Format is invalid.'
        });

        return false;
    }

    checkData = data;

    checkRootSchema();

    if (valid) {
        checkRootOptions();
    }

    // Check all options are available
    return valid;
}

export function getErrors() {
    return errors;
}

const checkRootSchema = () => {
    for (let option of requiredOptions) {
        if (false === checkData.hasOwnProperty(option)) {
            valid = false;

            errors.push({
               err: `Missing option "${option}"!`,
            });
        }
    }

    Object.keys(checkData).forEach((key) => {
        if (-1 === requiredOptions.indexOf(key)) {
            valid = false;

            errors.push({
                err: `Unsupported option "${key}"!`,
            });
        }
    });
};
const checkRootOptions = () => {
    if ('number' !== typeof checkData.maximumIssues) {
        valid = false;
        errors.push({
            err: 'Option maximumIssue is not a number'
        });
    }
};
