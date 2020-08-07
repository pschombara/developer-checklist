import {Uuid} from "./uuid";
import {DragDrop} from "./drag-drop";

export class Git {
    constructor() {
        this._template = document.querySelector('[data-template="git"]');
        this._target = document.querySelector('[data-git]');
        this._add =  document.querySelector('[data-add-git]');
        this._categories = []
    }

    init() {
        this._add.addEventListener('click', () => { this.create() });
    }

    set categories(categories) {
        this._categories = categories;
    }

    create(project = '', domain = 'alzura-rest-api-b2b') {
        let elem = document.createElement('div');
        elem.innerHTML = this._template.innerHTML;
        elem.innerHTML = elem.innerHTML.replace(new RegExp('%gitUuid%', 'g'), Uuid.generate());

        let item = elem.children[0];
        let selectDomain = item.querySelector('[name="gitDomain[]"]');

        for (let category of this._categories) {
            const option = document.createElement('option');
            option.innerHTML = category;
            selectDomain.appendChild(option);
        }

        if ('string' === typeof domain && '' !== domain) {
            selectDomain.value = domain;
        }

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
