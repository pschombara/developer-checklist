import {Uuid} from "./uuid";
import {DragDrop} from "./drag-drop";

export class JenkinsCategories {
    constructor() {
        this._template = document.querySelector('[data-template="jenkins-category"]');
        this._target = document.querySelector('[data-jenkins-categories]');
        this._add =  document.querySelector('[data-add-jenkins-category]');
    }

    init() {
        this._add.addEventListener('click', () => { this.create() });
    }

    create(category = '') {
        const elem = document.createElement('div');
        elem.innerHTML = this._template.innerHTML;
        elem.innerHTML = elem.innerHTML.replace(new RegExp('%jenkinsCategoryUuid%', 'g'), Uuid.generate());

        const item = elem.children[0];

        item.querySelector('[name="jenkinsCategoryName[]"]').value = 'string' === typeof category ? category : '';

        this._target.appendChild(item);

        new DragDrop(item).init();
    }

    save() {
        let categories = [];

        const categoryName = document.querySelectorAll('[name="jenkinsCategoryName[]"]');
        const categoryDelete = document.querySelectorAll('[name="jenkinsCategoryDelete[]"]');

        for (let key in categoryName) {
            if (categoryName.hasOwnProperty(key) && false === categoryDelete[key].checked) {
                categories.push(categoryName[key].value);
            }
        }

        return categories;
    }
}
