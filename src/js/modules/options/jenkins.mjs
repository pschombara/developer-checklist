import {DragDrop} from "./drag-drop";
import {Uuid} from "./uuid";

export class Jenkins {
    constructor() {
        this._template = document.querySelector('[data-template="jenkins"]');
        this._target = document.querySelector('[data-jenkins]');
        this._add =  document.querySelector('[data-add-jenkins]');
    }

    init() {
        this._add.addEventListener('click', () => {
            this.create();
        });
    }

    create(name = '', job = '', type = 'REST API', label = '')  {
        let elem = document.createElement('div');
        elem.innerHTML = this._template.innerHTML;
        elem.innerHTML = elem.innerHTML.replace(new RegExp('%uuid%', 'g'), Uuid.generate());
        let item = elem.children[0];

        item.querySelector('[name="jenkinsName[]"]').value = 'string' === typeof name ? name : '';
        item.querySelector('[name="jenkinsJob[]"]').value = job;
        item.querySelector('[name="jenkinsType[]"]').value = type;
        item.querySelector('[name="jenkinsLabel[]"]').value = label;

        this._target.appendChild(item);

        new DragDrop(item).init();
    }

    save() {
        let jenkins = [];

        let jenkinsName = document.querySelectorAll('[name="jenkinsName[]"]');
        let jenkinsJob = document.querySelectorAll('[name="jenkinsJob[]"]');
        let jenkinsType = document.querySelectorAll('[name="jenkinsType[]"]');
        let jenkinsLabel = document.querySelectorAll('[name="jenkinsLabel[]"]');
        let jenkinsDelete = document.querySelectorAll('[name="jenkinsDelete[]"]');

        for (let key in jenkinsName) {
            if (jenkinsName.hasOwnProperty(key) && false === jenkinsDelete[key].checked) {
                jenkins.push({
                    name: jenkinsName[key].value,
                    job: jenkinsJob[key].value,
                    type: jenkinsType[key].value,
                    label: jenkinsLabel[key].value,
                });
            }
        }

        return jenkins;
    }
}
