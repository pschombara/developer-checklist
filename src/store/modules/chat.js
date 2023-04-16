import {Uuid} from '../../mixins/uuid'
import Helper from '../../mixins/helper'
import {Google} from '../../mixins/chat/google'
import {Discord} from '../../mixins/chat/discord'
import {toRaw} from 'vue'
import {da} from 'vuetify/locale'

const chatWorker = new Worker('../..//worker/chat.js')

const STATUS_READY = 'ready'
const STATUS_SUCCESS = 'success'
const STATUS_ERROR = 'error'
const STATUS_PROGRESS = 'progress'

let state = {
    clients: {},
    status: STATUS_READY,
}

export default {
    strict: import.meta.env.NODE_ENV !== 'production',
    namespaced: true,
    modules: {},
    state,
    mutations: {
        ADD_ROOM: (state, data) => {
            if (undefined === state.clients[data.client]) {
                return
            }

            state.clients[data.client].rooms.push(data.room)
        },
        REMOVE_ROOM: (state, data) => {
            if (undefined === state.clients[data.client]) {
                return
            }

            const index = state.clients[data.client].rooms.findIndex(room => room.id === data.id)

            if (-1 !== index) {
                state.clients[data.client].rooms.splice(index, 1)
            }

            Helper.resort(state.clients[data.client].rooms)
        },
        UPDATE_ROOM: (state, data) => {
            if (undefined === state.clients[data.client]) {
                return
            }

            const room = state.clients[data.client].rooms.find(elem => elem.id === data.room.id)

            if (undefined !== room) {
                room.name = data.room.name
                room.url = data.room.url
            }
        },
        ADD_MESSAGE: (state, data) => {
            if (undefined === state.clients[data.client]) {
                return
            }

            state.clients[data.client].messages.push(data.message)
        },
        REMOVE_MESSAGE: (state, data) => {
            if (undefined === state.clients[data.client]) {
                return
            }

            const index = state.clients[data.client].messages.findIndex(message => message.id === data.id)

            if (-1 !== index) {
                state.clients[data.client].messages.splice(index, 1)
            }

            Helper.resort(state.clients[data.client].messages)
        },
        UPDATE_MESSAGE: (state, data) => {
            if (undefined === state.clients[data.client]) {
                return
            }

            const message = state.clients[data.client].messages.find(elem => elem.id === data.message.id)

            if (undefined !== message) {
                message.name = data.message.name
                message.content = data.message.content
            }
        },
        CHANGE_ENABLED: (state, data) => {
            if (undefined === state.clients[data.client]) {
                return
            }

            state.clients[data.client].enabled = data.enabled
        },
        CHANGE_MAIN: (state, client) => {
            if (undefined === state.clients[client]) {
                return
            }

            state.clients[client].main = true

            for (let [clientName, data] of Object.entries(state.clients)) {
                if (clientName !== client) {
                    data.main = false
                }
            }
        },
        SORT_ROOM_AFTER: (state, data) => {
            if (undefined === state.clients[data.client]) {
                return
            }

            const current = state.clients[data.client].rooms.find(room => room.id === data.current)
            const reference = state.clients[data.client].rooms.find(room => room.id === data.ref)

            Helper.sortAfter(state.clients[data.client].rooms, current, reference, 'sort')
        },
        SORT_ROOM_BEFORE: (state, data) => {
            if (undefined === state.clients[data.client]) {
                return
            }

            const current = state.clients[data.client].rooms.find(room => room.id === data.current)
            const reference = state.clients[data.client].rooms.find(room => room.id === data.ref)

            Helper.sortBefore(state.clients[data.client].rooms, current, reference, 'sort')
        },
        SORT_MESSAGE_AFTER: (state, data) => {
            if (undefined === state.clients[data.client]) {
                return
            }

            const current = state.clients[data.client].messages.find(message => message.id === data.current)
            const reference = state.clients[data.client].messages.find(message => message.id === data.ref)

            Helper.sortAfter(state.clients[data.client].messages, current, reference, 'sort')
        },
        SORT_MESSAGE_BEFORE: (state, data) => {
            if (undefined === state.clients[data.client]) {
                return
            }

            const current = state.clients[data.client].messages.find(message => message.id === data.current)
            const reference = state.clients[data.client].messages.find(message => message.id === data.ref)

            Helper.sortBefore(state.clients[data.client].messages, current, reference, 'sort')
        },
        STATUS_READY: state => {
            state.status = STATUS_READY
        },
        STATUS_SUCCESS: state => {
            state.status = STATUS_SUCCESS
        },
        STATUS_ERROR: state => {
            state.status = STATUS_ERROR
        },
        STATUS_PROGRESS: state => {
            state.status = STATUS_PROGRESS
        },
        CLEAR: state => {
            state.clients = {
                google: {
                    enabled: false,
                    messages: [],
                    rooms: [],
                    main: true,
                },
                discord: {
                    enabled: false,
                    messages: [],
                    rooms: [],
                    main: false,
                },
            }

            state.status = STATUS_READY
        },
    },
    actions: {
        // options
        init: ({commit}, options) => {
            commit('CLEAR')

            for (const [client, data] of Object.entries(options)) {
                commit('CHANGE_ENABLED', {client, enabled: data.enabled})

                if (data.main) {
                    commit('CHANGE_MAIN', client)
                }

                for (let message of data.messages) {
                    commit('ADD_MESSAGE', {
                        client,
                        message: {
                            id: message.id,
                            name: message.name,
                            content: message.content,
                            sort: message.sort,
                        },
                    })
                }

                for (let room of data.rooms) {
                    commit('ADD_ROOM', {
                        client,
                        room: {
                            id: room.id,
                            name: room.name,
                            url: room.url,
                            sort: room.sort,
                        },
                    })
                }
            }
        },
        addRoom: ({commit, getters}, data) => {
            commit('ADD_ROOM', {
                client: data.client,
                room: {
                    id: Uuid.generate(),
                    name: data.room.name,
                    url: data.room.url,
                    sort: getters['nextRoomSort'],
                },
            })
        },
        updateRoom: ({commit}, data) => {
            commit('UPDATE_ROOM', {
                client: data.client,
                room: {
                    name: data.room.name,
                    url: data.room.url,
                    id: data.room.id,
                },
            })
        },
        removeRoom: ({commit}, data) => {
            commit('REMOVE_ROOM', {
                client: data.client,
                id: data.id,
            })
        },
        addMessage: ({commit, getters}, data) => {
            commit('ADD_MESSAGE', {
                client: data.client,
                message: {
                    id: Uuid.generate(),
                    name: data.message.name,
                    content: data.message.content,
                    sort: getters['nextMessageSort'],
                },
            })
        },
        updateMessage: ({commit}, data) => {
            commit('UPDATE_MESSAGE', {
                client: data.client,
                message: {
                    id: data.message.id,
                    name: data.message.name,
                    content: data.message.content,
                },
            })
        },
        removeMessage: ({commit}, data) => {
            commit('REMOVE_MESSAGE', {
                client: data.client,
                id: data.id,
            })
        },
        roomSortBefore: ({commit}, data) => {
            commit('SORT_ROOM_BEFORE', {
                client: data.client,
                ref: data.ref,
                current: data.current,
            })
        },
        roomSortAfter: ({commit}, data) => {
            commit('SORT_ROOM_AFTER', {
                client: data.client,
                ref: data.ref,
                current: data.current,
            })
        },
        messageSortBefore: ({commit}, data) => {
            commit('SORT_MESSAGE_BEFORE', {
                client: data.client,
                ref: data.ref,
                current: data.current,
            })
        },
        messageSortAfter: ({commit}, data) => {
            commit('SORT_MESSAGE_AFTER', {
                client: data.client,
                ref: data.ref,
                current: data.current,
            })
        },
        updateMain: ({commit}, client) => {
            commit('CHANGE_MAIN', client)
        },
        updateEnabled: ({commit}, data) => {
            commit('CHANGE_ENABLED', {
                client: data.client,
                enabled: data.enabled,
            })
        },
        save: ({state}) => {
            return new Promise(resolve => {
                resolve({
                    key: 'chat',
                    options: {
                        google: toRaw(state.clients.google),
                        discord: toRaw(state.clients.discord),
                    },
                })
            })
        },
        // popup
        sendMessage: async ({commit, rootGetters, getters}, data) => {
            let jiraUrl = rootGetters['jira/getUrl']
            let msg = ''

            switch (data.client) {
                case 'google' :
                    msg = Google.format(data.message.content, data.attachedIssues, jiraUrl)

                    break
                case 'discord':
                    msg = Discord.format(data.message.content, data.attachedIssues, jiraUrl)

                    break
                default:
                    return
            }

            commit('STATUS_PROGRESS')

            chatWorker.addEventListener('message', message => {
                if ('success' === message.data.type) {
                    commit('STATUS_SUCCESS')
                } else {
                    commit('STATUS_ERROR')
                }

                window.setTimeout(() => {
                    commit('STATUS_READY')
                }, 1500)
            })

            chatWorker.postMessage({room: toRaw(data.room), message: msg})
        },
    },
    getters: {
        listChatClients: state => Object.keys(state.clients),
        nextRoomSort: state => client => {
            if (undefined === state.clients[client]) {
                return 0
            }

            return Math.max(...state.clients[client].rooms.map(room => room.sort)) + 1
        },
        nextMessageSort: state => client => {
            if (undefined === state.clients[client]) {
                return 0
            }

            return Math.max(...state.clients[client].messages.map(message => message.sort)) + 1
        },
        listMessages: state => client => {
            if (undefined === state.clients[client]) {
                return []
            }

            return state.clients[client].messages
        },
        listRooms: state => client => {
            if (undefined === state.clients[client]) {
                return []
            }

            return state.clients[client].rooms
        },
        listClients: state => {
            let clients = Object.entries(state.clients)
            let enabledClients = []

            for (let [client, data] of clients) {
                if (data.enabled) {
                    enabledClients.push({
                        client: client,
                        main: data.main,
                    })
                }
            }

            return enabledClients.sort((a, b) => a.name > b.name ? 1 : -1)
        },
        enabled: state => client => {
            if (undefined === state.clients[client]) {
                return false
            }

            return state.clients[client].enabled
        },
        main: state => client => {
            if (undefined === state.clients[client]) {
                return false
            }

            return state.clients[client].main
        },
        status: state => state.status,
        message: state => (client, id) => {
            if (undefined === state.clients[client]) {
                return ''
            }

            return state.clients[client].messages.find(m => m.id === id) ?? ''
        },
        room: state => (client, id) => {
            if (undefined === state.clients[client]) {
                return ''
            }

            return state.clients[client].rooms.find(r => r.id === id) ?? ''
        },
    },
}
