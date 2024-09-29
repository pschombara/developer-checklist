import {Uuid} from '../../mixins/uuid'
import Helper from '../../mixins/helper'
import {Google} from '../../mixins/chat/google'
import {Discord} from '../../mixins/chat/discord'
import {toRaw} from 'vue'

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
    state,
    mutations: {


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


    },
    actions: {
        // popup
        sendMessage: async ({commit, rootGetters, getters}, data) => {
            let jiraUrl = rootGetters['jira/getUrl']
            let msg = ''
            const msgItem = getters['message'](data.client, data.message)
            const name = getters['name'](data.client)

            switch (data.client) {
                case 'google' :
                    msg = Google.format(msgItem.content, data.attachedIssues, jiraUrl, name)

                    break
                case 'discord':
                    msg = Discord.format(msgItem.content, data.attachedIssues, jiraUrl, name)

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
}
