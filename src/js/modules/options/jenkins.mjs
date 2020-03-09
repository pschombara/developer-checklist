import * as dragDrop from './drag-drop.mjs';

const template = document.querySelector('[data-template="jenkins"]');

export function create(name = '', job = '', type = 'REST API') {
    let target = document.querySelector('[data-jenkins]');
    let elem = document.createElement('div');
    elem.innerHTML = template.innerHTML;

    let item = elem.children[0];

    item.querySelector('[name="jenkinsName[]"]').value = 'string' === typeof name ? name : '';
    item.querySelector('[name="jenkinsJob[]"]').value = job;
    item.querySelector('[name="jenkinsType[]"]').value = type;

    target.appendChild(item);

    item.addEventListener('drag', dragDrop.drag);
}

export function save() {
    let jenkins = [];

    let jenkinsName = document.querySelectorAll('[name="jenkinsName[]"]');
    let jenkinsJob = document.querySelectorAll('[name="jenkinsJob[]"]');
    let jenkinsType = document.querySelectorAll('[name="jenkinsType[]"]');
    let jenkinsDelete = document.querySelectorAll('[name="jenkinsDelete[]"]');

    for (let key in jenkinsName) {
        if (jenkinsName.hasOwnProperty(key) && false === jenkinsDelete[key].checked) {
            jenkins.push({
                name: jenkinsName[key].value,
                job: jenkinsJob[key].value,
                type: jenkinsType[key].value,
            });
        }
    }

    return jenkins;
}
