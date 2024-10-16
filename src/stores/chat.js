import {defineStore} from 'pinia'
import Helper from '../mixins/helper.js'
import {Uuid} from '../mixins/uuid.js'
import {toRaw} from 'vue'
import ChatStatus from '../mixins/chat/status.js'
import {useJiraStorage} from './jira.js'
import {Google} from '../mixins/chat/google.js'
import {Discord} from '../mixins/chat/discord.js'

const chatWorker = new Worker('../../worker/chat.js')

export const useChatStorage = defineStore('chat', {
    state: () => ({
        clients: {
            google: {
                enabled: false,
                messages: [],
                rooms: [],
                main: true,
                name: '',
            },
            discord: {
                enabled: false,
                messages: [],
                rooms: [],
                main: false,
                name: '',
            },
        },
        status: ChatStatus.READY,
    }),
    getters: {
        isMain: state => {
            return client => {
                return state.clients[client].main ?? false
            }
        },
        isEnabled: state => {
            return client => {
                return state.clients[client].enabled ?? false
            }
        },
        getName: state => {
            return client => {
                return state.clients[client].name ?? ''
            }
        },
        getMessages: state => {
            return client => {
                return state.clients[client]?.messages ?? []
            }
        },
        getRooms: state => {
            return client => {
                return state.clients[client]?.rooms ?? []
            }
        },
        getClients: state => {
            const enabledClients = []

            for (let [client, data] of Object.entries(state.clients)) {
                if (data.enabled) {
                    enabledClients.push({client: client, main: data.main})
                }
            }

            return enabledClients
        },
        getStatus: state => state.status,
    },
    actions: {
        async load (){
            const options = await chrome.storage.local.get('optionsChat')

            this.init(options.optionsChat)
        },
        init(options) {
            for (const [client, data] of Object.entries(options)) {
                this.clients[client] = {
                    enabled: data.enabled,
                    name: data.name,
                    main: data.main,
                    rooms: [],
                    messages: [],
                }

                data.rooms.forEach(room => {
                    this.clients[client].rooms.push({id: room.id, name: room.name, url: room.url, sort: room.sort})
                })

                data.messages.forEach(msg => {
                    this.clients[client].messages.push({id: msg.id, name: msg.name, content: msg.content, sort: msg.sort})
                })

                Helper.resort(this.clients[client].rooms)
                Helper.resort(this.clients[client].messages)
            }
        },
        updateEnabled(client, status) {
            if (undefined === this.clients[client]) {
                return
            }

            this.clients[client].enabled = status
        },
        updateName(client, name) {
            if (undefined === this.clients[client]) {
                return
            }

            this.clients[client].name = name
        },
        updateMain(mainClient) {
            if (undefined === this.clients[mainClient]) {
                return
            }

            Object.keys(this.clients).forEach(client => {
                this.clients[client].main = client === mainClient
            })
        },
        createMessage(client, name, content) {
            if (undefined === this.clients[client]) {
                return
            }

            this.clients[client].messages.push({
                id: Uuid.generate(),
                name: name,
                content: content,
                sort: Number.MAX_SAFE_INTEGER,
            })

            Helper.resort(this.clients[client].messages)
        },
        updateMessage(client, id, name, content) {
            if (undefined === this.clients[client]) {
                return
            }

            const msg = this.clients[client].messages.find(msg => msg.id === id)

            if (undefined === msg) {
                return
            }

            msg.name = name
            msg.content = content
        },
        messageSortBefore(client, ref, current) {
            if (undefined === this.clients[client]) {
                return
            }

            const currentMessage = this.clients[client].messages.find(message => message.id === current)
            const refMessage = this.clients[client].messages.find(message => message.id === ref)

            Helper.sortBefore(this.clients[client].messages, currentMessage, refMessage, 'id')
        },
        messageSortAfter(client, ref, current) {
            if (undefined === this.clients[client]) {
                return
            }

            const currentMessage = this.clients[client].messages.find(message => message.id === current)
            const refMessage = this.clients[client].messages.find(message => message.id === ref)

            Helper.sortAfter(this.clients[client].messages, currentMessage, refMessage, 'id')
        },
        removeMessage(client, id) {
            if (undefined === this.clients[client]) {
                return
            }

            const index = this.clients[client].messages.findIndex(message => message.id === id)

            if (-1 !== index) {
                this.clients[client].messages.splice(index, 1)
            }

            Helper.resort(this.clients[client].messages)
        },
        createRoom (client, name, url){
            if (undefined === this.clients[client]) {
                return
            }

            this.clients[client].rooms.push({
                id: Uuid.generate(),
                name: name,
                url: url,
                sort: Number.MAX_SAFE_INTEGER,
            })

            Helper.resort(this.clients[client].rooms)
        },
        updateRoom(client, id, name, url) {
            if (undefined === this.clients[client]) {
                return
            }

            const room = this.clients[client].rooms.find(item => item.id === id)

            if (undefined === room) {
                return
            }

            room.name = name
            room.url = url
        },
        roomSortBefore(client, ref, current) {
            if (undefined === this.clients[client]) {
                return
            }

            const currentRoom = this.clients[client].rooms.find(room => room.id === current)
            const refRoom = this.clients[client].rooms.find(room => room.id === ref)

            Helper.sortBefore(this.clients[client].rooms, currentRoom, refRoom, 'id')
        },
        roomSortAfter(client, ref, current) {
            if (undefined === this.clients[client]) {
                return
            }

            const currentRoom = this.clients[client].rooms.find(room => room.id === current)
            const refRoom = this.clients[client].rooms.find(room => room.id === ref)

            Helper.sortAfter(this.clients[client].rooms, currentRoom, refRoom, 'id')
        },
        removeRoom(client, id) {
            if (undefined === this.clients[client]) {
                return
            }

            const index = this.clients[client].rooms.findIndex(room => room.id === id)

            if (-1 !== index) {
                this.clients[client].rooms.splice(index, 1)
            }

            Helper.resort(this.clients[client].rooms)
        },
        async save() {
            await chrome.storage.local.set({optionsChat: toRaw(this.clients)})
        },
        async sendMessage(client, roomId, messageId, issueKeys) {
            const jiraStorage = useJiraStorage()
            await jiraStorage.load()

            const url = jiraStorage.getUrl
            let msg = ''

            const msgItem = this.getMessages(client).find(item => item.id === messageId)
            const name = this.clients[client].name ?? ''

            const room = this.getRooms(client).find(item => item.id === roomId)

            if ('google' === client) {
                msg = Google.format(msgItem.content, toRaw(issueKeys), url, name)
            } else if ('discord' === client) {
                msg = Discord.format(msgItem.content, toRaw(issueKeys), url, name)
            } else {
                return
            }

            this.status = ChatStatus.PROGRESS

            chatWorker.addEventListener('message', message => {
                this.status = ChatStatus.SUCCESS() === message.data.type ? ChatStatus.SUCCESS : ChatStatus.ERROR

                window.setTimeout(() => this.status = ChatStatus.READY, 1500)
            })

            chatWorker.postMessage({room: room.url, message: msg})
        },
    },
})
