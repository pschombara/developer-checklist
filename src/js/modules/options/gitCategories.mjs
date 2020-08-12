import {Uuid} from "./uuid";
import {DragDrop} from "./drag-drop";

export class GitCategories {
    constructor() {
        this._template = document.querySelector('[data-template="git-category"]');
        this._target = document.querySelector('[data-git-categories]');
        this._add =  document.querySelector('[data-add-git-category]');
    }

    init() {
        this._add.addEventListener('click', () => { this.create() });
    }

    create(category = '') {
        const elem = document.createElement('div');
        elem.innerHTML = this._template.innerHTML;
        elem.innerHTML = elem.innerHTML.replace(new RegExp('%gitCategoryUuid%', 'g'), Uuid.generate());

        const item = elem.children[0];

        item.querySelector('[name="gitCategoryName[]"]').value = 'string' === typeof category ? category : '';

        this._target.appendChild(item);

        new DragDrop(item).init();
    }

    save() {
        let categories = [];

        const categoryName = document.querySelectorAll('[name="gitCategoryName[]"]');
        const categoryDelete = document.querySelectorAll('[name="gitCategoryDelete[]"]');

        for (let key in categoryName) {
            if (categoryName.hasOwnProperty(key) && false === categoryDelete[key].checked) {
                categories.push(categoryName[key].value);
            }
        }

        return categories;
    }
}
