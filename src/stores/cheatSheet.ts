import {defineStore} from 'pinia'
import {toRaw} from 'vue'

export const useCheatSheetStorage = defineStore('cheatSheet', {
    state: () => ({
        items: [],
    }),
    getters: {
        getItems: state => state.items,
    },
    actions: {
        async load() {
            const options = await browser.storage.local.get('optionsCheatSheet')

            options.optionsCheatSheet.forEach(item => {
                this.items.push({label: item.label, command: item.command})
            })
        },
        addCommand(label, command) {
            this.items.push({label: label, command: command})
        },
        updateCommand(previousLabel, label, command) {
            const entry = this.items.find(item => item.label === previousLabel)

            if (undefined === entry) {
                return
            }

            entry.label = label
            entry.command = command
        },
        removeCommand(label) {
            const index = this.items.findIndex(item => item.label === label)

            if (-1 !== index) {
                this.items.splice(index, 1)
            }
        },
        async save() {
            await browser.storage.local.set({optionsCheatSheet: toRaw(this.items)})
        },
    },
})
