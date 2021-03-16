import {ErrorPrompt, Toast} from "../sweet";
import {Validator} from "./validator";
import {Storage} from "../storage";
import {Migration} from '../migration/migration';

export class Config {
    constructor(storage, validator) {
        this._storage = storage ? storage : new Storage();
        this._validator = validator ? validator : new Validator();
        this._migration = new Migration();
        this._buttonUpload = document.querySelector('[data-upload="btn"]');
        this._fileUpload = document.querySelector('[data-upload="file"]');
    }

    init() {
        this._buttonUpload.addEventListener('click', () => {
            this._fileUpload.click();
        });

        this._fileUpload.addEventListener('change', (e) => {
           this.importFromJson(e);
        });
    }

    exportToJson(options) {
        let elem = document.createElement('a');

        // for security reasons reset user id and authToken
        options.chat.rocket.userId = '';
        options.chat.rocket.authToken = '';

        elem.setAttribute('href', 'data:application/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(options)));
        elem.setAttribute('download', 'jira-dev-checklist-options');
        elem.classList.add('d-none');

        document.body.appendChild(elem);
        elem.click();
        document.body.removeChild(elem);
    }

    importFromJson(e) {
        if (0 === e.target.files.length) {
            Toast.fire({
                icon: "error",
                title: "No file selected"
            });

            return;
        }

        let file = e.target.files[0];

        if (file.size <= 0) {
            Toast.fire({
                icon: "error",
                title: "File is empty"
            });

            return;
        }

        if ('application/json' !== file.type) {
            Toast.fire({
                icon: "error",
                title: "Wrong file type"
            });

            return;
        }

        uploadFile(file, this._storage, this._validator, this._migration);
    }

    restore() {
        return new Promise(resolve => {
            let xhttp = new XMLHttpRequest();

            xhttp.open('GET', chrome.extension.getURL('/config.json'));

            xhttp.onreadystatechange = () => {
                if (XMLHttpRequest.DONE === xhttp.readyState) {
                    resolve(JSON.parse(xhttp.response));
                }
            };

            xhttp.send();
        });
    }
}

const uploadFile = (file, storage, validator, migration) =>  {
    let fileReader = new FileReader();

    fileReader.addEventListener('load', e => {
        if ('string' === typeof e.target.result) {
            let data = JSON.parse(e.target.result);

            // try to migrate data
            data = migration.migrate(data);

            if (false === validator.validate(data)) {
                ErrorPrompt.fire({
                    icon: "error",
                    title: "JSON is invalid",
                    html: validator.htmlErrors
                });

                return;
            }

            storage.loadOptions().then(stored => {
                if (0 !== Object.keys(stored).length
                    && stored.hasOwnProperty('chat')
                    && stored.chat.hasOwnProperty('rocket')
                ) {
                    console.log(data.chat, stored)
                    data.chat.rocket.userId = stored.chat.rocket.userId;
                    data.chat.rocket.authToken = stored.chat.rocket.authToken;
                }

                storage.write('options', data);
            });

            Toast.fire({
                icon: 'success',
                title: 'Imported options',
                onClose: () => {
                    location.reload();
                }
            });
        }
    });

    fileReader.readAsText(file, 'utf-8');
};
