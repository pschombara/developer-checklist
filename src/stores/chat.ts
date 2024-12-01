import {defineStore} from 'pinia'
import Helper from '@/utils/helper.ts'
import {Uuid} from '@/utils/uuid.ts'
import {toRaw} from 'vue'
import {useJiraStorage} from './jira.ts'
import {Google} from '@/utils/chat/google.ts'
import {Discord} from '@/utils/chat/discord.ts'
import { Client } from '@/types/chat/client.js'
import {ClientProviderEnum} from "@/types/chat/enum/ClientProviderEnum";
import {ChatStatusEnum} from "@/types/chat/enum/ChatStatusEnum";

type ClientList = {
    [key in ClientProviderEnum]: Client
}

interface State {
    clients: ClientList,
    status: ChatStatusEnum
}

export const useChatStorage = defineStore('chat', {
    state: (): State => {
        return {
            clients: {
                [ClientProviderEnum.discord]: {
                    enabled: false,
                    messages: [],
                    rooms: [],
                    main: false,
                    name: ''
                },
                [ClientProviderEnum.google]: {
                    enabled: false,
                    messages: [],
                    rooms: [],
                    main: false,
                    name: ''
                },
            },
            status: ChatStatusEnum.Ready
        }
    },
    getters: {
        isMain: state => {
            return (client: ClientProviderEnum) => {
                return state.clients[client].main ?? false
            }
        },
        isEnabled: state => {
            return (client: ClientProviderEnum) => {
                return state.clients[client].enabled ?? false
            }
        },
        getName: state => {
            return (client: ClientProviderEnum) => {
                return state.clients[client].name ?? ''
            }
        },
        getMessages: state => {
            return (client: ClientProviderEnum) => {
                return state.clients[client]?.messages ?? []
            }
        },
        getRooms: state => {
            return (client: ClientProviderEnum) => {
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
            const options = await browser.storage.local.get('optionsChat')

            this.init(options.optionsChat)
        },
        init(options) {
            for (const [client, data] of Object.entries(options)) {
                let clientKey;

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
        updateEnabled(client: ClientProviderEnum, status: boolean) {
            if (undefined === this.clients[client]) {
                return
            }

            this.clients[client].enabled = status
        },
        updateName(client: ClientProviderEnum, name: string) {
            if (undefined === this.clients[client]) {
                return
            }

            this.clients[client].name = name
        },
        updateMain(mainClient: ClientProviderEnum) {
            if (undefined === this.clients[mainClient]) {
                return
            }

            Object.keys(this.clients).forEach(client => {
                this.clients[client].main = client === mainClient
            })
        },
        createMessage(client: ClientProviderEnum, name: string, content: string) {
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
        updateMessage(client: ClientProviderEnum, id: string, name: string, content: string) {
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
        messageSortBefore(client: ClientProviderEnum, ref: string, current: string) {
            if (undefined === this.clients[client]) {
                return
            }

            const currentMessage = this.clients[client].messages.find(message => message.id === current)
            const refMessage = this.clients[client].messages.find(message => message.id === ref)

            Helper.sortBefore(this.clients[client].messages, currentMessage, refMessage, 'id')
        },
        messageSortAfter(client: ClientProviderEnum, ref: string, current: string) {
            if (undefined === this.clients[client]) {
                return
            }

            const currentMessage = this.clients[client].messages.find(message => message.id === current)
            const refMessage = this.clients[client].messages.find(message => message.id === ref)

            Helper.sortAfter(this.clients[client].messages, currentMessage, refMessage, 'id')
        },
        removeMessage(client: ClientProviderEnum, id: string) {
            if (undefined === this.clients[client]) {
                return
            }

            const index = this.clients[client].messages.findIndex(message => message.id === id)

            if (-1 !== index) {
                this.clients[client].messages.splice(index, 1)
            }

            Helper.resort(this.clients[client].messages)
        },
        createRoom (client: ClientProviderEnum, name: string, url: string){
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
        updateRoom(client: ClientProviderEnum, id: string, name: string, url: string) {
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
        roomSortBefore(client: ClientProviderEnum, ref: string, current: string) {
            if (undefined === this.clients[client]) {
                return
            }

            const currentRoom = this.clients[client].rooms.find(room => room.id === current)
            const refRoom = this.clients[client].rooms.find(room => room.id === ref)

            Helper.sortBefore(this.clients[client].rooms, currentRoom, refRoom, 'id')
        },
        roomSortAfter(client: ClientProviderEnum, ref: string, current: string) {
            if (undefined === this.clients[client]) {
                return
            }

            const currentRoom = this.clients[client].rooms.find(room => room.id === current)
            const refRoom = this.clients[client].rooms.find(room => room.id === ref)

            Helper.sortAfter(this.clients[client].rooms, currentRoom, refRoom, 'id')
        },
        removeRoom(client: ClientProviderEnum, id: string) {
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
            await browser.storage.local.set({optionsChat: toRaw(this.clients)})
        },
        async sendMessage(client: ClientProviderEnum, roomId: string, messageId: string, issueKeys: string[]) {
            const jiraStorage = useJiraStorage()
            await jiraStorage.load()

            const url = jiraStorage.getUrl
            let msg = ''

            const msgItem = this.getMessages(client).find(item => item.id === messageId)
            const name = this.clients[client].name ?? ''

            const room = this.getRooms(client).find(item => item.id === roomId)

            if (ClientProviderEnum.google === client) {
                msg = Google.format(msgItem.content, toRaw(issueKeys), url, name)
            } else if (ClientProviderEnum.discord === client) {
                msg = Discord.format(msgItem.content, toRaw(issueKeys), url, name)
            } else {
                return
            }

            this.status = ChatStatusEnum.Progress

            if ('' === msg) {
                return
            }

            const response = await fetch(room.url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json; charset=utf-8',
                },
                body: msg
            });

            this.status = response.ok ? ChatStatusEnum.Success : ChatStatusEnum.Error

            window.setTimeout(
                () => this.status = ChatStatusEnum.Ready,
                1500
            );
        },
    },
})
