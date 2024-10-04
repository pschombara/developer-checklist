import {defineStore} from 'pinia'
import Helper from '../mixins/helper.js'
import {toRaw} from 'vue'
import {Uuid} from '../mixins/uuid.js'
import checklist from '../components/popup/Jira/Checklist.vue'

export const useJiraStorage = defineStore('jira', {
    state: () => ({
        url: '',
        cleanup: 7,
        maximumIssues: 6,
        boards: [],
        checklists: [],
        templates: [],
    }),
    getters: {
        getChecklists: state => state.checklists,
        getBoards: state => state.boards,
        getTemplates: state => state.templates,
        getUrl: state => state.url,
        getCleanup: state => state.cleanup,
        getMaximumIssues: state => state.maximumIssues,
        getChecklist: state => {
            return uuid => {
                return state.checklists.find(checklist => checklist.uuid === uuid)
            }
        },
        getCategory: state => {
            return (uuid, uid) => {
                const checklist = state.checklists.find(checklist => checklist.uuid === uuid)

                return checklist.checklist.find(category => category.uid === uid)
            }
        },
    },
    actions: {
        async load() {
            const options = await chrome.storage.local.get('optionsJira')

            this.host = options.optionsJira.host
            this.cleanup = options.optionsJira.cleanup
            this.maximumIssues = options.optionsJira.maximumIssues

            options.optionsJira.boards.forEach(board => {
                this.boards.push({key: board.key, default: board.default})
            })

            options.optionsJira.checklists.forEach(checklist => {
                this.checklists.push(
                    {
                        uuid: checklist.uuid,
                        name: checklist.name,
                        icon: checklist.icon,
                        enabled: checklist.enabled,
                        successRequiredAll: checklist.successRequiredAll,
                        buttons: checklist.buttons,
                        checklist: checklist.checklist,
                    },
                )
            })

            options.optionsJira.templates.forEach(template => {
                this.templates.push(
                    {
                        id: template.id,
                        title: template.title,
                        subTitle: template.subTitle,
                        content: template.content,
                        sort: template.sort,
                    },
                )
            })

            Helper.resort(this.templates)
        },
        async save() {
            await chrome.storage.local.set({optionsJira: {
                url: toRaw(this.host),
                cleanup: toRaw(this.cleanup),
                maximumIssues: toRaw(this.maximumIssues),
                boards: toRaw(this.boards),
                checklists: toRaw(this.checklists),
                templates: toRaw(this.templates),
            }})
        },
        updateUrl(url) {
            this.url = url
        },
        updateCleanup(cleanup) {
            this.cleanup = cleanup
        },
        updateMaximumIssues(maximumIssues) {
            this.maximumIssues = maximumIssues
        },
        addBoard(key, isDefault) {
            const currentDefault = this.boards.find(board => board.default)
            currentDefault.default = !isDefault

            this.boards.push({key: key, default: isDefault})
        },
        updateBoard(prevKey, key, isDefault) {
            const board = this.boards.find(board => board.key === prevKey)
            board.key = key

            if (isDefault && false === board.default) {
                const prevDefault = this.boards.find(board => board.default)

                board.default = true
                prevDefault.default = false
            }
        },
        removeBoard(key) {
            const index = this.boards.findIndex(board => board.key === key)

            if (-1 !== index) {
                this.boards.splice(index, 1)
            }
        },
        addTemplate(title, subTitle, content) {
            this.templates.push(
                {
                    id: Uuid.generate(),
                    title: title,
                    subTitle: subTitle,
                    content: content,
                    sort: Number.MAX_SAFE_INTEGER,
                },
            )

            Helper.resort(this.templates)
        },
        updateTemplate(id, title, subTitle, content) {
            const template = this.templates.find(template => template.id === id)

            if (undefined === template) {
                return
            }

            template.title = title
            template.subTitle = subTitle
            template.content = content
        },
        removeTemplate(id) {
            const index = this.templates.findIndex(template => template.id === id)

            if (-1 !== index) {
                this.templates.splice(index, 1)
            }
        },
        templateSortBefore(currentId, refId) {
            const current = this.templates.find(template => template.id === currentId)
            const ref = this.templates.find(template => template.id === refId)

            Helper.sortBefore(this.templates, current, ref, 'id')
        },
        templateSortAfter(currentId, refId) {
            const current = this.templates.find(template => template.id === currentId)
            const ref = this.templates.find(template => template.id === refId)

            Helper.sortAfter(this.templates, current, ref, 'id')
        },
        updateChecklistName(uuid, name) {
            const checklist = this.checklists.find(checklist => checklist.uuid === uuid)

            if (undefined === checklist) {
                return
            }

            checklist.name = name
        },
        updateChecklistIcon(uuid, icon) {
            const checklist = this.checklists.find(checklist => checklist.uuid === uuid)

            if (undefined === checklist) {
                return
            }

            checklist.icon = icon
        },
        updateChecklistEnabled(uuid, enabled) {
            const checklist = this.checklists.find(checklist => checklist.uuid === uuid)

            if (undefined === checklist) {
                return
            }

            checklist.icon = enabled
        },
        updateBtnSuccess(uuid, enabled, text, comment, autoComment, successRequiredAll) {
            const checklist = this.checklists.find(checklist => checklist.uuid === uuid)

            if (undefined === checklist) {
                return
            }

            checklist.successRequiredAll = successRequiredAll
            checklist.buttons.success = {
                enabled: enabled,
                text: text,
                comment: comment,
                autoComment: autoComment,
            }
        },
        updateBtnFailed(uuid, enabled, text, comment, autoComment) {
            const checklist = this.checklists.find(checklist => checklist.uuid === uuid)

            if (undefined === checklist) {
                return
            }

            checklist.buttons.failed = {
                enabled: enabled,
                text: text,
                comment: comment,
                autoComment: autoComment,
            }
        },
        removeCategory(uuid, uid) {
            const checklist = this.checklists.find(checklist => checklist.uuid === uuid)

            if (undefined === checklist) {
                return
            }

            const index = checklist.category.findIndex(category => category.uuid === uid)

            if (-1 !== index) {
                checklist.category.splice(index, 1)
            }
        },
        categorySortBefore(checklistUuid, currentId, refId) {
            const checklist = this.checklists.find(checklist => checklist.uuid === checklistUuid)

            if (undefined === checklist) {
                return
            }

            const current = checklist.checklist.find(item => item.uid === currentId)
            const ref = checklist.checklist.find(item => item.uid === refId)

            Helper.sortBefore(checklist.checklist, current, ref, 'uid')
        },
        categorySortAfter(checklistUuid, currentId, refId) {
            const checklist = this.checklists.find(checklist => checklist.uuid === checklistUuid)

            if (undefined === checklist) {
                return
            }

            const current = checklist.checklist.find(item => item.uid === currentId)
            const ref = checklist.checklist.find(item => item.uid === refId)

            Helper.sortAfter(checklist.checklist, current, ref, 'uid')
        },
    },
})
