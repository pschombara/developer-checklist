<template>
    <v-card flat class="mt-5">
        <v-data-table
            :headers="headers"
            :items="items"
            :search="searchCommand"
        >
            <template v-slot:top>
                <v-toolbar flat>
                    <v-text-field
                        v-model="searchCommand"
                        prepend-icon="fas fa-search"
                        clear-icon="fas fa-times"
                        :label="text.search"
                        single-line
                        hide-details
                        clearable
                    ></v-text-field>
                    <v-spacer></v-spacer>
                    <v-btn color="primary" @click="openNewCommand"><v-icon left x-small>fas fa-plus</v-icon> {{text.add}}</v-btn>
                    <v-dialog v-model="dialogCommand.open" max-width="600">
                        <v-card>
                            <v-card-title>{{dialogCommand.title}}</v-card-title>
                            <v-card-text>
                                <v-form
                                    ref="commandForm"
                                    v-model="dialogCommand.valid"
                                >
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
                                </v-form>
                            </v-card-text>
                            <v-card-actions>
                                <v-spacer></v-spacer>
                                <v-btn color="grey" plain @click="closeCommand">{{ text.cancel }}</v-btn>
                                <v-btn color="primary" plain v-if="null === dialogCommand.current" :disabled="!dialogCommand.valid" @click="addCommand">{{ text.add }}</v-btn>
                                <v-btn color="primary" plain v-else :disabled="!dialogCommand.valid" @click="saveCommand">{{ text.save }}</v-btn>
                                <v-spacer></v-spacer>
                            </v-card-actions>
                        </v-card>
                    </v-dialog>
                    <v-dialog v-model="dialogDeleteCommand" max-width="450">
                        <v-card>
                            <v-card-title>{{ i18n.getMessage('TitleDelete', deleteCommand.label) }}</v-card-title>
                            <v-card-actions>
                                <v-spacer></v-spacer>
                                <v-btn color="grey" plain @click="closeDialogDeleteCommand()">
                                    {{ text.cancel }}</v-btn>
                                <v-btn color="error" plain @click="removeCommand(deleteCommand)">
                                    {{ text.delete }}</v-btn>
                                <v-spacer></v-spacer>
                            </v-card-actions>
                        </v-card>
                    </v-dialog>
                </v-toolbar>
            </template>
            <template v-slot:item.actions="{item}">
                <v-btn icon @click="openCommand(item)" small>
                    <v-icon small>fas fa-edit</v-icon>
                </v-btn>
                <v-btn icon @click="openDialogDeleteCommand(item)" small>
                    <v-icon small color="red darken-2">fas fa-trash</v-icon>
                </v-btn>
            </template>
        </v-data-table>
    </v-card>
</template>

<script>
export default {
    name: 'CheatSheet',
    computed: {
        items() {
            return this.$store.getters['cheatSheet/getItems']
        },
        headers() {
            return [
                {text: this.text.label, value: 'label'},
                {text: this.text.commandOrContent, value: 'command'},
                {text: '', value: 'actions', align: 'right'},
            ]
        },
    },
    methods: {
        openCommand: function (command) {
            this.dialogCommand = {
                open: true,
                valid: true,
                title: this.i18n.getMessage('TitleUpdate', command.label),
                item: Object.assign({}, command),
                current: command,
            }
        },
        openNewCommand: function () {
            this.dialogCommand = {
                open: true,
                valid: false,
                title: this.i18n.getMessage('TitleCreate'),
                item: Object.assign({}, this.defaultCommand),
                current: null,
            }
        },
        closeCommand: function () {
            this.dialogCommand = {
                open: false,
                valid: false,
                title: '',
                item: Object.assign({}, this.defaultCommand),
                current: null,
            }
        },
        openDialogDeleteCommand: function (command) {
            this.deleteCommand = Object.assign({}, command)

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
        saveCommand: function () {
            if (this.$refs.commandForm.validate()) {
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
        addCommand: function () {
            if (this.$refs.commandForm.validate()) {
                this.$store.dispatch('cheatSheet/addCommand', this.dialogCommand.item)
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
}
</script>
