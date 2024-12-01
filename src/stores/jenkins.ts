import {defineStore} from 'pinia'
import {toRaw} from 'vue'
import {Uuid} from '../utils/uuid.ts'
import {usePopupStorage} from './popup.ts'

const checkRegex = /(view\/(?<category>.+)\/)?job\/(?<job>[^\/]+)/

export const useJenkinsStorage = defineStore('jenkins', {
    state: () => ({
        host: '',
        categories: [],
        builds: [],
        loaded: false,
        currentJob: '',
        currentBuild: null,
    }),
    getters: {
        getHost: state => state.host,
        getCategories: state => state.categories,
        getBuilds: state => state.builds,
        getBuild: state => {
            return job => state.builds.find(build => build.job === job)
        },
        isLoaded: state => state.loaded,
        getCurrentJob: state => state.currentJob,
        getCurrentBuild: state => state.currentBuild,
    },
    actions: {
        async load(reload = false) {
            if (this.loaded && false === reload) {
                return
            }

            this.loaded = false

            const options = await browser.storage.local.get('optionsJenkins')

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
            await browser.storage.local.set({optionsJenkins: {
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
        buildUrl(job, build, withTag) {
            const ciBuild = this.builds.find(item => item.job === job)

            if (undefined === ciBuild) {
                return ''
            }

            const name = '' !== ciBuild.label ? ciBuild.label : ciBuild.name
            const url = encodeURI(`${this.host}/view/${ciBuild.type}/job/${ciBuild.job}/${build}/`)

            return withTag ? `<a href="${url}">${name}</a>` : url
        },
        async checkUrl() {
            const popupStorage = usePopupStorage()
            const tab = await popupStorage.fetchCurrentTab()
            const url = tab.url

            if ('' === this.host || false === url.startsWith(this.host)) {
                return
            }

            const matches = url.match('/job/(?<job>[\\w-_\\+\\d]+)/(?<build>\\d*)')

            if ('' === (matches.groups.job ?? '')) {
                return
            }

            const job = this.builds.find(build => build.job === matches.groups.job)

            if (undefined === job) {
                return
            }

            this.currentJob = job.job

            if ('' !== matches.groups.build) {
                this.currentBuild = parseInt(matches.groups.build)

                return
            }

            await new Promise(resolve => {
                browser.scripting.executeScript(
                    {
                        target: {tabId: tab.id},
                        func: () => {
                            const lastBuild = document.querySelector('[update-parent-class=".build-row"]')

                            return parseInt(lastBuild.innerText.replace('#', ''))
                        },
                    },
                    async injectionResult => {
                        if (injectionResult.length > 0) {
                            this.currentBuild = injectionResult[0].result
                            resolve()
                        }
                    },
                )
            })
        },
        async onHost() {
            const popupStorage = usePopupStorage()
            const tab = await popupStorage.fetchCurrentTab()

            return tab.url.startsWith(this.host) && tab.url.match(checkRegex)
        },
        async autoDetect() {
            const popupStorage = usePopupStorage()
            const tab = await popupStorage.fetchCurrentTab()

            const urlWithoutHost = tab.url.replace(this.host, '')
            const matches = urlWithoutHost.match(checkRegex)

            if (null === matches) {
                return null
            }

            const category = decodeURI(matches.groups.category ?? '')

            return {
                category: this.categories.includes(category) ? category : '',
                job: decodeURI(matches.groups.job),
            }
        },
    },
})
