import Helper from '../../mixins/helper'
import {Uuid} from '../..//mixins/uuid'
import {toRaw} from 'vue'

const state = {
    url: '',
    cleanup: 7,
    maximumIssues: 6,
    boards: [],
    checklists: [],
    templates: [],
}

export default {
    strict: import.meta.env.NODE_ENV !== 'production',
    namespaced: true,
    modules: {},
    state,
    mutations: {
        SET_URL: (state, url) => {
            state.url = url
        },
        SET_CLEANUP: (state, days) => {
            state.cleanup = days
        },
        SET_MAXIMUM_ISSUES: (state, issues) => {
            state.maximumIssues = issues
        },
        ADD_BOARD: (state , board) => {
            state.boards.push({
                key: board.key,
                default: board.default,
            })
        },
        REMOVE_BOARD: (state, board) => {
            const index = state.boards.findIndex(item => item.key === board.key)

            if (-1 !== index) {
                state.boards.splice(index, 1)
            }
        },
        UPDATE_BOARD: (state, data) => {
            const index = state.boards.findIndex(board => board.key === data.previous.key)

            if (-1 !== index) {
                state.boards.splice(index, 1, data.board)
            }
        },
        CHANGE_DEFAULT_BOARD: (state, defaultKey) => {
            for (let board of state.boards) {
                board.default = board.key === defaultKey
            }
        },
        ADD_CHECKLIST: (state, checklist) => {
            state.checklists.push({
                uuid: checklist.uuid,
                name: checklist.name,
                icon: checklist.icon,
                enabled: checklist.enabled,
                successRequiredAll: checklist.successRequiredAll,
                buttons: checklist.buttons,
                checklist: checklist.checklist,
            })
        },
        UPDATE_CHECKLIST_NAME: (state, data) => {
            const update = state.checklists.find(checklist => checklist.uuid === data.uuid)

            if (undefined !== update) {
                update.name = data.name
            }
        },
        UPDATE_CHECKLIST_ICON: (state, data) => {
            const update = state.checklists.find((checklist => checklist.uuid === data.uuid))

            if (undefined !== update) {
                update.icon = data.icon
            }
        },
        UPDATE_CHECKLIST_ENABLED: (state, data) => {
            const update = state.checklists.find((checklist => checklist.uuid === data.uuid))

            if (undefined !== update) {
                update.enabled = data.enabled
            }
        },
        UPDATE_BUTTON_SUCCESS: (state, data) => {
            const update = state.checklists.find((checklist => checklist.uuid === data.uuid))

            if (undefined !== update) {
                update.buttons.success = {
                    enabled: data.button.enabled,
                    text: data.button.text,
                    comment: data.button.comment,
                    autoComment: data.button.autoComment,
                }

                update.successRequiredAll = data.button.successRequiredAll
            }
        },
        UPDATE_BUTTON_FAILED: (state, data) => {
            const update = state.checklists.find((checklist => checklist.uuid === data.uuid))

            if (undefined !== update) {
                update.buttons.failed = {
                    enabled: data.button.enabled,
                    text: data.button.text,
                    comment: data.button.comment,
                    autoComment: data.button.autoComment,
                }
            }
        },
        CLEAR: state => {
            state.url = ''
            state.cleanup = 7
            state.maximumIssues = 6
            state.boards = []
            state.checklists = []
            state.templates = []
        },
        CATEGORY_MOVE_BEFORE: (state, data) => {
            const checklist = state.checklists.find(checklist => checklist.uuid === data.uuid)
            const current = checklist.checklist.find(item => item.uid === data.current)
            const reference = checklist.checklist.find(item => item.uid === data.ref)

            Helper.sortBefore(checklist.checklist, current, reference, 'uid')
        },
        CATEGORY_MOVE_AFTER: (state, data) => {
            const checklist = state.checklists.find(checklist => checklist.uuid === data.uuid)
            const reference = checklist.checklist.find(item => item.uid === data.ref)
            const current = checklist.checklist.find(item => item.uid === data.current)

            Helper.sortAfter(checklist.checklist, current, reference, 'uid')
        },
        UPDATE_CATEGORY: (state, data) => {
            let checklist = state.checklists.find(checklist => checklist.uuid === data.uuid)
            let category = checklist.checklist.find(category => category.uid === data.category.uid)

            category.title = data.category.title
            category.items = data.category.items

            Helper.resort(category.items)
        },
        REMOVE_CATEGORY: (state, data) => {
            const checklist = state.checklists.find(checklist => checklist.uuid === data.uuid)

            if (undefined === checklist) {
                return
            }

            const categoryIndex = checklist.checklist.findIndex(category => category.uid === data.uid)

            if (-1 === categoryIndex) {
                return
            }

            checklist.checklist.splice(categoryIndex, 1)

            Helper.resort(checklist.checklist)
        },
        ADD_CATEGORY: (state, data) => {
            const checklist = state.checklists.find(checklist => checklist.uuid === data.uuid)

            if (undefined === checklist) {
                return
            }

            checklist.checklist.push({
                uid: Uuid.generate(),
                title: data.category.title,
                items: data.category.items,
                sort: Number.MAX_SAFE_INTEGER,
            })

            Helper.resort(checklist.checklist)
        },
        ADD_TEMPLATE: (state, template) => {
            state.templates.push({
                id: template.id,
                title: template.title,
                subTitle: template.subTitle,
                content: template.content,
                sort: template.sort,
            })

            Helper.resort(state.templates)
        },
        UPDATE_TEMPLATE: (state, updateData) => {
            const template = state.templates.find(elem => elem.id === updateData.id)

            if (undefined === template) {
                return
            }

            template.title = updateData.title
            template.subTitle = updateData.subTitle
            template.content = updateData.content
            template.sort = updateData.sort
        },
        REMOVE_TEMPLATE: (state, id) => {
            const index = state.templates.findIndex(template => template.id === id)

            if (-1 === index) {
                return
            }

            state.templates.splice(index, 1)

            Helper.resort(state.templates)
        },
        SORT_TEMPLATE_BEFORE: (state, data) => {
            const current = state.templates.find(template => template.id === data.current)
            const reference = state.templates.find(template => template.id === data.ref)

            Helper.sortBefore(state.templates, current, reference, 'sort')
        },
        SORT_TEMPLATE_AFTER: (state, data) => {
            const current = state.templates.find(template => template.id === data.current)
            const reference = state.templates.find(template => template.id === data.ref)

            Helper.sortAfter(state.templates, current, reference, 'sort')
        },
    },
    actions: {
        init: ({commit}, options) => {
            return new Promise(resolve => {
                commit('CLEAR')

                commit('SET_URL', options.url)
                commit('SET_CLEANUP', options.cleanup)
                commit('SET_MAXIMUM_ISSUES', options.maximumIssues)

                for (let board of options.boards) {
                    commit('ADD_BOARD', {
                        key: board.key,
                        default: board.default,
                    })
                }

                for (let checklist of options.checklists) {
                    commit('ADD_CHECKLIST', checklist)
                }

                for (let template of options.templates) {
                    commit('ADD_TEMPLATE', template)
                }

                resolve()
            })
        },
        updateUrl: ({commit}, url) => {
            commit('SET_URL', url)
        },
        updateCleanup: ({commit}, cleanup) => {
            commit('SET_CLEANUP', cleanup)
        },
        updateMaximumIssues: ({commit}, issues) => {
            commit('SET_MAXIMUM_ISSUES', issues)
        },
        removeBoard: ({commit}, board) => {
            commit('REMOVE_BOARD', board)
        },
        updateBoard: ({commit}, data) => {
            commit('UPDATE_BOARD', {
                previous: data.previous,
                board: data.board,
            })

            if (data.board.default && false === data.previous.default) {
                commit('CHANGE_DEFAULT_BOARD', data.board.key)
            }
        },
        addBoard: ({commit}, board) => {
            commit('ADD_BOARD', {
                key: board.key,
                default: board.default,
            })

            if (board.default) {
                commit('CHANGE_DEFAULT_BOARD', board.key)
            }
        },
        updateChecklistName: ({commit}, data) => {
            commit('UPDATE_CHECKLIST_NAME', {uuid: data.uuid, name: data.name})
        },
        updateChecklistIcon: ({commit}, data) => {
            commit('UPDATE_CHECKLIST_ICON', {uuid: data.uuid, icon: data.icon})
        },
        updateChecklistEnabled: ({commit}, data) => {
            commit('UPDATE_CHECKLIST_ENABLED', {uuid: data.uuid, enabled: data.enabled})
        },
        updateButtonSuccess: ({commit}, data) => {
            commit('UPDATE_BUTTON_SUCCESS', data)
        },
        updateButtonFailed: ({commit}, data) => {
            commit('UPDATE_BUTTON_FAILED', data)
        },
        categoryMoveBefore: ({commit}, data) => {
            commit('CATEGORY_MOVE_BEFORE', {
                uuid: data.uuid,
                current: data.current,
                ref: data.ref,
            })
        },
        categoryMoveAfter: ({commit}, data) => {
            commit('CATEGORY_MOVE_AFTER', {
                uuid: data.uuid,
                current: data.current,
                ref: data.ref,
            })
        },
        updateCategory: ({commit}, data) => {
            commit('UPDATE_CATEGORY', {
                uuid: data.uuid,
                category: data.category,
            })
        },
        removeCategory: ({commit}, data) => {
            commit('REMOVE_CATEGORY', {
                uuid: data.uuid,
                uid: data.uid,
            })
        },
        addCategory: ({commit}, data) => {
            commit('ADD_CATEGORY', {
                uuid: data.uuid,
                category: data.category,
            })
        },
        addTemplate: ({commit, getters}, data) => {
            commit('ADD_TEMPLATE', {
                id: Uuid.generate(),
                title: data.title,
                subTitle: data.subTitle,
                content: data.content,
                sort: getters['nextTemplateSort'],
            })
        },
        updateTemplate: ({commit}, data) => {
            commit('UPDATE_TEMPLATE', {
                id: data.id,
                title: data.title,
                subTitle: data.subTitle,
                content: data.content,
                sort: data.sort,
            })
        },
        removeTemplate: ({commit}, id) => {
            commit('REMOVE_TEMPLATE', id)
        },
        templateSortBefore: ({commit}, data) => {
            commit('SORT_TEMPLATE_BEFORE', {
                current: data.current,
                ref: data.ref,
            })
        },
        templateSortAfter: ({commit}, data) => {
            commit('SORT_TEMPLATE_AFTER', {
                current: data.current,
                ref: data.ref,
            })
        },
        save: ({state}) => {
            return new Promise(resolve => {
                resolve({
                    key: 'jira',
                    options: {
                        url: toRaw(state.url),
                        cleanup: toRaw(state.cleanup),
                        maximumIssues: toRaw(state.maximumIssues),
                        boards: toRaw(state.boards),
                        checklists: toRaw(state.checklists),
                        templates: toRaw(state.templates),
                    },
                })
            })
        },
        addComment: ({rootGetters, getters, dispatch}, data) => {
            const currentTab = rootGetters['currentTab']
            const template = getters['getTemplate'](data.uuid)
            let comment = ''

            if (undefined !== template) {
                comment = template.content
            }

            const createComment = async (comment, sendImmediately) => {
                new Promise(resolve => {
                    // try to find button on detail page
                    let btnComment = document.querySelector('button[data-testid="issue-activity-feed.ui.buttons.Comments"]')

                    if (null === btnComment) {
                        resolve()

                        return
                    }

                    btnComment.click()

                    window.setTimeout(() => resolve(), 300)
                }).then(() => {
                    let commentArea = document.querySelector('.ak-editor-content-area > div[role=textbox]')

                    new Promise(resolve => {
                        if (null === commentArea) {
                            document.dispatchEvent(new KeyboardEvent('keydown', {key: 'm'}))

                            window.setTimeout(() => {
                                commentArea = document.querySelector('.ak-editor-content-area > div[role=textbox]')

                                resolve()
                            }, 300)
                        } else {
                            resolve()
                        }
                    }).then(() => {
                        if (null === commentArea) {
                            return
                        }

                        commentArea.innerHTML = comment

                        const sendButton = document.querySelector('button[data-testid="comment-save-button"]')

                        if (sendImmediately) {
                            sendButton.click()
                        }
                    })
                })
            }

            dispatch('commentReplacePlaceholders', comment).then(result => {
                currentTab.then(tab => {
                    chrome.scripting.executeScript({
                        target: {tabId: tab.id},
                        func: createComment,
                        args: [result, data.autoComment],
                    },
                    (injectionResults) => {
                        let result = injectionResults[0]

                        if (false === result.result) {
                            throw new Error('Could add comment')
                        }
                    })
                })
            })
        },
        commentReplacePlaceholders: ({rootGetters}, comment) => {
            return new Promise(resolve => {
                const currentIssue = rootGetters['currentIssue']
                const issue = rootGetters['issues/issue'](currentIssue)
                const mergeRequests = []
                const ciBuilds = []

                if (null === issue) {
                    resolve(comment)

                    return
                }

                for (let mergeRequest of issue.mergeRequests ?? []) {
                    mergeRequests.push(

                        '<li>' + rootGetters['gitLab/url'](
                            mergeRequest.id,
                            mergeRequest.number,
                            mergeRequest.source,
                            true,
                        ) + '</li>',
                    )
                }

                for (let ciBuild of issue.ciBuilds ?? []) {
                    ciBuilds.push(
                        '<li>' + rootGetters['jenkins/url'](
                            ciBuild.job,
                            ciBuild.build,
                            true,
                        ) + '</li>',
                    )
                }

                comment = comment.replace('[mergeRequests]', `<ul>${mergeRequests.join('\n')}</ul>`)

                resolve(comment.replace('[ciBuilds]', `<ul>${ciBuilds.join('\n')}</ul>`))
            })
        },
    },
    getters: {
        getUrl: state => state.url,
        getCleanup: state => state.cleanup,
        getMaximumIssues: state => state.maximumIssues,
        getBoards: state => state.boards,
        getChecklists: state => state.checklists,
        getChecklist: state => uuid => state.checklists.find(checklist => checklist.uuid === uuid),
        getCategory: state => (uuid, categoryId) => {
            let checklist = state.checklists.find(checklist => checklist.uuid === uuid)

            return  checklist.checklist.find(category => category.uid === categoryId)
        },
        templates: state => state.templates,
        getTemplate: state => uuid => state.templates.find(template => template.id === uuid),
        nextTemplateSort: state => Math.max(...state.templates.map(template => template.sort)) + 1,
    },
}
