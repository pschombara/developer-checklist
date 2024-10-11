import {defineStore} from 'pinia'
import {useJiraStorage} from './jira.js'
import Helper from '../mixins/helper.js'
import {useIssueStorage} from './issues.js'
import {useJenkinsStorage} from './jenkins.js'
import {useGitLabStorage} from './gitlab.js'

export const usePopupStorage = defineStore('popup', {
    state: () => ({
        optionsValid: false,
        currentIssue: null,
        currentUrl: '',
        switchTab: null,
    }),
    getters: {
        getSwitchTab: state => state.switchTab,
        hasValidOptions: state => state.optionsValid,
        getCurrentIssue: state => state.currentIssue,
    },
    actions: {
        async checkOptions() {
            const jiraStorage = useJiraStorage()
            await jiraStorage.load()

            this.optionsValid = Helper.isURL(jiraStorage.getUrl) && jiraStorage.getBoards.length > 0
        },
        async checkUrl() {
            if (false === this.optionsValid) {
                return
            }

            const jiraStorage = useJiraStorage()
            await jiraStorage.load()

            const data = await this.fetchCurrentTab()
            this.currentUrl = data.url
            const issueStorage = useIssueStorage()

            if (this.currentUrl.startsWith(jiraStorage.getUrl)) {
                const regex = await issueStorage.getRegex

                if (false === regex.test(this.currentUrl)) {
                    return
                }

                this.currentIssue = this.currentUrl.match(regex)[0] ?? null

                await issueStorage.load()

                if (issueStorage.hasIssue(this.currentIssue)) {
                    await issueStorage.openIssue(this.currentIssue)
                } else {
                    await issueStorage.createIssue(this.currentIssue, data)
                }

                this.switchTab = 'jira'

                return
            }

            const jenkinsStorage = useJenkinsStorage()
            await jenkinsStorage.load()

            if (this.currentUrl.startsWith(jenkinsStorage.getHost)) {
                this.switchTab = 'jenkins'

                return
            }

            const gitlabStorage = useGitLabStorage()
            await gitlabStorage.load()

            if (this.currentUrl.startsWith(gitlabStorage.getHost)) {
                this.switchTab = 'gitLab'
            }
        },
        setCurrentIssue(issueKey) {
            this.currentIssue = issueKey
        },
        async fetchCurrentTab() {
            const [tab] = await chrome.tabs.query({active: true, currentWindow: true})
            return await tab
        },
    },
})
