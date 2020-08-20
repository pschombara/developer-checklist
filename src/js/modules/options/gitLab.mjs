import {SuperGitLab} from '../super/super.gitLab';
import {Uuid} from './uuid';
import {DragDrop} from './drag-drop';

export class GitLab extends SuperGitLab {
    constructor() {
        super();

        this._projects = {
            template: document.querySelector('[data-template="gitLabProject"]'),
            target: document.querySelector('[data-gitLab-projects]'),
            add: document.querySelector('[data-add-gitLab-project]'),
        };

        this._categories = {
            template: document.querySelector('[data-template="gitLabCategory"]'),
            target: document.querySelector('[data-gitLab-categories]'),
            add: document.querySelector('[data-add-gitLab-category]'),
        }

        this._gitLabHost = document.querySelector('#gitLabHost');
    }

    init() {
        this._projects.add.addEventListener('click', () => { this.createProject() });
        this._categories.add.addEventListener('click', () => { this.createCategory() });

        for (let project of this.options.projects) {
            this.createProject(project.project, project.domain);
        }

        for (let category of this.options.categories) {
            this.createCategory(category);
        }

        this._gitLabHost.value = this.options.host;
    }

    createProject(project = '', domain = '') {
        const elem = document.createElement('div');

        elem.innerHTML = this._projects.template.innerHTML;
        elem.innerHTML = elem.innerHTML.replace(new RegExp('%gitLabUuid%', 'g'), Uuid.generate());

        const item = elem.children[0];
        const selectDomain = item.querySelector('[name="gitLabDomain[]"]');

        for (let category of this.options.categories) {
            const option = document.createElement('option');
            option.innerHTML = category;
            selectDomain.appendChild(option);
        }

        if ('string' === typeof domain && '' !== domain) {
            selectDomain.value = domain;
        }

        item.querySelector('[name="gitLabProject[]"]').value = 'string' === typeof project ? project : '';

        this._projects.target.appendChild(item);

        new DragDrop(item).init();
    }

    createCategory(category = '') {
        const elem = document.createElement('div');
        elem.innerHTML = this._categories.template.innerHTML;
        elem.innerHTML = elem.innerHTML.replace(new RegExp('%gitLabCategoryUuid%', 'g'), Uuid.generate());

        const item = elem.children[0];

        item.querySelector('[name="gitLabCategoryName[]"]').value = 'string' === typeof category ? category : '';

        this._categories.target.appendChild(item);

        new DragDrop(item).init();
    }

    save() {
        let host = this._gitLabHost.value.trim();

        if ('' !== host && false === host.endsWith('/')) {
            host += '/';
        }

        const gitLab = {
            host: host,
            projects: [],
            categories: []
        }

        // save gitLab projects
        const gitLabDomain = document.querySelectorAll('[name="gitLabDomain[]"]');
        const gitLabProject = document.querySelectorAll('[name="gitLabProject[]"]');
        const gitLabDelete = document.querySelectorAll('[name="gitLabProjectDelete[]"]');

        for (let key in gitLabDomain) {
            if (gitLabDomain.hasOwnProperty(key) && false === gitLabDelete[key].checked) {
                gitLab.projects.push({
                    domain: gitLabDomain[key].value,
                    project: gitLabProject[key].value,
                });
            }
        }

        // save gitLab categories
        const categoryName = document.querySelectorAll('[name="gitCategoryName[]"]');
        const categoryDelete = document.querySelectorAll('[name="gitCategoryDelete[]"]');

        for (let key in categoryName) {
            if (categoryName.hasOwnProperty(key) && false === categoryDelete[key].checked) {
                gitLab.categories.push(categoryName[key].value);
            }
        }

        return gitLab;
    }
}
