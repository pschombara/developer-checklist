<template>
    <v-card flat class="ml-5">
        <v-card-text>
            <v-row>
                <v-col cols="12" md="6">
                    <v-row>
                        <v-col cols="12">
                            <v-text-field
                                v-model="host"
                                :label="text.host"
                                suffix="/browse/"
                                :rules="urlRules"
                            ></v-text-field>
                        </v-col>
                    </v-row>
                    <v-row class="mt-4">
                        <v-col cols="12">
                            <v-slider
                                v-model="issues"
                                :label="text.issues"
                                :hint="text.hint.issues"
                                thumb-label="always"
                                thumb-size="24"
                                min="0"
                                max="24"
                                step="1"
                                persistent-hint
                            ></v-slider>
                        </v-col>
                    </v-row>
                    <v-row class="mt-4">
                        <v-col cols="12">
                            <v-slider
                                v-model="cleanup"
                                :label="text.cleanup"
                                :hint="text.hint.cleanup"
                                thumb-label="always"
                                thumb-size="24"
                                min="1"
                                max="30"
                                step="1"
                                persistent-hint
                            ></v-slider>
                        </v-col>
                    </v-row>
                </v-col>
                <v-col cols="12" md="6">
                    <v-card>
                        <v-card-title>{{text.boards}}</v-card-title>
                        <v-card-text>
                            <v-data-table
                                :items="boards"
                                :headers="boardHeaders"
                                :search="searchBoards"
                            >
                                <template #top>
                                    <v-toolbar flat>
                                        <v-toolbar-title>
                                            <v-text-field
                                                v-model="searchBoards"
                                                prepend-icon="fas fa-search"
                                                clear-icon="fas fa-times"
                                                :label="text.search"
                                                single-line
                                                hide-details
                                                clearable></v-text-field>
                                        </v-toolbar-title>
                                        <v-spacer></v-spacer>
                                        <v-btn
                                            variant="plain"
                                            prepend-icon="fas fa-plus"
                                            color="primary"
                                            @click="openNewBoard">{{text.add}}</v-btn>
                                        <v-dialog v-model="dialogBoard.open" max-width="450">
                                            <v-form validate-on="input" @submit.prevent="saveBoard">
                                                <v-card>
                                                    <v-card-title>{{dialogBoard.title}}</v-card-title>
                                                    <v-card-text>
                                                            <v-text-field
                                                                v-model="dialogBoard.item.key"
                                                                :label="text.boardKey"
                                                                :rules="boardKeyRules"
                                                                counter="10"
                                                            ></v-text-field>
                                                            <v-switch
                                                                v-model="dialogBoard.item.default"
                                                                :label="text.default"
                                                                :disabled="null !== dialogBoard.current && dialogBoard.current.default"
                                                                color="primary"
                                                            ></v-switch>
                                                    </v-card-text>
                                                    <v-card-actions>
                                                        <v-spacer></v-spacer>
                                                        <v-btn
                                                            color="secondary"
                                                            variant="plain"
                                                            @click="closeBoard">{{ text.cancel }}</v-btn>
                                                        <v-btn
                                                            type="submit"
                                                            color="primary"
                                                            variant="plain">{{ dialogBoard.saveButton }}</v-btn>
                                                        <v-spacer></v-spacer>
                                                    </v-card-actions>
                                                </v-card>
                                            </v-form>
                                        </v-dialog>
                                        <v-dialog v-model="dialogDeleteBoard" max-width="450">
                                            <v-card>
                                                <v-card-title class="headline">{{ i18n.getMessage('TitleDelete', deleteBoard.key) }}</v-card-title>
                                                <v-card-actions>
                                                    <v-spacer></v-spacer>
                                                    <v-btn color="secondary" plain @click="closeDialogDeleteBoard">
                                                        {{ text.cancel }}
                                                    </v-btn>
                                                    <v-btn color="tertiary" plain @click="removeBoard">
                                                        {{ text.delete }}
                                                    </v-btn>
                                                    <v-spacer></v-spacer>
                                                </v-card-actions>
                                            </v-card>
                                        </v-dialog>
                                    </v-toolbar>
                                </template>
                                <template #item.default="{item}">
                                    <v-icon
                                        v-if="item.raw.default"
                                        icon="fas fa-check"
                                        size="small"
                                        color="success"
                                    ></v-icon>
                                </template>
                                <template #item.actions="{item}">
                                    <v-btn
                                        variant="plain"
                                        icon="fas fa-edit"
                                        size="small"
                                        @click="openBoard(item)"> </v-btn>
                                    <v-btn
                                        variant="plain"
                                        icon="fas fa-trash"
                                        size="small"
                                        color="tertiary"
                                        @click="openDialogDeleteBoard(item)"> </v-btn>
                                </template>
                            </v-data-table>
                        </v-card-text>
                    </v-card>
                </v-col>
            </v-row>
        </v-card-text>
    </v-card>
</template>

<script>
import Helper from '../../../mixins/helper'

