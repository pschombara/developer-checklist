import {defineStore} from 'pinia'
import {toRaw} from 'vue'
import {Uuid} from '../mixins/uuid.js'

export const useJenkinsStorage = defineStore('jenkins', {
    state: () => ({
        host: '',
        categories: [],
        builds: [],
        loaded: false,
    }),
    getters: {
        getHost: state => state.host,
        getCategories: state => state.categories,
        getBuilds: state => state.builds,
        isLoaded: state => state.loaded,
    },
    actions: {
        async load(reload = false) {
            if (this.loaded && false === reload) {
                return
            }

            this.loaded = false

            const options = await chrome.storage.local.get('optionsJenkins')

            this.host = options.optionsJenkins.host
            this.categories = options.optionsJenkins.categories
            this.builds = []

            options.optionsJenkins.builds.forEach(build => {
                this.builds.push({
                    job: build.job,
                    label: build.label,
                    name: build.name,
                    type: build.type,
                    uuid: build.uuid,
                })
            })

            this.loaded = true
        },
        async save() {
            await chrome.storage.local.set({optionsJenkins: {
                host: toRaw(this.host),
                categories: toRaw(this.categories),
                builds: toRaw(this.builds),
            }})
        },
        updateHost(host) {
            this.host = host
        },
        addCategory(category) {
            this.categories.push(category)
        },
        renameCategory(previous, name) {
            const index = this.categories.findIndex(category => category === previous)

            if (-1 !== index) {
                this.categories[index] = name
            }
        },
        removeCategory(name) {
            const index = this.categories.findIndex(category => category === name)

            if (-1 !== index) {
                this.categories.splice(index, 1)
            }
        },
        addBuild(type, job, label, name) {
            this.builds.push({
                job: job,
                label: label,
                name: name,
                type: type,
                uuid: Uuid.generate(),
            })
        },
        updateBuild(uuid, type, job, label, name) {
            const build = this.builds.find(build => build.uuid === uuid)

            if (undefined === build) {
                return
            }

            build.type = type
            build.job = job
            build.label = label
            build.name = name
        },
        removeBuild(uuid) {
            const index = this.builds.findIndex(build => build.uuid === uuid)

            if (-1 !== index) {
                this.builds.splice(index, 1)
            }
        },
    },
})
