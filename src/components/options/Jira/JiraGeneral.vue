<script setup>
import Helper from '../../../mixins/helper'
import {computed, ref} from 'vue'
import {useJiraStorage} from '../../../stores/jira.js'

const jiraStorage = useJiraStorage()
const i18n = chrome.i18n
const text = {
    host: i18n.getMessage('Host'),
    issues: i18n.getMessage('IssuesInProgress'),
    cleanup: i18n.getMessage('CleanupInterval'),
    search: i18n.getMessage('Search'),
    add: i18n.getMessage('Add'),
    save: i18n.getMessage('Save'),
    cancel: i18n.getMessage('Cancel'),
    delete: i18n.getMessage('Delete'),
    boardKey: i18n.getMessage('BoardKey'),
    boards: i18n.getMessage('Boards'),
    newBoard: i18n.getMessage('NewBoard'),
    default: i18n.getMessage('Default'),
    hint: {
        cleanup: i18n.getMessage('hintJiraCleanup'),
        issues: i18n.getMessage('hintJiraIssues'),
    },
}

const boardHeaders = [
    { title: text.boardKey, key: 'key'},
    { title: text.default, key: 'default', sortable: false},
    { title: '', key: 'actions', sortable: false, align: 'end'},
]

const urlRules = [
    value => Helper.isURL(value) || i18n.getMessage('errUrlInvalid'),
]

const boardKeyRules = [
    value => !!value || i18n.getMessage('errNotBlank'),
    value => value.length <= 10 || i18n.getMessage('errMaxLength', '10'),
    value => false === checkBoardKeyDuplicated(value) || i18n.getMessage('errDuplicated'),
]

const defaultBoard = {
    key: '',
    default: false,
}

const searchBoards = ref('')
const dialogDeleteBoard = ref(false)
const deleteBoard = ref({})
const dialogBoard = ref({
    open: false,
    title: '',
    item: {...defaultBoard},
    current: null,
    saveButton: '',
})

const host = computed({
    get() {
        return jiraStorage.getUrl
    },
    set(value) {
        if (null === value || Helper.isURL(value)) {
            jiraStorage.updateUrl(value)
        }
    },
})

const cleanup = computed({
    get() {
        return jiraStorage.cleanup
    },
    set(value) {
        jiraStorage.updateCleanup(value)
    },
})

const issues = computed({
    get() {
        return jiraStorage.maximumIssues
    },
    set(value) {
        jiraStorage.updateMaximumIssues(value)
    },
})

const boards = computed(() => {
    return jiraStorage.getBoards
})

const openNewBoard = () => {
    dialogBoard.value = {
        open: true,
        title: text.newBoard,
        item: {...defaultBoard},
        current: null,
        saveButton: text.add,
    }
}

const openBoard = board => {
    dialogBoard.value = {
        open: true,
        title: i18n.getMessage('TitleUpdate', board.key),
        item: {...board},
        current: board,
        saveButton: text.save,
    }
}

const closeBoard = () => {
    dialogBoard.value = {
        open: false,
        title: '',
        item: {...defaultBoard},
        current: null,
        saveButton: text.add,
    }
}

const saveBoard = async event => {
    const result = await event

    if (false === result.valid) {
        return
    }

    if (null === dialogBoard.value.current) {
        jiraStorage.addBoard(dialogBoard.value.item.key, dialogBoard.value.item.default)
    } else {
        jiraStorage.updateBoard(
            dialogBoard.value.current.key,
            dialogBoard.value.item.key,
            dialogBoard.value.item.default,
        )
    }

    closeBoard()
}

const closeDialogDeleteBoard = () => {
    deleteBoard.value = {}
    dialogDeleteBoard.value = false
}

const removeBoard = () => {
    jiraStorage.removeBoard(deleteBoard.value.key)
    closeDialogDeleteBoard()
}

const openDialogDeleteBoard = board => {
    deleteBoard.value = board
    dialogDeleteBoard.value = true
}

const checkBoardKeyDuplicated = value => {
    if (null === value) {
        return false
    }

    const searchResult = jiraStorage.getBoards.find(board => board.key.toLowerCase() === value.toLowerCase())

    if (undefined === searchResult) {
        return false
    }

    if (null === dialogBoard.value.current) {
        return true
    }

    return value !== dialogBoard.value.current.key
}
</script>

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
                                        v-if="item.default"
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
