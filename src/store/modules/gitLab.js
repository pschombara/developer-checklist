import {Uuid} from '../../mixins/uuid'
import {toRaw} from 'vue'

const state = {
    categories: [],
    projects: [],
    host: '',
    currentProject: '',
    currentNumber: null,
    currentSource: null,
}

export default {
    strict: import.meta.env.NODE_ENV !== 'production',
    namespaced: true,
    state,
    mutations: {
        SET_HOST: (state, host) => {
            state.host = host
        },
        ADD_CATEGORY: (state, category) => {
            state.categories.push(category)
        },
        REMOVE_CATEGORY: (state, category) => {
            const index = state.categories.indexOf(category)

            if (-1 !== index) {
                state.categories.splice(index, 1)
            }
        },
        UPDATE_CATEGORY: (state, data) => {
            const index = state.categories.indexOf(data.previousName)

            if (-1 !== index) {
                state.categories.splice(index, 1, data.newName)
            }
        },
        ADD_PROJECT: (state, data) => {
            state.projects.push({
                domain: data.domain,
                project: data.project,
                uuid: data.uuid ?? Uuid.generate(),
                ciBuild: data.ciBuild ?? null,
            })
        },
        REMOVE_PROJECT: (state, data) => {
            const index = state.projects.findIndex(project => project.uuid === data.uuid)

            if (-1 !== index) {
                state.projects.splice(index, 1)
            }
        },
        UPDATE_PROJECT: (state, data) => {
            const index = state.projects.findIndex(project => project.uuid === data.previous.uuid)

            if (-1 !== index) {
                state.projects.splice(index, 1, data.project)
            }
        },
        CLEAR: state => {
            state.host = ''
            state.categories = []
            state.projects = []
        },
        SET_CURRENT_PROJECT: (state, project) => {
            state.currentProject = project
        },
        SET_CURRENT_NUMBER: (state, number) => {
            state.currentNumber = number
        },
        SET_CURRENT_SOURCE: (state, source) => {
            state.currentSource = source
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

                for (let project of options.projects) {
                    commit('ADD_PROJECT', project)
                }

                resolve()
            })
        },
        updateHost: ({commit}, value) => {
            commit('SET_HOST', value)
        },
        removeCategory: ({commit, state}, category) => {
            commit('REMOVE_CATEGORY', category)

            let projects = Object.assign({}, state.projects)

            for (let project of Object.values(projects)) {
                if (category === project.domain) {
                    commit('REMOVE_PROJECT', project)
                }
            }
        },
        addCategory: ({commit}, category) => {
            commit('ADD_CATEGORY', category)
        },
        updateCategory: ({commit, state}, data) => {
            commit('UPDATE_CATEGORY', {previousName: data.previousName, newName: data.newName})

            for (let project of Object.values(state.projects)) {
                if (data.previousName === project.domain) {
                    let updateProject = Object.assign({}, project)

                    updateProject.domain = data.newName

                    commit('UPDATE_PROJECT', {previous: project, project: updateProject})
                }
            }
        },
        removeProject: ({commit}, data) => {
            commit('REMOVE_PROJECT', data)
        },
        addProject: ({commit}, data) => {
            commit('ADD_PROJECT', data)
        },
        updateProject: ({commit}, data) => {
            commit('UPDATE_PROJECT', data)
        },
        save: ({state}) => {
            return new Promise(resolve => {
                resolve({
                    key: 'gitLab',
                    options: {
                        host: toRaw(state.host),
                        projects: toRaw(state.projects),
                        categories: toRaw(state.categories),
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

                const project = state.projects.find(e => {
                    return url.includes(`/${e.domain}/${e.project}/`)
                })

                if (undefined === project) {
                    resolve()

                    return
                }

                const matches = url.match('/merge_requests/(?<number>\\d+)')

                commit('SET_CURRENT_PROJECT', project.uuid)
                commit('SET_CURRENT_NUMBER', parseInt(matches.groups.number))

                const currentTab = rootGetters['currentTab']

                currentTab.then(tab => {
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
                                commit('SET_CURRENT_SOURCE', injectionResult[0].result)
                            }

                            resolve()
                        },
                    )
                })

                resolve()
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
        getCategoryNames: state => state.categories,
        getProjects: state => state.projects,
        getProject: state => id => {
            for (let project of state.projects) {
                if (id === project.uuid) {
                    return project
                }
            }

            return null
        },
        currentProject: state => state.currentProject,
        currentNumber: state => state.currentNumber,
        currentSource: state => state.currentSource,
        getCiBuild: (state, getters) => id => {
            const project = getters['getProject'](id)

            if (null === project || null === project.ciBuild) {
                return null
            }

            return project.ciBuild
        },
        url: state => (id, number, source, withAlias) => {
            const project = state.projects.find(e => e.uuid === id)

            if (undefined === project) {
                return ''
            }

            let aliasUrl = project.project + ('' !== source ? `:${source}` : '')

            if (withAlias) {
                return `<a href="${state.host}${project.domain}/${project.project}/merge_requests/${number}">${aliasUrl}</a>`
            }

            return `${state.host}${project.domain}/${project.project}/merge_requests/${number}`
        },
    },
}
