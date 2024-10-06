import chat from './modules/chat'
import cheatSheet from './modules/cheatSheet'
import gitLab from './modules/gitLab'
import jenkins from './modules/jenkins'
import jira from './modules/jira'
import Migration from '../mixins/migration'
/* import chromeBrowser from './modules/chromeBrowser' */
import icons from './modules/icons'
import issues from './modules/issues'
import Helper from '../mixins/helper'
import {createStore} from 'vuex'

const migration = new Migration()

const state = {
    version: migration.version,
    configTabs: {
        main: 'general',
    },
    optionsValid: false,
    currentIssue: null,
    currentUrl: '',
    switchTab: null,
    openTab: null,
}

const store = createStore({
    state,
    actions: {
        load: ({ commit, dispatch, rootGetters }) => {
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

                            if (Object.prototype.hasOwnProperty.call(storageData, 'theme')) {
                                commit('CHANGE_THEME_SCHEMA', storageData['theme']['schema'])
                                commit('CHANGE_THEME_COLOR', storageData['theme']['color'])

                                window.dispatchEvent(new CustomEvent('themeChanged', {detail: storageData['theme']}))
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
                        const options = migration.migrate(storageData, []).options

                        commit('SET_MODULES', options.general.modules)
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
                    if ('general' === setting) {
                        commit('SET_MODULES', options.general.modules)
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
        storeTheme: ({state}) => {
            chrome.storage.local.set({theme: {schema: state.themeSchema, color: state.themeColor}})
        },
        openTab: ({commit}, tab) => {
            commit('CHANGE_OPEN_TAB', tab)
        },
        autoChangeOpenTab: ({state, commit}) => {
            for (const tab of state.optionTabs) {
                if (tab.id === state.configTabs.main) {
                    commit('CHANGE_OPEN_TAB', tab.id)
                    chrome.storage.local.set({'optionsTab': ''})

                    break
                }
            }
        },
        saveOptions: ({state, dispatch}) => {
            let options = {
                options: {
                    general: {
                        modules: state.modules,
                    },
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
        themeSchema: state => state.themeSchema,
        themeColor: state => state.themeColor,
    },
    modules: {
        chat,
        cheatSheet,
        // chromeBrowser,
        gitLab,
        jenkins,
        jira,
        issues,
    },
})


export default store
