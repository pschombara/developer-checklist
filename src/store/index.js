import chat from '@/store/modules/chat'
import cheatSheet from '@/store/modules/cheatSheet'
import gitLab from '@/store/modules/gitLab'
import jenkins from '@/store/modules/jenkins'
import jira from '@/store/modules/jira'
import Migration from '@/mixins/migration'
/* import chromeBrowser from '@/store/modules/chromeBrowser' */
import icons from '@/store/modules/icons'
import issues from '@/store/modules/issues'
import Helper from '../mixins/helper'
import {createStore} from 'vuex'

const migration = new Migration()

const state = {
    modules: {
        chat: false,
        cheatSheet: false,
        gitLab: false,
        jenkins: false,
        // chrome: false,
    },
    version: migration.version,
    configTabs: {
        main: 'modules',
    },
    optionsValid: false,
    currentIssue: null,
    currentUrl: '',
    switchTab: null,
    openTab: null,
    optionTabs: [
        { id: 'modules', name: 'Modules', icon: 'fas fa-cogs', settings: true },
        { id: 'jira', name: 'Jira', icon: 'fab fa-jira', settings: true },
        { id: 'jenkins', name: 'Jenkins', icon: 'fab fa-jenkins', settings: true },
        { id: 'gitLab', name: 'GitLab', icon: 'fab fa-gitlab', settings: true },
        { id: 'chat', name: 'Chat', icon: 'fas fa-comment', settings: true },
        { id: 'cheatSheet', name: 'Cheat Sheet', icon: 'fas fa-terminal', settings: true },
        // { id: 'chrome', name: 'Chrome', icon: 'fab fa-chrome', settings: true },
        { id: 'about', name: 'About', icon: 'fas fa-info-circle', settings: false },
    ],
}

