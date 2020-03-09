import {Toast} from "../sweet.mjs";
import * as storage from "../storage.mjs";
import * as validator from './validate.schema.mjs'

export function exportToJson() {
    let elem = document.createElement('a');
    elem.setAttribute('href', 'data:application/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(options)));
    elem.setAttribute('download', 'jira-dev-checklist-options');
    elem.classList.add('d-none');

    document.body.appendChild(elem);
    elem.click();
    document.body.removeChild(elem);
}

export function importFromJson(e) {
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

    let fileReader = new FileReader();
    fileReader.onload = (e) => {
        if ('string' === typeof e.target.result) {
            let data = JSON.parse(e.target.result);

            if (false === validator.validate(data)) {
                Toast.fire({
                    icon: "error",
                    title: "JSON is invalid"
                });

                return;
            }

            storage.write('options', data);

            Toast.fire({
                icon: 'success',
                title: 'Imported options',
                onClose: () => {
                    location.reload();
                }
            });
        }
    };
    fileReader.readAsText(file, 'utf-8');
}

export function restore() {
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
