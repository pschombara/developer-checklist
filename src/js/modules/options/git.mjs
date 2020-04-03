import {Uuid} from "./uuid";
import {DragDrop} from "./drag-drop";

export class Git {
    constructor() {
        this._template = document.querySelector('[data-template="git"]');
        this._target = document.querySelector('[data-git]');
        this._add =  document.querySelector('[data-add-git]');
    }

    init() {
        this._add.addEventListener('click', () => { this.create() });
    }

    create(project = '', domain = 'alzura-rest-api-b2b') {
        let elem = document.createElement('div');
        elem.innerHTML = this._template.innerHTML;
        elem.innerHTML = elem.innerHTML.replace(new RegExp('%gitUuid%', 'g'), Uuid.generate());

        let item = elem.children[0];

        item.querySelector('[name="gitDomain[]"]').value = 'string' === typeof domain ? domain : 'alzura-rest-api-b2b';
        item.querySelector('[name="gitProject[]"]').value = 'string' === typeof project ? project : '';

        this._target.appendChild(item);

        new DragDrop(item).init();
    }

    save() {
        let git = [];

        let gitDomain = document.querySelectorAll('[name="gitDomain[]"]');
        let gitProject = document.querySelectorAll('[name="gitProject[]"]');
        let gitDelete = document.querySelectorAll('[name="gitDelete[]"]');

        for (let key in gitDomain) {
            if (gitDomain.hasOwnProperty(key) && false === gitDelete[key].checked) {
                git.push({
                    domain: gitDomain[key].value,
                    project: gitProject[key].value,
                });
            }
        }

        return git;
    }
}
