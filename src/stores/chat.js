import {defineStore} from 'pinia'
import Helper from '../mixins/helper.js'
import {Uuid} from '../mixins/uuid.js'
import {th} from 'vuetify/locale'

const STATUS_READY = 'ready'
const STATUS_SUCCESS = 'success'
const STATUS_ERROR = 'error'
const STATUS_PROGRESS = 'progress'

export const useChatStorage = defineStore('chat', {
    state: () => ({
        clients: {},
        status: STATUS_READY,
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
                return state.clients[client].messages ?? []
            }
        },
    },
    actions: {
        async load (){
            const options = await chrome.storage.local.get('optionsChat')

            this.init(options.optionsChat)
        },
        init(options) {
            this.clear()

            for (const [client, data] of Object.entries(options)) {
                this.updateEnabled(client, data.enabled)
                this.updateName(client, data.name)

                if (data.main) {
                    this.updateMain(client)
                }

                data.rooms.forEach(room => {this.addRoom(client, room.id, room.name, room.url, room.sort)})
                data.messages.forEach(message => {this.addRoom(client, message.id, message.name, message.content, message.sort)})
            }
        },
        clear(){
            this.clients = {
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
            }

            this.status = STATUS_READY
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
        addRoom(client, id, name, url, sort) {
            if (undefined === this.clients[client]) {
                return
            }

            this.clients[client].rooms.push({
                id: id,
                name: name,
                url: url,
                sort: sort,
            })

            Helper.resort(this.clients[client].rooms)
        },
        addMessage(client, id, name, content, sort) {
            if (undefined === this.clients[client]) {
                return
            }

            this.clients[client].messages.push({
                id: id,
                name: name,
                content: content,
                sort: sort,
            })

            Helper.resort(this.clients[client].messages)
        },
        createRoom (client, name, url){
            this.addRoom(
                client,
                Uuid.generate(),
                name,
                url,
                Number.MAX_SAFE_INTEGER,
            )
        },
        createMessage(client, name, content) {
            this.addMessage(
                client,
                Uuid.generate(),
                name,
                content,
                Number.MAX_SAFE_INTEGER,
            )
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
    },
})
