import {defineStore} from 'pinia'
import {th} from 'vuetify/locale'
import Helper from '../mixins/helper.js'
import {Uuid} from '../mixins/uuid.js'

const STATUS_READY = 'ready'
const STATUS_SUCCESS = 'success'
const STATUS_ERROR = 'error'
const STATUS_PROGRESS = 'progress'

export const useChat = defineStore('chat', {
    state: {
        clients: {},
        status: STATUS_READY,
    },
    actions: {
        init: (options) => {
            this.clear()

            for (const [client, data] of Object.entries(options)) {
                this.updateEnabled(client, data.enabled)
                this.updateName(client, data.name)

                if (data.main) {
                    this.updateMain(client)
                }

                options.rooms.forEach(room => {this.addRoom(client, room.id, room.name, room.url, room.sort)})
                options.messages.forEach(message => {this.addRoom(client, message.id, message.name, message.content, message.sort)})
            }
        },
        clear: () => {
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
        updateEnabled: (client, status) => {
            if (false === this.clientExists(client)) {
                return
            }

            this.clients[client].enabled = status
        },
        updateName: (client, name) => {
            if (false === this.clientExists(client)) {
                return
            }

            this.clients[client].name = name
        },
        clientExists: client => {
            return undefined === this.clients[client]
        },
        updateMain: mainClient => {
            if (false === this.clientExists(mainClient)) {
                return
            }

            Object.keys(this.clients).forEach(client => {
                this.clients[client].main = client === mainClient
            })
        },
        addRoom: (client, id, name, url, sort) => {
            if (false === this.clientExists(client)) {
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
        addMessage: (client, id, name, content, sort) => {
            if (false === this.clientExists(client)) {
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
        createRoom: (client, name, url) => {
            this.addRoom(
                client,
                Uuid.generate(),
                name,
                url,
                Number.MAX_SAFE_INTEGER,
            )
        },
        createMessage: (client, name, content) => {
            this.addMessage(
                client,
                Uuid.generate(),
                name,
                content,
                Number.MAX_SAFE_INTEGER,
            )
        },
    },
    getters: {},
})
