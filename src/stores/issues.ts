import {defineStore} from 'pinia'
import {useJiraStorage} from './jira.ts'
import {usePopupStorage} from './popup.ts'
import _ from 'lodash'
import {useGitLabStorage} from './gitlab.ts'
import {useJenkinsStorage} from './jenkins.ts'

export const useIssueStorage = defineStore('issues', {
    state: () => ({
        issues: [],
        loaded: false,
    }),
    getters: {
        getRegex: async () => {
            const jiraStorage = useJiraStorage()
            await jiraStorage.load()
            const boards = jiraStorage.getBoards.map(board => board.key)

            if (0 === boards.length) {
                return new RegExp('\\w+-\\d+')
            }

            return new RegExp(`((${boards.join('|')})-\\d+)`)
        },
        getIssues: state => state.issues,
        isLoaded: state => state.loaded,
        hasIssue: state => {
            return key => undefined !== state.issues.find(issue => issue.key === key)
        },
        getIssue: state => {
            return key => state.issues.find(issue => issue.key === key)
        },
    },
    actions: {
        async load(reload = false) {
            if (this.loaded && false === reload) {
                return
            }

            this.loaded = false

            const storageData = await browser.storage.local.get(null)
            const regex = await this.getRegex

            const gitLabStorage = useGitLabStorage()
            await gitLabStorage.load()

            const jenkinsStorage = useJenkinsStorage()
            await jenkinsStorage.load()

            Object.entries(storageData).forEach(([key, issue]) => {
                if (false === regex.test(key)) {
                    return
                }

                this.issues.push({
                    key: key,
                    checklist: issue.checklist,
                    ciBuilds: issue.ciBuilds.filter(build => undefined !== jenkinsStorage.getBuild(build.job)),
                    mergeRequests: issue.mergeRequests.filter(mr =>  undefined !== gitLabStorage.getProject(mr.id)),
                    openTab: issue.openTab,
                    pinned: issue.pinned,
                    title: issue.title,
                    updateDate: issue.updateDate,
                    work: issue.work,
                })

                const popupStorage = usePopupStorage()

                if (issue.work && null === popupStorage.getCurrentIssue) {
                    popupStorage.setCurrentIssue(key)
                }
            })

            this.loaded = true
        },
        async reloadFromStorage(){
            this.issues = []
            await this.load(true)
        },
        async pin(key) {
            const issue = this.issues.find(item => item.key === key)
            issue.pinned = true
            await this.updateInStorage(issue)
        },
        async unpin(key) {
            const issue = this.issues.find(item => item.key === key)
            issue.pinned = false
            await this.updateInStorage(issue)
        },
        async startWork(key) {
            const currentWork = this.issues.find(item => item.work)
            const startWork = this.issues.find(item => item.key === key)

            if (undefined !== currentWork) {
                currentWork.work = false
                await this.updateInStorage(currentWork)
            }

            if (undefined !== startWork) {
                startWork.work = true
                await this.updateInStorage(startWork)
            }
        },
        async stopWork(key) {
            const workIssue = this.issues.find(item => item.key === key)

            if (undefined === workIssue || false === workIssue.work) {
                return
            }

            workIssue.work = false
            await this.updateInStorage(workIssue)
        },
        async updateInStorage(issue) {
            const storageData = {}
            const clone = _.cloneDeep(issue)
            delete clone.key
            storageData[issue.key] = clone

            await browser.storage.local.set(storageData)
        },
        async removeIssue(key){
            const index = this.issues.findIndex(issue => issue.key === key)

            if (-1 === index) {
                return
            }

            this.issues.splice(index, 1)
            await browser.storage.local.delete(key)
        },
        async openIssue(key) {
            const issue = this.issues.find(item => item.key === key)

            issue.updateDate = Date.now() / 1000

            await this.initChecklist(issue)
            await this.updateInStorage(issue)
        },
        async createIssue(key, tab) {
            const issue = {
                key: key,
                checklist: {},
                ciBuilds: [],
                mergeRequests: [],
                openTab: 'bookmark',
                pinned: false,
                title: '',
                updateDate: Math.floor(Date.now() / 1000),
                work: false,
            }

            browser.scripting.executeScript(
                {
                    target: {tabId: tab.id},
                    func: () => {
                        return document.querySelector('h1[data-testid="issue.views.issue-base.foundation.summary.heading"]').innerText
                    },
                },
                async injectionResult => {
                    issue.title = injectionResult[0].result
                    await this.initChecklist(issue)
                    await this.updateInStorage(issue)

                    this.issues.push(issue)
                },
            )
        },
        async initChecklist(issue) {
            const jiraStorage = useJiraStorage()
            await jiraStorage.load()

            for (const checklist of jiraStorage.getChecklists) {
                if (undefined === issue.checklist[checklist.uuid]) {
                    issue.checklist[checklist.uuid] = []
                }
            }
        },
        async toggleChecklistEntry(issueKey, checklistUuid, uid) {
            const issue = this.getIssue(issueKey)

            if (undefined === issue) {
                return
            }

            issue.checklist[checklistUuid] ??= []

            const index = issue.checklist[checklistUuid].findIndex(id => id === uid)

            if (-1 === index) {
                issue.checklist[checklistUuid].push(uid)
            } else {
                issue.checklist[checklistUuid].splice(index, 1)
            }

            await this.updateInStorage(issue)
        },
        async clearChecklist(issueKey) {
            const issue = this.getIssue(issueKey)

            if (undefined === issue) {
                return
            }

            issue.checklist = []
            await this.initChecklist(issue)
            await this.updateInStorage(issue)
        },
        async addCiBuild(issueKey, job, build) {
            const issue = this.getIssue(issueKey)

            if (undefined === issue) {
                return
            }

            if (-1 !== issue.ciBuilds.findIndex(cb => cb.job === job && cb.build === build)) {
                return
            }

            issue.ciBuilds.push({
                job: job,
                build: build,
            })

            await this.updateInStorage(issue)
        },
        async exchangeCiBuild(issueKey, job, buildId) {
            const issue = this.getIssue(issueKey)

            if (undefined === issue) {
                return
            }

            for (const build of issue.ciBuilds) {
                if (build.job === job) {
                    build.build = buildId

                    break
                }
            }

            await this.updateInStorage(issue)
        },
        async removeCiBuild(issueKey, job, build) {
            const issue = this.getIssue(issueKey)

            if (undefined === issue) {
                return
            }

            const index = issue.ciBuilds.findIndex(cb => cb.job === job && cb.build === build)

            if (-1 === index) {
                return
            }

            issue.ciBuilds.splice(index, 1)

            await this.updateInStorage(issue)
        },
        async addMergeRequest(issueKey, id, number, source) {
            const issue = this.getIssue(issueKey)

            if (undefined === issue) {
                return
            }

            const mergeRequest = issue.mergeRequests.find(mr => mr.id === id && mr.number === number)

            if (undefined !== mergeRequest) {
                return
            }

            issue.mergeRequests.push({
                id: id,
                number: number,
                source: source,
            })

            await this.updateInStorage(issue)
        },
        async removeMergeRequest(issueKey, id, number) {
            const issue = this.getIssue(issueKey)

            if (undefined === issue) {
                return
            }

            const index = issue.mergeRequests.findIndex(mr => mr.id === id && mr.number === number)

            if (-1 === index) {
                return
            }

            issue.mergeRequests.splice(index, 1)

            await this.updateInStorage(issue)
        },
    },
})
