import {defineStore} from 'pinia'
import Helper from '../mixins/helper.js'

export const useJira = defineStore('jira', {
    state: {
        url: '',
        cleanup: 7,
        maximumIssues: 6,
        boards: [],
        checklists: [],
        templates: [],
    },
    actions: {
        init: options => {
            this.url = options.url
            this.cleanup = options.cleanup
            this.maximumIssues = options.maximumIssues

            options.boards.forEach(board => this.addBoard(board.key, board.default))
            options.checklists.forEach(checklist => this.addChecklist(checklist))
            options.templates.forEach(template => this.addTemplate(template))
        },
        addBoard: (key, def) => {
            this.boards.push({key: key, default: def})
        },
        addChecklist: data => {
            this.checklists.push({
                uuid: data.uuid,
                name: data.name,
                icon: data.icon,
                enabled: data.enabled,
                successRequiredAll: data.successRequiredAll,
                buttons: data.buttons,
                checklist: data.checklist,
            })
        },
        addTemplate: data => {
            this.templates.push({
                id: data.id,
                title: data.title,
                subTitle: data.subTitle,
                content: data.content,
                sort: data.sort,
            })

            Helper.resort(this.templates)
        },
    },
    getters: {},
})