export default {
    name: 'JiraGeneral',
    data() {
        return {
            text: {
                host: chrome.i18n.getMessage('Host'),
                issues: chrome.i18n.getMessage('IssuesInProgress'),
                cleanup: chrome.i18n.getMessage('CleanupInterval'),
                search: chrome.i18n.getMessage('Search'),
                add: chrome.i18n.getMessage('Add'),
                save: chrome.i18n.getMessage('Save'),
                cancel: chrome.i18n.getMessage('Cancel'),
                delete: chrome.i18n.getMessage('Delete'),
                boardKey: chrome.i18n.getMessage('BoardKey'),
                boards: chrome.i18n.getMessage('Boards'),
                newBoard: chrome.i18n.getMessage('NewBoard'),
                default: chrome.i18n.getMessage('Default'),
                hint: {
                    cleanup: chrome.i18n.getMessage('hintJiraCleanup'),
                    issues: chrome.i18n.getMessage('hintJiraIssues'),
                },
            },
            urlRules: [
                value => Helper.isURL(value) || chrome.i18n.getMessage('errUrlInvalid'),
            ],
            boardIdRules: [
                value => (!!value || 0 === value) || chrome.i18n.getMessage('errNotBlank'),
                value => value >= 0 || chrome.i18n.getMessage('errMinimum', '0'),
            ],
            boardKeyRules: [
                value => !!value || chrome.i18n.getMessage('errNotBlank'),
                value => value.length <= 10 || chrome.i18n.getMessage('errMaxLength', '10'),
                value => false === this.checkBoardKeyDuplicated(value) || chrome.i18n.getMessage('errDuplicated'),
            ],
            i18n: chrome.i18n,
            searchBoards: '',
            dialogDeleteBoard: false,
            deleteBoard: {},
            dialogBoard: {
                open: false,
                title: '',
                item: {
                    identifier: 0,
                    key: '',
                    default: false,
                },
                current: null,
                valid: false,
                saveButton: '',
            },
            defaultBoard: {
                identifier: 0,
                key: '',
                default: false,
            },
        }
    },
    computed: {
        host: {
            get() {
                return this.$store.getters['jira/getUrl']
            },
            set(value) {
                if (null === value || Helper.isURL(value)) {
                    this.$store.dispatch('jira/updateUrl', value)
                }
            },
        },
        cleanup: {
            get() {
                return this.$store.getters['jira/getCleanup']
            },
            set(value) {
                this.$store.dispatch('jira/updateCleanup', value)
            },
        },
        issues: {
            get() {
                return this.$store.getters['jira/getMaximumIssues']
            },
            set(value) {
                this.$store.dispatch('jira/updateMaximumIssues', value)
            },
        },
        boards() {
            return this.$store.getters['jira/getBoards']
        },
        boardHeaders() {
            return [
                { title: this.text.boardKey, key: 'key'},
                { title: this.text.default, key: 'default', sortable: false},
                { title: '', key: 'actions', sortable: false, align: 'end'},
            ]
        },
    },
    methods: {
        openNewBoard: function() {
            this.dialogBoard = {
                open: true,
                title: this.text.newBoard,
                item: Object.assign({}, this.defaultBoard),
                current: null,
                saveButton: this.text.add,
            }
        },
        openBoard: function (board) {
            this.dialogBoard = {
                open: true,
                title: this.i18n.getMessage('TitleUpdate', board.raw.key),
                item: Object.assign({}, board.raw),
                current: board.raw,
                saveButton: this.text.save,
            }
        },
        closeBoard: function () {
            this.dialogBoard = {
                open: false,
                title: '',
                item: Object.assign({}, this.defaultBoard),
                current: null,
                saveButton: this.text.add,
            }
        },
        async saveBoard (event) {
            const result = await event

            if (false === result.valid) {
                return
            }

            if (null === this.dialogBoard.current) {
                this.$store.dispatch('jira/addBoard', this.dialogBoard.item)
            } else {
                this.$store.dispatch(
                    'jira/updateBoard',
                    {
                        previous: this.dialogBoard.current,
                        board: this.dialogBoard.item,
                    },
                )
            }

            this.closeBoard()
        },
        removeBoard: function () {
            this.$store.dispatch('jira/removeBoard', this.deleteBoard)
            this.closeDialogDeleteBoard()
        },
        openDialogDeleteBoard: function (board) {
            this.deleteBoard = board.raw
            this.dialogDeleteBoard = true
        },
        closeDialogDeleteBoard: function () {
            this.deleteBoard = {}
            this.dialogDeleteBoard = false
        },
        checkBoardKeyDuplicated: function (value) {
            if (null === value) {
                return false
            }

            let searchResult = this.$store.getters['jira/getBoards'].find(board => board.key.toLowerCase() === value.toLowerCase())

            if (undefined === searchResult) {
                return false
            }

            if (null === this.dialogBoard.current) {
                return true
            }

            return value !== this.dialogBoard.current.key
        },
    },
}
</script>
