import {DragDrop} from "./drag-drop";
import {Uuid} from "./uuid";
import {SuperJenkins} from '../super/super.jenkins';

export class Jenkins extends SuperJenkins{
    constructor() {
        super();

        this.builds = {
            template: document.querySelector('[data-template="jenkins"]'),
            target: document.querySelector('[data-jenkins]'),
            add: document.querySelector('[data-add-jenkins]'),
        }

        this.categories = {
            template: document.querySelector('[data-template="jenkins-category"]'),
            target: document.querySelector('[data-jenkins-categories]'),
            add: document.querySelector('[data-add-jenkins-category]'),
        }
    }

    init() {
        this.builds.add.addEventListener('click', () => { this.createBuild(); });
        this.categories.add.addEventListener('click', () => { this.createCategory(); });
    }

    createBuild(name = '', job = '', type = '', label = '')  {
        const elem = document.createElement('div');
        elem.innerHTML = this.builds.template.innerHTML;
        elem.innerHTML = elem.innerHTML.replace(new RegExp('%uuid%', 'g'), Uuid.generate());
        const item = elem.children[0];

        const typeSelect = item.querySelector('[name="jenkinsType[]"]');

        for (let category of this.options.categories) {
            const option = document.createElement('option');
            option.innerHTML = category;
            typeSelect.appendChild(option);
        }

        if ('string' === typeof type && '' !== type) {
            typeSelect.value = type;
        }

        item.querySelector('[name="jenkinsName[]"]').value = 'string' === typeof name ? name : '';
        item.querySelector('[name="jenkinsJob[]"]').value = job;
        item.querySelector('[name="jenkinsLabel[]"]').value = label;

        this.builds.target.appendChild(item);

        new DragDrop(item).init();
    }

    createCategory(category = '') {
        const elem = document.createElement('div');
        elem.innerHTML = this.categories.template.innerHTML;
        elem.innerHTML = elem.innerHTML.replace(new RegExp('%jenkinsCategoryUuid%', 'g'), Uuid.generate());

        const item = elem.children[0];

        item.querySelector('[name="jenkinsCategoryName[]"]').value = 'string' === typeof category ? category : '';

        this.categories.target.appendChild(item);

        new DragDrop(item).init();
    }

    save() {
        const jenkins = {
            host: '',
            builds: [],
            categories: []
        };

        // save jenkins builds
        const jenkinsName = document.querySelectorAll('[name="jenkinsName[]"]');
        const jenkinsJob = document.querySelectorAll('[name="jenkinsJob[]"]');
        const jenkinsType = document.querySelectorAll('[name="jenkinsType[]"]');
        const jenkinsLabel = document.querySelectorAll('[name="jenkinsLabel[]"]');
        const jenkinsDelete = document.querySelectorAll('[name="jenkinsDelete[]"]');

        for (let key in jenkinsName) {
            if (jenkinsName.hasOwnProperty(key) && false === jenkinsDelete[key].checked) {
                jenkins.builds.push({
                    name: jenkinsName[key].value,
                    job: jenkinsJob[key].value,
                    type: jenkinsType[key].value,
                    label: jenkinsLabel[key].value,
                });
            }
        }

        // save jenkins categories
        const categoryName = document.querySelectorAll('[name="jenkinsCategoryName[]"]');
        const categoryDelete = document.querySelectorAll('[name="jenkinsCategoryDelete[]"]');

        for (let key in categoryName) {
            if (categoryName.hasOwnProperty(key) && false === categoryDelete[key].checked) {
                jenkins.categories.push(categoryName[key].value);
            }
        }

        return jenkins;
    }
}
