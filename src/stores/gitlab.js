import {defineStore} from 'pinia'
import {toRaw} from 'vue'
import {Uuid} from '../mixins/uuid.js'
import {usePopupStorage} from './popup.js'

export const useGitLabStorage = defineStore('gitLab', {
    state: () => ({
        categories: [],
        projects: [],
        host: '',
        loaded: false,
        currentProject: '',
        currentNumber: null,
        currentSource: null,
    }),
    getters: {
        getHost: state => state.host,
        getProjects: state => state.projects,
        getProject: state => {
            return id => state.projects.find(project => project.uuid === id)
        },
        getCategories: state => state.categories,
        isLoaded: state => state.loaded,
        getCurrentProject: state => state.currentProject,
        getCurrentNumber: state => state.currentNumber,
        getCurrentSource: state => state.currentSource,
    },
    actions: {
        async load(reload = false) {
            if (this.loaded && false === reload) {
                return
            }

            this.loaded = false

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

            this.loaded = true
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
        buildUrl(id, number, source, withTag) {
            const project = this.projects.find(item => item.uuid === id)

            if (undefined === project) {
                return ''
            }

            if (false === withTag) {
                return `${this.host}${project.domain}/${project.project}/merge_requests/${number}`
            }

            return `<a href="${this.host}${project.domain}/${project.project}/merge_requests/${number}">${project.project + ('' !== source ? `:${source}` : '')}</a>`
        },
        async checkUrl() {
            const popupStorage = usePopupStorage()
            const tab = await popupStorage.fetchCurrentTab()
            const url = tab.url

            if ('' === this.host || false === url.startsWith(this.host)) {
                return
            }

            const project = this.projects.find(e => url.includes(`/${e.domain}/${e.project}/`))

            if (undefined === project) {
                return
            }

            const matches = url.match('/merge_requests/(?<number>\\d+)')

            if (null === matches) {
                return
            }

            this.currentProject = project.uuid
            this.currentNumber = parseInt(matches.groups.number)

            await new Promise(resolve => {
                chrome.scripting.executeScript(
                    {
                        target: {tabId: tab.id},
                        func: () => {
                            const ref = document.querySelector('.js-source-branch-copy')

                            if (null !== ref) {
                                return ref.dataset.clipboardText
                            }

                            return null
                        },
                    },
                    injectionResult => {
                        if (injectionResult.length > 0) {
                            this.currentSource = injectionResult[0].result
                        }

                        resolve()
                    },
                )
            })
        },
        async onHost() {
            const popupStorage = usePopupStorage()
            const tab = await popupStorage.fetchCurrentTab()

            return tab.url.startsWith(this.host) && tab.url.match(/-\/merge_requests\/\d+/)
        },
        async autoDetect() {
            const popupStorage = usePopupStorage()
            const tab = await popupStorage.fetchCurrentTab()

            const urlWithoutHost = tab.url.replace(this.host, '')
            const matches = urlWithoutHost.match(/(?<category>[^\/]+)\/(?<project>[\w\W]+)\/-/)

            if (null === matches
                || false === this.categories.includes(matches.groups.category)
            ) {
                return null
            }

            return {
                category: matches.groups.category,
                project: matches.groups.project,
            }
        },
    },
})
