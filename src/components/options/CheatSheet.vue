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

<script>

export default {
    name: 'OptionCheatSheet',
    data() {
        return {
            searchCommand: '',
            text: {
                search: chrome.i18n.getMessage('Search'),
                add: chrome.i18n.getMessage('Add'),
                save: chrome.i18n.getMessage('Save'),
                cancel: chrome.i18n.getMessage('Cancel'),
                delete: chrome.i18n.getMessage('Delete'),
                label: chrome.i18n.getMessage('Label'),
                commandOrContent: chrome.i18n.getMessage('commandOrContent'),
                hint: {
                    command: chrome.i18n.getMessage('hintCommand'),
                    label: chrome.i18n.getMessage('hintCommandLabel'),
                },
            },
            i18n: chrome.i18n,
            labelRules: [
                value => !!value || chrome.i18n.getMessage('errNotBlank'),
                value => value.length <= 30 || chrome.i18n.getMessage('errMaxLength', '30'),
                value => false === this.checkDuplicated(value) || chrome.i18n.getMessage('errDuplicated'),
            ],
            commandRules: [
                value => !!value || chrome.i18n.getMessage('errNotBlank'),
                value => value.length <= 128 || chrome.i18n.getMessage('errMaxLength', '128'),
            ],
            dialogCommand: {
                open: false,
                valid: false,
                title: '',
                item: {
                    label: '',
                    command: '',
                },
                current: null,
            },
            dialogDeleteCommand: false,
            deleteCommand: {
                label: '',
                command: '',
            },
            defaultCommand: {
                label: '',
                command: '',
            },
        }
    },
    computed: {
        items() {
            return this.$store.getters['cheatSheet/getItems']
        },
        headers() {
            return [
                {title: this.text.label, key: 'label'},
                {title: this.text.commandOrContent, key: 'command'},
                {title: '', key: 'actions', align: 'end'},
            ]
        },
    },
    methods: {
        openCommand: function (command) {
            this.dialogCommand = {
                open: true,
                valid: true,
                title: this.i18n.getMessage('TitleUpdate', command.raw.label),
                item: Object.assign({}, command.raw),
                current: command.raw,
                saveButton: this.text.save,
            }
        },
        openNewCommand: function () {
            this.dialogCommand = {
                open: true,
                valid: false,
                title: this.i18n.getMessage('TitleCreate'),
                item: Object.assign({}, this.defaultCommand),
                current: null,
                saveButton: this.text.add,
            }
        },
        closeCommand: function () {
            this.dialogCommand = {
                open: false,
                valid: false,
                title: '',
                item: Object.assign({}, this.defaultCommand),
                current: null,
                saveButton: this.text.add,
            }
        },
        openDialogDeleteCommand: function (command) {
            this.deleteCommand = Object.assign({}, command.raw)

            this.dialogDeleteCommand = true
        },
        closeDialogDeleteCommand: function () {
            this.deleteCommand = Object.assign({}, this.defaultCommand)

            this.dialogDeleteCommand = false
        },
        removeCommand: function (command) {
            this.$store.dispatch('cheatSheet/removeCommand', command)

            this.closeDialogDeleteCommand()
        },
        async saveCommand (event) {
            const result = await event

            if (false === result.valid) {
                return
            }

            if (null === this.dialogCommand.current) {
                this.$store.dispatch('cheatSheet/addCommand', this.dialogCommand.item)
            } else {
                this.$store.dispatch(
                    'cheatSheet/updateCommand',
                    {
                        previous: this.dialogCommand.current,
                        item: this.dialogCommand.item,
                    },
                )
            }

            this.closeCommand()
        },
        checkDuplicated: function (value) {
            let commands = this.$store.getters['cheatSheet/getItems']
            let result = commands.find(command => command.label === value)

            if (undefined === result) {
                return false
            }

            if (null === this.dialogCommand.current) {
                return true
            }

            return this.dialogCommand.current.label !== value
        },
    },
}
</script>
