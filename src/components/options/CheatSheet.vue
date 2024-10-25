<script setup>

import {computed, ref} from 'vue'
import {useCheatSheetStorage} from '../../stores/cheatSheet.ts'
import Debounce from '../../utils/debounce.ts'

const i18n = browser.i18n
let init = false

const text = {
    search: i18n.getMessage('Search'),
    add: i18n.getMessage('Add'),
    save: i18n.getMessage('Save'),
    cancel: i18n.getMessage('Cancel'),
    delete: i18n.getMessage('Delete'),
    label: i18n.getMessage('Label'),
    commandOrContent: i18n.getMessage('commandOrContent'),
    hint: {
        command: i18n.getMessage('hintCommand'),
        label: i18n.getMessage('hintCommandLabel'),
    },
}

const searchCommand = ref('')

const labelRules = [
    value => !!value || i18n.getMessage('errNotBlank'),
    value => value.length <= 30 || i18n.getMessage('errMaxLength', '30'),
    value => false === checkDuplicated(value) || i18n.getMessage('errDuplicated'),
]

const commandRules = [
    value => !!value || i18n.getMessage('errNotBlank'),
    value => value.length <= 128 || i18n.getMessage('errMaxLength', '128'),
]

const defaultCommand = {
    label: '',
    command: '',
}

const deleteCommand = ref({...defaultCommand})

const defaultDialog = {
    open: false,
    valid: false,
    title: '',
    item: {...defaultCommand},
    current: null,
    saveButton: text.add,
}
const dialogCommand = ref({...defaultDialog})

const dialogDeleteCommand = ref(false)

const cheatSheetStorage = useCheatSheetStorage()

const items = computed(() => {
    return cheatSheetStorage.getItems
})

const headers = [
    {title: text.label, key: 'label'},
    {title: text.commandOrContent, key: 'command'},
    {title: '', key: 'actions', align: 'end'},
]

const openCommand = command => {
    dialogCommand.value = {
        open: true,
        valid: true,
        title: i18n.getMessage('TitleUpdate', command.label),
        item: {...command},
        current: command,
        saveButton: text.save,
    }
}

const openNewCommand = () => {
    dialogCommand.value = {
        open: true,
        valid: false,
        title: i18n.getMessage('TitleCreate'),
        item: {...defaultCommand},
        current: null,
        saveButton: text.add,
    }
}

const closeCommand = () => {
    dialogCommand.value = {...defaultDialog}
}

const openDialogDeleteCommand = command => {
    deleteCommand.value = {...command}
    dialogDeleteCommand.value = true
}

const closeDialogDeleteCommand = () => {
    deleteCommand.value = {...defaultCommand}
    dialogDeleteCommand.value = false
}

const removeCommand = command => {
    cheatSheetStorage.removeCommand(command.label)
    closeDialogDeleteCommand()
}

const saveCommand = async event => {
    const result = await event

    if (false === result.valid) {
        return
    }

    if (null === dialogCommand.value.current) {
        cheatSheetStorage.addCommand(dialogCommand.value.item.label, dialogCommand.value.item.command)
    } else {
        cheatSheetStorage.updateCommand(dialogCommand.value.current.label, dialogCommand.value.item.label, dialogCommand.value.item.command)
    }

    closeCommand()
}

const checkDuplicated = value => {
    let command = cheatSheetStorage.getItems.find(item => item.label === value)

    if (undefined === command) {
        return false
    }

    if (null === dialogCommand.value.current) {
        return true
    }

    return dialogCommand.value.current.label !== value
}

const debounce = new Debounce()

cheatSheetStorage.$subscribe(() => {
    if (init) {
        debounce.debounce(cheatSheetStorage.save)
    }
})

cheatSheetStorage.load().then(() => init = true)
</script>

<template>
    <v-card flat class="mt-5">
        <v-data-table
            :headers="headers"
            :items="items"
            :search="searchCommand"
        >
            <template #top>
                <v-toolbar flat>
                    <v-toolbar-title>
                        <v-text-field
                            v-model="searchCommand"
                            prepend-icon="fas fa-search"
                            clear-icon="fas fa-times"
                            :label="text.search"
                            single-line
                            hide-details
                            clearable
                        ></v-text-field>
                    </v-toolbar-title>
                    <v-spacer></v-spacer>
                    <v-btn
                        variant="plain"
                        prepend-icon="fas fa-plus"
                        color="primary"
                        @click="openNewCommand">{{text.add}}</v-btn>
                    <v-dialog v-model="dialogCommand.open" max-width="600">
                        <v-form validate-on="input" @submit.prevent="saveCommand">
                            <v-card>
                                <v-card-title>{{dialogCommand.title}}</v-card-title>
                                <v-card-text>
                                        <v-text-field
                                            v-model="dialogCommand.item.label"
                                            :label="text.label"
                                            :rules="labelRules"
                                            :hint="text.hint.label"
                                            counter="30"
                                        ></v-text-field>
                                        <v-text-field
                                            v-model="dialogCommand.item.command"
                                            :label="text.commandOrContent"
                                            :rules="commandRules"
                                            :hint="text.hint.command"
                                            counter="128"
                                        ></v-text-field>
                                </v-card-text>
                                <v-card-actions>
                                    <v-spacer></v-spacer>
                                    <v-btn
                                        color="secondary"
                                        variant="plain"
                                        @click="closeCommand">{{ text.cancel }}</v-btn>
                                    <v-btn
                                        type="submit"
                                        color="primary"
                                        variant="plain">{{ dialogCommand.saveButton }}</v-btn>
                                    <v-spacer></v-spacer>
                                </v-card-actions>
                            </v-card>
                        </v-form>
                    </v-dialog>
                    <v-dialog v-model="dialogDeleteCommand" max-width="450">
                        <v-card>
                            <v-card-title>{{ i18n.getMessage('TitleDelete', deleteCommand.label) }}</v-card-title>
                            <v-card-actions>
                                <v-spacer></v-spacer>
                                <v-btn color="secondary" plain @click="closeDialogDeleteCommand()">
                                    {{ text.cancel }}</v-btn>
                                <v-btn color="tertiary" plain @click="removeCommand(deleteCommand)">
                                    {{ text.delete }}</v-btn>
                                <v-spacer></v-spacer>
                            </v-card-actions>
                        </v-card>
                    </v-dialog>
                </v-toolbar>
            </template>
            <template #item.actions="{item}">
                <v-btn
                    variant="plain"
                    icon="fas fa-edit"
                    size="small"
                    @click="openCommand(item)"></v-btn>
                <v-btn
                    variant="plain"
                    icon="fas fa-trash"
                    size="small"
                    color="tertiary"
                    @click="openDialogDeleteCommand(item)"></v-btn>
            </template>
        </v-data-table>
    </v-card>
</template>
