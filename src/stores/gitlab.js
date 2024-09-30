import {defineStore} from 'pinia'
import {toRaw} from 'vue'
import {Uuid} from '../mixins/uuid.js'

export const useGitLabStorage = defineStore('gitLab', {
    state: () => ({
        categories: [],
        projects: [],
        host: '',
    }),
    getters: {
        getHost: state => state.host,
        getProjects: state => state.projects,
        getCategories: state => state.categories,
    },
    actions: {
        async load() {
            const options = await chrome.storage.local.get('optionsGitLab')

            this.host = options.optionsGitLab.host
            this.categories = options.optionsGitLab.categories

            options.optionsGitLab.projects.forEach(project => {
                this.projects.push({
                    ciBuild: project.ciBuild,
                    domain: project.domain,
                    project: project.project,
                    uuid: project.uuid,
                })
            })
        },
        setHost(host) {
            this.host = host
        },
        addCategory(name) {
            this.categories.push(name)
        },
        removeCategory(name) {
            const index = this.categories.findIndex(category => category.name === name)

            if (-1 !== index) {
                this.categories.splice(index, 1)
            }
        },
        renameCategory(prevName, name) {
            const index = this.categories.findIndex(category => category.name === name)

            if (-1 !== index) {
                this.categories[index] = name
            }
        },
        addProject(ciBuild, domain, project) {
            this.projects.push({
                ciBuild: ciBuild,
                domain: domain,
                project: project,
                uuid: Uuid.generate(),
            })
        },
        updateProject(uuid, ciBuild, domain, project) {
            const item = this.projects.find(project => project.uuid === uuid)

            if (undefined === project) {
                return
            }

            item.ciBuild = ciBuild
            item.domain = domain
            item.project = project
        },
        removeProject(uuid) {
            const index = this.projects.findIndex(project => project.uuid === uuid)

            if (-1 !== index) {
                this.projects.splice(index, 1)
            }
        },
        async save() {
            await chrome.storage.local.set({
                optionsGitLab: {
                    host: toRaw(this.host),
                    projects: toRaw(this.projects),
                    categories: toRaw(this.categories),
                },
            })
        },
    },
})
