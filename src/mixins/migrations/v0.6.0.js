import semver from 'semver'
import {Uuid} from '@/mixins/uuid'

export class V0_6_0 {
    constructor() {
        this.checklistsUuids = {
            0: '954a37f5-d1f4-459e-a325-cd0c7bbe55ee',
            1: '66a78c0f-0214-4dd5-aa43-ca00bf44b8ed',
            2: 'dda87df8-66ca-4b1c-af6f-b7875d549f97',
            3: '34184b6b-4bed-487e-963e-6b6244022974',
            4: '52da1f46-8114-43c5-84c0-ccef34383df9',
        }
    }

    supports = version => {
        return semver.lt(version, '0.6.0')
    }

    migrate = options => {
        const colors = ['grey', 'blue', 'red', 'yellow', 'green', 'pink', 'purple', 'cyan']
        const checklists = Object.assign({}, options.jira.checklists)

        options.chrome = {
            tabGroups: {},
        }

        options.jira.checklists = []
        options.jira.templates = []

        let sort = 0

        for (let [key, checklist] of Object.entries(checklists)) {
            checklist.uuid = this.checklistsUuids[key]
            checklist.icon = checklist.icon.replace('fas fa-', '')

            for (let cl of checklist.checklist) {
                cl.sort = sort++

                let innerSort = 0

                for (let item of cl.items) {
                    item.sort = innerSort++
                }
            }

            let templateSort = 0

            for (let type of ['failed', 'success']) {
                if ('' !== checklist.buttons[type].comment) {
                    let uuid = Uuid.generate()

                    options.jira.templates.push({
                        id: uuid,
                        title: `${checklist.name} ${type}`,
                        subTitle: '',
                        content: checklist.buttons[type].comment,
                        sort: templateSort++,
                    })

                    checklist.buttons[type].comment = uuid
                } else {
                    checklist.buttons[type].comment = null
                }
            }

            options.jira.checklists.push(checklist)
        }

        options.modules.chrome = true

        for (let color of colors) {
            options.chrome.tabGroups[color] = {
                title: '',
                active: false,
                urls: [],
            }
        }

        for (let board of options.jira.boards) {
            board.default = false
        }

        if (0 !== options.jira.boards.length) {
            options.jira.boards[0].default = true
        }

        options.chat.google.main = true

        let rooms = []
        let messages = []

        for (let [id, room] of Object.entries(options.chat.google.rooms)) {
            room.sort = room.order
            delete room.order
            room.id = id

            rooms.push(room)
        }

        for (let [id, message] of Object.entries(options.chat.google.messages)) {
            message.sort = message.order
            delete message.order
            message.id = id

            messages.push(message)
        }

        options.chat.google.rooms = rooms
        options.chat.google.messages = messages

        options.version = '0.6.0'
    }
}
