import Helper from '@/mixins/helper'

const state = {
    items: [],
}

export default {
    strict: process.env.NODE_ENV !== 'production',
    namespaced: true,
    state,
    mutations: {
        ADD_ITEM: (state, item) => {
            state.items.push(item)
        },
        REMOVE_ITEM: (state, item) => {
            const index = state.items.findIndex(command => command.label === item.label)

            if (-1 !== index) {
                state.items.splice(index, 1)
            }
        },
        UPDATE_ITEM: (state, data) => {
            const index = state.items.findIndex(command => command.label === data.previous.label)

            if (-1 !== index) {
                state.items.splice(index, 1, {label: data.item.label, command: data.item.command})
            }
        },
        CLEAR: state => {
            state.items = []
        },
    },
    actions: {
        init: ({commit}, options) => {
            return new Promise(resolve => {
                commit('CLEAR')

                options = Helper.convertToArray(options)

                for (let item of options) {
                    commit('ADD_ITEM', {
                        label: item.label,
                        command: item.command,
                    })
                }
                resolve()
            })
        },
        removeCommand: ({commit}, command) => {
            commit('REMOVE_ITEM', command)
        },
        addCommand: ({commit}, command) => {
            commit('ADD_ITEM', command)
        },
        updateCommand: ({commit}, data) => {
            commit('UPDATE_ITEM', {previous: data.previous, item: data.item})
        },
        save: ({state}) => {
            return new Promise(resolve => {
                resolve({
                    key: 'cheatSheet',
                    options: state.items,
                })
            })
        },
    },
    getters: {
        getItems: state => {
            return state.items
        },
    },
}
