import {defineStore} from 'pinia'
import {useJiraStorage} from './jira.js'

export const useIssueStorage = defineStore('issues', {
    state: () => ({
        issues: [],
    }),
    getters: {
        getRegex: () => {
            const jiraStorage = useJiraStorage()
            const boards = jiraStorage.getBoards.map(board => board.key)

            if (0 === boards.length) {
                return new RegExp('\\w+-\\d+')
            }

            return new RegExp(`((${boards.join('|')})-\\d+)`)
        },
        getIssues: state => state.issues,
    },
    actions: {
        async load() {
            const storageData = await chrome.storage.local.get(null)
            const regex = this.getRegex

            Object.entries(storageData).forEach(([key, issue]) => {
                if (regex.test(key)) {
                    this.issues.push({
                        key: key,
                        checklist: issue.checklist,
                        ciBuilds: issue.ciBuilds,
                        mergeRequests: issue.mergeRequests,
                        openTab: issue.openTab,
                        pinned: issue.pinned,
                        title: issue.title,
                        updateDate: issue.updateDate,
                        work: issue.work,
                    })
                }
            })
        },
        async reloadFromStorage(){
            this.issues = []
            await this.load()
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
        async updateInStorage(issue) {
            const storageData = {}
            const clone = {...issue}
            delete clone.key
            storageData[issue.key] = clone

            await chrome.storage.local.set(storageData)
        },
        async removeIssue(key){
            const index = this.issues.findIndex(issue => issue.key === key)

            if (-1 === index) {
                return
            }

            this.issues.splice(index, 1)
            await chrome.storage.local.delete(key)
        },
    },
})
