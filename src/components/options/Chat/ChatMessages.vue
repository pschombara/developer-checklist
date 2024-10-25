<script setup>

import {computed, ref} from 'vue'
import {useChatStorage} from '../../../stores/chat.ts'

const props = defineProps({
    client: {
        type: String,
        required: true,
    },
})

const i18n = browser.i18n

const text = {
    add: i18n.getMessage('Add'),
    save: i18n.getMessage('Save'),
    cancel: i18n.getMessage('Cancel'),
    delete: i18n.getMessage('Delete'),
    name: i18n.getMessage('Name'),
    content: i18n.getMessage('TextContent'),
}

const defaultDeleteMsg = {
    open: false,
    id: null,
    name: '',
}

const defaultEditMsg = {
    open: false,
    id: null,
    name: '',
    content: '',
    saveButton: text.add,
}

const sortMsg = ref(null)
const editMsg = ref({...defaultEditMsg})
const deleteMsg = ref({...defaultDeleteMsg})

const nameRules = [
    value => !!value || i18n.getMessage('errNotBlank'),
    value => value.length <= 20 || i18n.getMessage('errMaxLength', '20'),
    value => false === checkDuplicated(value) || i18n.getMessage('errDuplicated'),
]

const contentRules = [
    value => !!value || i18n.getMessage('errNotBlank'),
    value => value.length <= 200 || i18n.getMessage('errMaxLength', '200'),
]

const chatStorage = useChatStorage()

const messages = computed(() => {
    return chatStorage.getMessages(props.client)
})

const messagesHeader = computed(() => {
    return [
        {title: 'Name', key: 'name', sortable: false, width: '15%'},
        {title: 'Content', key: 'content', sortable: false, width: '75%'},
        {title: '', key: 'actions', align: 'end', sortable: false, width: '10%'},
    ]
})

const startSort = item => {
    sortMsg.value = item
}

const closeSort = () => {
    sortMsg.value = null
}

const sortBefore = item => {
    chatStorage.messageSortBefore(props.client, item.id, sortMsg.value.id)
}

const sortAfter = item => {
    chatStorage.messageSortAfter(props.client, item.id, sortMsg.value.id)
}

const openMessage = item => {
    editMsg.value = {
        open: true,
        id: item.id,
        name: item.name,
        content: item.content,
        title: i18n.getMessage('TitleUpdate', item.name),
        saveButton: text.save,
    }
}

const closeMessage = () => {
    editMsg.value = {...defaultEditMsg}
}

const openAddMessage = () => {
    closeMessage()
    editMsg.value.open = true
}

const openDeleteMessage = item => {
    deleteMsg.value = {
        open: true,
        id: item.id,
        name: item.name,
    }
}

const closeDeleteMessage = () => {
    deleteMsg.value = {...defaultDeleteMsg}
}

const checkDuplicated = value => {
    const msg = chatStorage.getMessages(props.client).find(item => item.name === value)

    if (undefined === msg) {
        return false
    }

    if (null === editMsg.value.id) {
        return true
    }

    return editMsg.value.name !== value
}

const removeMessage = () => {
    chatStorage.removeMessage(props.client, deleteMsg.value.id)
    closeDeleteMessage()
}

const saveMessage = async event => {
    const result = await event

    if (false === result) {
        return
    }

    if (null === editMsg.value.id) {
        chatStorage.createMessage(props.client, editMsg.value.name, editMsg.value.content)
    } else {
        chatStorage.updateMessage(props.client, editMsg.value.id, editMsg.value.name, editMsg.value.content)
    }

    closeMessage()
}
</script>

<template>
    <v-card>
        <v-card-text>
            <v-data-table
                :headers="messagesHeader"
                :items="messages"
                :sort-by="[{key: 'sort', order: 'asc'}]"
                :items-per-page="-1"
                :hide-default-footer="true"
            >
                <template #top>
                    <v-toolbar flat>
                        <v-spacer></v-spacer>
                        <v-btn
                            variant="plain"
                            prepend-icon="fas fa-plus"
                            color="primary"
                            @click="openAddMessage">{{ text.add }}
                        </v-btn>
                    </v-toolbar>
                    <v-dialog v-model="editMsg.open" max-width="600">
                        <v-form validate-on="input" @submit.prevent="saveMessage">
                            <v-card>
                                <v-card-title>{{ editMsg.title }}</v-card-title>
                                <v-card-text>
                                    <v-text-field
                                        v-model="editMsg.name"
                                        :label="text.name"
                                        counter="20"
                                        :rules="nameRules"
                                    ></v-text-field>
                                    <v-textarea
                                        v-model="editMsg.content"
                                        :label="text.content"
                                        counter="200"
                                        :rules="contentRules"
                                    ></v-textarea>
                                </v-card-text>
                                <v-card-actions>
                                    <v-spacer></v-spacer>
                                    <v-btn
                                        color="secondary"
                                        variant="plain"
                                        @click="closeMessage">{{ text.cancel }}
                                    </v-btn>
                                    <v-btn
                                        type="submit"
                                        color="primary"
                                        variant="plain">{{ editMsg.saveButton }}
                                    </v-btn>
                                    <v-spacer></v-spacer>
                                </v-card-actions>
                            </v-card>
                        </v-form>
                    </v-dialog>
                    <v-dialog v-model="deleteMsg.open" max-width="450">
                        <v-card>
                            <v-card-title>
                                {{ i18n.getMessage('TitleDelete', deleteMsg.name) }}
                            </v-card-title>
                            <v-card-actions>
                                <v-spacer></v-spacer>
                                <v-btn color="grey" plain @click="closeDeleteMessage">{{ text.cancel }}</v-btn>
                                <v-btn color="error" plain @click="removeMessage">{{ text.delete }}</v-btn>
                                <v-spacer></v-spacer>
                            </v-card-actions>
                        </v-card>
                    </v-dialog>
                </template>
                <template #item.actions="{item}">
                    <v-btn
                        v-if="!sortMsg"
                        variant="plain"
                        icon="fas fa-edit"
                        size="small"
                        @click="openMessage(item)">
                    </v-btn>
                    <v-btn
                        v-if="!sortMsg"
                        variant="plain"
                        icon="fas fa-sort"
                        size="small"
                        :disabled="messages.length < 2"
                        @click="startSort(item)">
                    </v-btn>
                    <v-btn
                        v-if="!sortMsg"
                        variant="plain"
                        icon="fas fa-trash"
                        size="small"
                        color="tertiary"
                        @click="openDeleteMessage(item)">
                    </v-btn>
                    <v-btn
                        v-if="sortMsg && sortMsg.id !== item.id"
                        variant="plain"
                        icon="fas fa-sort-up"
                        size="small"
                        :disabled="item.sort - 1 === sortMsg.sort"
                        @click="sortBefore(item)"></v-btn>
                    <v-btn
                        v-if="sortMsg && sortMsg.id !== item.id"
                        variant="plain"
                        icon="fas fa-sort-down"
                        size="small"
                        :disabled="item.sort + 1 === sortMsg.sort"
                        @click="sortAfter(item)"></v-btn>
                    <v-btn
                        v-if="sortMsg && sortMsg.id === item.id"
                        variant="plain"
                        icon="fas fa-times"
                        size="small"
                        @click="closeSort"></v-btn>
                </template>
            </v-data-table>
        </v-card-text>
    </v-card>
</template>