const store = createStore({
    strict: process.env.NODE_ENV !== 'production',
    state,
    mutations: {
        SET_MODULES: (state, modules) => {
            for (let module in modules) {
                if (undefined !== state.modules[module]) {
                    state.modules[module] = modules[module]
                }
            }
        },
        SWITCH_MODULE: (state, data) => {
            state.modules[data.module] = data.value
        },
        SET_TAB_CONFIG_MAIN: (state, tab) => {
            state.configTabs.main = tab
        },
        CHANGE_OPTIONS_VALID: (state, valid) => {
            state.optionsValid = valid
        },
        SET_CURRENT_ISSUE: (state, issue) => {
            state.currentIssue = issue
        },
        SET_SWITCH_TAB: (state, tab) => {
            state.switchTab = tab
        },
        SET_URL: (state, url) => {
            state.currentUrl = url
        },
        CHANGE_OPEN_TAB: (state, tab) => {
            state.openTab = tab
        },
    },
    actions: {
        load: ({ commit, dispatch, rootGetters }) => {
            chrome.storage.onChanged.addListener((changes, area) => {
                if ('local' === area && changes.optionsTab?.newValue) {
                    commit('SET_TAB_CONFIG_MAIN', changes.optionsTab.newValue)

                    if ('' === changes.optionsTab.newValue) {
                        return
                    }

                    return dispatch('autoChangeOpenTab')
                }
            })

            return new Promise(resolve => {
                chrome.storage.local.get(null, storageData => {
                    const promises = []
                    const issueRegex = rootGetters['issues/issueRegex']

                    new Promise(loaded => {
                        for (let [key, issue] of Object.entries(storageData)) {
                            if (issueRegex.test(key)) {
                                promises.push(dispatch('issues/addIssue', {key, issue}))
                            }
                        }

                        Promise.all(promises).then(() => {
                            if (Object.prototype.hasOwnProperty.call(storageData, 'optionsTab')) {
                                commit('SET_TAB_CONFIG_MAIN', storageData['optionsTab'])

                                if ('' !== storageData['optionsTab']) {
                                    dispatch('autoChangeOpenTab')
                                }
                            }

                            if (Object.prototype.hasOwnProperty.call(storageData, 'options')) {
                                loaded(storageData.options)
                            } else {
                                dispatch('restore').then(data => {
                                    loaded(data)
                                })
                            }
                        })
                    }).then(storageData => {
                        const options = migration.migrate(storageData)

                        commit('SET_MODULES', options.modules)
                        const promises = []

                        promises.push(dispatch('jira/init', options.jira))
                        promises.push(dispatch('gitLab/init', options.gitLab))
                        promises.push(dispatch('jenkins/init', options.jenkins))
                        promises.push(dispatch('cheatSheet/init', options.cheatSheet))
                        promises.push(dispatch('chat/init', options.chat))

                        Promise.all(promises).then(() => {
                            let innerPromises = []

                            innerPromises.push(dispatch('checkOptions'))
                            innerPromises.push(dispatch('issues/cleanUp'))

                            Promise.all(innerPromises).then(() => {
                                resolve()
                            })
                        })
                    })
                })
            })
        },
        restore: () => {
            return new Promise(resolve => {
                const configRequest = new XMLHttpRequest()
                configRequest.open('GET', chrome.runtime.getURL('config.json'))

                configRequest.onreadystatechange = () => {
                    if (XMLHttpRequest.DONE === configRequest.readyState && 200 === configRequest.status) {
                        let data = JSON.parse(configRequest.response)
                        let obj = {}
                        obj['options'] = data

                        chrome.storage.local.set(obj)
                        resolve(data)
                    }
                }

                configRequest.send()
            })
        },
        import: ({dispatch, commit}, {options, importSettings}) => {
            return new Promise(resolve => {
                const promises = []

                for (let setting of importSettings) {
                    if ('modules' === setting) {
                        commit('SET_MODULES', options.modules)
                    } else {
                        promises.push(dispatch(setting + '/init', options[setting]))
                    }
                }

                Promise.all(promises).then(() => {
                    dispatch('saveOptions').then(() => {
                        resolve()
                    })
                })
            })
        },
        switchModule: ({commit}, {module, value}) => {
            commit('SWITCH_MODULE', {module, value})
        },
        checkUrl: ({getters, rootGetters, dispatch, commit}) => {
            const tab = getters['currentTab']
            const jiraUrl = rootGetters['jira/getUrl']
            const issueRegex = rootGetters['issues/issueRegex']
            const jenkinsUrl = rootGetters['jenkins/getHost']
            const gitLabUrl = rootGetters['gitLab/getHost']

            return new Promise(resolve => {
                tab.then(data => {
                    commit('SET_URL', data.url)

                    // check jira, gitLab or jenkins url
                    if (data.url.startsWith(jiraUrl)) {
                        // check url matches configured board
                        if (false === issueRegex.test(data.url)) {
                            resolve()
                            return
                        }

                        commit('SET_CURRENT_ISSUE', data.url.match(issueRegex)[0] ?? '')

                        let promises = []

                        if (rootGetters['issues/hasIssue'](getters['currentIssue'])) {
                            promises.push(dispatch('issues/openIssue', getters['currentIssue']))
                        } else {
                            promises.push(dispatch('issues/createIssue', getters['currentIssue']))
                        }

                        commit('SET_SWITCH_TAB', 'jira')

                        Promise.all(promises).then(() => {
                            resolve()
                        })
                    } else if ('' !== jenkinsUrl && data.url.startsWith(jenkinsUrl)) {
                        commit('SET_SWITCH_TAB', 'jenkins')

                        resolve()
                    } else if ('' !== gitLabUrl && data.url.startsWith(gitLabUrl)) {
                        commit('SET_SWITCH_TAB', 'gitLab')

                        resolve()
                    } else {
                        resolve()
                    }
                })
            })
        },
        checkOptions: async ({rootGetters, commit}) => {
            // Check jira url is available and any board is configured
            let jiraUrl = rootGetters['jira/getUrl']
            let boards = rootGetters['jira/getBoards']

            commit(
                'CHANGE_OPTIONS_VALID',
                Helper.isURL(jiraUrl) && boards.length > 0,
            )
        },
        changeMainTab: ({commit}, tab) => {
            commit('SET_TAB_CONFIG_MAIN', tab)
            chrome.storage.local.set({'optionsTab': tab})
        },
        openTab: ({commit}, tab) => {
            commit('CHANGE_OPEN_TAB', tab)
        },
        autoChangeOpenTab: ({state, commit}) => {
            state.optionTabs.forEach((tab, key) => {
                if (tab.id === state.configTabs.main) {
                    commit('CHANGE_OPEN_TAB', key)
                    chrome.storage.local.set({'optionsTab': ''})
                }
            })
        },
        saveOptions: ({state, dispatch}) => {
            let options = {
                options: {
                    modules: state.modules,
                    version: state.version,
                },
            }

            let promises = []

            promises.push(dispatch('jira/save'))
            promises.push(dispatch('jenkins/save'))
            promises.push(dispatch('gitLab/save'))
            // promises.push(dispatch('chromeBrowser/save'))
            promises.push(dispatch('cheatSheet/save'))
            promises.push(dispatch('chat/save'))

            return new Promise(resolve => {
                Promise.all(promises).then(results => {
                    for (let result of results) {
                        options.options[result.key] = result.options
                    }

                    chrome.storage.local.set(options, () => {
                        resolve(options)
                    })
                })
            })
        },
        saveExportOptions: ({dispatch}, modules) => {
            return new Promise(resolve => {
                dispatch('saveOptions').then(options => {
                    options.exported = modules

                    for (let module of Object.keys(options.options)) {
                        if ('version' !== module && -1 === modules.indexOf(module)) {
                            options.options[module] = null
                        }
                    }

                    resolve(options)
                })
            })
        },
    },
    getters: {
        modules: state => state.modules,
        currentTab: async () => {
            let queryOptions = {active: true, currentWindow: true}
            let [tab] = await chrome.tabs.query(queryOptions)

            return tab
        },
        tabConfig: state => state.configTabs,
        optionsValid: state => state.optionsValid,
        currentIssue: state => state.currentIssue,
        switchTab: state => state.switchTab,
        openTab: state => state.openTab,
        currentUrl: state => state.currentUrl,
        optionTabs: state => state.optionTabs,
    },
    modules: {
        chat,
        cheatSheet,
        // chromeBrowser,
        gitLab,
        jenkins,
        jira,
        icons,
        issues,
    },
})


export default store
