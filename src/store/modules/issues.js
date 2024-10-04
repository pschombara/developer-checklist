import _ from 'lodash'

const state = {
    issues: [],
}

const migration = new IssueMigration()
const date = Math.floor(Date.now() / 1000)

export default {
    mutations: {
        ADD_ISSUE: (state, issue) => {
            const index = state.issues.findIndex(cmp => cmp.name === issue.name)

            if (-1 === index) {
                state.issues.push(issue)
            }
        },
        UPDATE_ISSUE: (state, updatedIssue) => {
            const index = state.issues.findIndex(issue => issue.name === updatedIssue.name)

            if (-1 !== index) {
                state.issues.splice(index, 1, updatedIssue)
            }
        },
        START_WORK: (state, issueKey) => {
            const issue = state.issues.find(elem => elem.name === issueKey)

            if (undefined !== issue) {
                issue.work = true
            }
        },
        STOP_WORK: (state, issueKey) => {
            const issue = state.issues.find(elem => elem.name === issueKey)

            if (undefined !== issue) {
                issue.work = false
            }
        },
        TOGGLE_CHECKLIST_CHECK: (state, data) => {
            const issue = state.issues.find(issue => issue.name === data.issue)

            if (undefined === issue) {
                return
            }

            if (false === Object.prototype.hasOwnProperty.call(issue.checklist, data.uuid)) {
                issue.checklist[data.uuid] = []
            }

            const index = issue.checklist[data.uuid].findIndex(id => id === data.id)

            if (-1 === index) {
                issue.checklist[data.uuid].push(data.id)
            } else {
                issue.checklist[data.uuid].splice(index, 1)
            }
        },
        UPDATE_DATE: (state, issue) => {
            const found = state.issues.find(elem => elem.name === issue)

            if (undefined === found) {
                return
            }

            found.updateDate = Math.floor(Date.now() / 1000)
        },
        ADD_MERGE_REQUEST: (state, data) => {
            const issue = state.issues.find(issue => issue.name === data.issue)

            if (undefined === issue) {
                return
            }

            if (undefined === issue.mergeRequests) {
                issue.mergeRequests = []
            }

            const mergeRequest = issue.mergeRequests.find(mr => mr.id === data.id && mr.number === data.number)

            if (undefined !== mergeRequest) {
                return
            }

            issue.mergeRequests.push({
                id: data.id,
                number: data.number,
                source: data.source,
            })
        },
        REMOVE_MERGE_REQUEST: (state, data) => {
            const issue = state.issues.find(issue => issue.name === data.issue)

            if (undefined === issue) {
                return
            }

            if (undefined === issue.mergeRequests) {
                return
            }

            const index = issue.mergeRequests.findIndex(mr => mr.id === data.id && mr.number === data.number)

            if (-1 === index) {
                return
            }

            issue.mergeRequests.splice(index, 1)
        },
        ADD_CI_BUILD: (state, data) => {
            const issue = state.issues.find(issue => issue.name === data.issue)

            if (undefined === issue) {
                return
            }

            if (undefined === issue.ciBuilds) {
                issue.ciBuilds = []
            }

            const ciBuild = issue.ciBuilds.find(cb => cb.job === data.job && cb.build === data.build)

            if (undefined !== ciBuild) {
                return
            }

            issue.ciBuilds.push({
                job: data.job,
                build: data.build,
            })
        },
        EXCHANGE_CI_BUILD: (state, data) => {
            const issue = state.issues.find(issue => issue.name === data.issue)

            if (undefined === issue) {
                return
            }

            if (undefined === issue.ciBuilds) {
                issue.ciBuilds = []
            }

            let replaced = false
            let builds = []

            for (let build of issue.ciBuilds) {
                if (build.job === data.job && replaced) {
                    continue
                }

                if (build.job === data.job) {
                    build.build = data.build
                    replaced = true
                }

                builds.push(build)
            }

            issue.ciBuilds = builds
        },
        REMOVE_CI_BUILD: (state, data) => {
            const issue = state.issues.find(issue => issue.name === data.issue)

            if (undefined === issue) {
                return
            }

            if (undefined === issue.ciBuilds) {
                return
            }

            const index = issue.ciBuilds.findIndex(cb => cb.job === data.job && cb.build === data.build)

            if (-1 === index) {
                return
            }

            issue.ciBuilds.splice(index, 1)
        },
    },
    actions: {
        addIssue: ({commit}, {key, issue}) => {
            if (migration.migrate(key, issue)) {
                issue.name = key
                commit('ADD_ISSUE', issue)
            }
        },
        createIssue: async ({commit, rootGetters, dispatch}, key) => {
            let issue = {
                updateDate: Math.floor(Date.now() / 1000),
                openTab: 'bookmark',
                title: '',
                checklist: {},
                version: migration.version,
                pinned: false,
                work: false,
                mergeRequests: [],
                ciBuilds: [],
                name: key,
            }

            let currentTab = rootGetters['currentTab']

            return new Promise(resolve => {
                currentTab.then(tab => {
                    chrome.scripting.executeScript(
                        {
                            target: {tabId: tab.id},
                            func: () => {
                                return document.querySelector('h1[data-testid="issue.views.issue-base.foundation.summary.heading"]').innerText
                            },
                        },
                        injectionResult => {
                            issue.title = injectionResult[0].result

                            let storeObject = {}

                            dispatch('initChecklists', issue).then(result => {
                                commit('ADD_ISSUE', result)

                                let copy = _.cloneDeep(result)

                                delete copy.name

                                storeObject[key] = copy

                                chrome.storage.local.set(storeObject)
                                resolve()
                            })
                        },
                    )
                })
            })
        },
        openIssue: ({getters, commit, dispatch}, key) => {
            let issue = _.cloneDeep(getters['issue'](key))

            issue.updateDate = Date.now() / 1000

            dispatch('initChecklists', issue).then(result => {
                commit('UPDATE_ISSUE', result)

                const obj = {}
                obj[key] = result

                chrome.storage.local.set(obj)
            })

        },
        removeIssue: ({commit}, key) => {
            commit('REMOVE_ISSUE', key)
            chrome.storage.local.remove(key)
        },
        cleanUp: ({commit, state, rootGetters}) => {
            let days = rootGetters['jira/getCleanup']

            for (let issue of state.issues) {
                if (false === issue.pinned && date - issue.updateDate > days * 86000) {
                    commit('REMOVE_ISSUE', issue.name)
                    chrome.storage.local.remove(issue.name)
                }
            }
        },
        updateStorage: ({commit, getters}, issueName, updateDate = true) => {
            if (updateDate) {
                commit('UPDATE_DATE', issueName)
            }

            const issue = getters['issue'](issueName)

            if (null === issue) {
                return
            }

            let copy = _.cloneDeep(issue)
            let key = copy.name
            let storeObject = {}

            delete copy.name

            storeObject[key] = copy

            chrome.storage.local.set(storeObject)
        },
        initChecklists: ({rootGetters}, issue) => {
            const checklists = rootGetters['jira/getChecklists']

            return new Promise(resolve => {
                for (let checklist of checklists) {
                    if (false === Object.prototype.hasOwnProperty.call(issue.checklist, checklist.uuid)) {
                        issue.checklist[checklist.uuid] = []
                    }
                }

                resolve(issue)
            })
        },
        toggleChecklistEntry: ({commit, dispatch}, data) => {
            commit('TOGGLE_CHECKLIST_CHECK', {
                issue: data.issue,
                uuid: data.uuid,
                id: data.id,
            })

            dispatch('updateStorage', data.issue)
        },
        startWork: ({commit, getters, dispatch}, issue) => {
            const inProgress = getters['inProgress']

            if (undefined !== inProgress) {
                commit('STOP_WORK', inProgress.name)
                dispatch('updateStorage', inProgress.name, false)
            }

            commit('START_WORK', issue)
            dispatch('updateStorage', issue, false)
        },
        stopWork: ({commit, dispatch}, issue) => {
            commit('STOP_WORK', issue)
            dispatch('updateStorage', issue, false)
        },
        attachMergeRequest: ({commit, dispatch}, data) => {
            commit('ADD_MERGE_REQUEST', {
                issue: data.issue,
                id: data.id,
                number: data.number,
                source: data.source,
            })

            dispatch('updateStorage', data.issue)
        },
        removeMergeRequest: ({commit, dispatch}, data) => {
            commit('REMOVE_MERGE_REQUEST', {
                issue: data.issue,
                id: data.id,
                number: data.number,
            })

            dispatch('updateStorage', data.issue)
        },
        attachCiBuild: ({commit, dispatch}, data) => {
            commit('ADD_CI_BUILD', {
                issue: data.issue,
                job: data.job,
                build: data.build,
            })

            dispatch('updateStorage', data.issue)
        },
        exchangeCiBuild: ({commit, dispatch}, data) => {
            commit('EXCHANGE_CI_BUILD', {
                issue: data.issue,
                job: data.job,
                build: data.build,
            })

            dispatch('updateStorage', data.issue)
        },
        removeCiBuild: ({commit, dispatch}, data) => {
            commit('REMOVE_CI_BUILD', {
                issue: data.issue,
                job: data.job,
                build: data.build,
            })

            dispatch('updateStorage', data.issue)
        },
    },
    getters: {
        list: state => state.issues,
        hasIssue: state => issueKey => -1 !== state.issues.findIndex(issue => issue.name === issueKey),
        issue: (state, getters) => issueKey => {
            if (getters['hasIssue'](issueKey)) {
                return state.issues.find(issue => issue.name === issueKey)
            }

            return null
        },
        issueRegex: (state, getters, rootState, rootGetters) => {
            if (0 === rootGetters['jira/getBoards'].length) {
                return new RegExp('\\w+-\\d+')
            }

            let regex = '(('
            let boards = rootGetters['jira/getBoards'].map(board => board.key)

            regex += boards.join('|') + ')-\\d+)'

            return new RegExp(regex)
        },
        issueKeys: state => state.issues.map(issue => issue.name),
        inProgress: state => state.issues.find(issue => issue.work),
    },
}
