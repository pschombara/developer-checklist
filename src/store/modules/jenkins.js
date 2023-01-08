import {Uuid} from '@/mixins/uuid'

const state = {
    host: '',
    categories: [],
    builds: [],
    currentJob: '',
    currentBuild: null,
}

export default {
    strict: process.env.NODE_ENV !== 'production',
    namespaced: true,
    state,
    mutations: {
        SET_HOST: (state, host) => {
            state.host = host
        },
        ADD_CATEGORY: (state, category) => {
            state.categories.push(category)
        },
        UPDATE_CATEGORY: (state, data) => {
            const index = state.categories.indexOf(data.previousName)

            if (-1 !== index) {
                state.categories.splice(index, 1, data.newName)
            }
        },
        REMOVE_CATEGORY: (state, name) => {
            const index = state.categories.indexOf(name)

            if (-1 !== index) {
                state.categories.splice(index, 1)
            }
        },
        ADD_BUILD: (state, build) => {
            state.builds.push({
                job: build.job,
                label: build.label,
                name: build.name,
                type: build.type,
                uuid: build.uuid ?? Uuid.generate(),
            })
        },
        UPDATE_BUILD: (state, data) => {
            const index = state.builds.findIndex(item => item.uuid === data.previous.uuid)

            if (-1 !== index) {
                state.builds.splice(index, 1, data.build)
            }
        },
        REMOVE_BUILD: (state, build) => {
            const index = state.builds.findIndex(item => item.uuid === build.uuid)

            if (-1 !== index) {
                state.builds.splice(index, 1)
            }
        },
        CLEAR: state => {
            state.host = ''
            state.categories = []
            state.builds = []
        },
        SET_CURRENT_JOB: (state, job) => {
            state.currentJob = job
        },
        SET_CURRENT_BUILD: (state, build) => {
            state.currentBuild = build
        },
    },
    actions: {
        // options
        init: ({commit}, options) => {
            return new Promise(resolve => {
                commit('CLEAR')

                commit('SET_HOST', options.host)

                for (let category of options.categories) {
                    commit('ADD_CATEGORY', category)
                }

                for (let build of options.builds) {
                    commit('ADD_BUILD', build)
                }

                resolve()
            })
        },
        updateHost: ({commit}, value) => {
            commit('SET_HOST', value)
        },
        addCategory: ({commit}, category) => {
            commit('ADD_CATEGORY', category)
        },
        updateCategory: ({commit, state}, data) => {
            commit('UPDATE_CATEGORY', {previousName: data.previousName, newName: data.newName})

            for (let build of Object.values(state.builds)) {
                if (data.previousName === build.type) {
                    let updateBuild = Object.assign({}, build)

                    updateBuild.type = data.newName

                    commit('UPDATE_BUILD', {previous: build, build: updateBuild})
                }
            }
        },
        removeCategory: ({commit, state}, name) => {
            commit('REMOVE_CATEGORY', name)

            for (let build of Object.values(state.builds)) {
                if (name === build.type) {
                    commit('REMOVE_BUILD', build)
                }
            }
        },
        addBuild: ({commit}, data) => {
            commit('ADD_BUILD', data)
        },
        updateBuild: ({commit}, data) => {
            commit('UPDATE_BUILD', {previous: data.previous, build: data.build})
        },
        removeBuild: ({commit}, build) => {
            commit('REMOVE_BUILD', build)
        },
        save: ({state}) => {
            return new Promise(resolve => {
                resolve({
                    key: 'jenkins',
                    options: {
                        host: state.host,
                        categories: state.categories,
                        builds: state.builds,
                    },
                })
            })
        },
        // popup
        checkUrl: ({state, commit, rootGetters}) => {
            return new Promise(resolve => {
                const url = rootGetters['currentUrl']

                if ('' === state.host || false === url.startsWith(state.host)) {
                    resolve()

                    return
                }

                const matches = url.match('/job/(?<job>[\\w-_\\+\\d]+)/(?<build>\\d*)')

                if ('' === matches.groups.job) {
                    resolve()

                    return
                }

                const job = state.builds.find(build => build.job === matches.groups.job)

                if (null === job) {
                    resolve()

                    return
                }

                commit('SET_CURRENT_JOB', job.job)

                if ('' !== matches.groups.build) {
                    commit('SET_CURRENT_BUILD', parseInt(matches.groups.build))

                    resolve()

                    return
                }

                const currentTab = rootGetters['currentTab']

                currentTab.then(tab => {
                    chrome.scripting.executeScript(
                        {
                            target: {tabId: tab.id},
                            func: () => {
                                const lastBuild = document.querySelector('[update-parent-class=".build-row"]')

                                return parseInt(lastBuild.innerText.replace('#', ''))
                            },
                        },
                        injectionResult => {
                            if (injectionResult.length > 0) {
                                commit('SET_CURRENT_BUILD', injectionResult[0].result)
                            }

                            resolve()
                        },
                    )
                })
            })
        },
    },
    getters: {
        getHost: state => state.host,
        getCategories: state => {
            let categories = []

            for (let category of state.categories) {
                categories.push({name: category})
            }

            return categories
        },
        getBuilds: state => state.builds,
        getCategoryNames: state => state.categories,
        currentJob: state => state.currentJob,
        currentBuild: state => state.currentBuild,
        url: state => (job, build, withAlias) => {
            const data = state.builds.find(entry => entry.job === job)

            if (undefined === data) {
                return ''
            }

            const name = '' !== data.label ? data.label : data.name
            const url = encodeURI(`${state.host}view/${data.type}/job/${data.job}/${build}/`)

            if (withAlias) {
                return `<a href="${url}">${name}</a>`
            }

            return url
        },
    },
}
