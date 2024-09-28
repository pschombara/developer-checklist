<script setup>

import {computed, ref} from 'vue'
import {useChatStorage} from '../../../stores/chat.js'

const props = defineProps({
    client: {
        type: String,
        required: true,
    },
})

const i18n = chrome.i18n

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

const sortMessage = ref(null)
const editMessage = ref({...defaultEditMsg})
const deleteMessage = ref({...defaultDeleteMsg})

const nameRules = [
    value => !!value || chrome.i18n.getMessage('errNotBlank'),
    value => value.length <= 20 || chrome.i18n.getMessage('errMaxLength', '20'),
    value => false === checkDuplicated(value) || chrome.i18n.getMessage('errDuplicated'),
]

const contentRules = [
    value => !!value || chrome.i18n.getMessage('errNotBlank'),
    value => value.length <= 200 || chrome.i18n.getMessage('errMaxLength', '200'),
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
    sortMessage.value = item
}

const closeSort = () => {
    sortMessage.value = null
}

const sortBefore = item => {
    chatStorage.messageSortBefore(props.client, item.id, sortMessage.value.id)
}

const sortAfter = item => {
    chatStorage.messageSortAfter(props.client, item.id, sortMessage.value.id)
}

const openMessage = item => {
    editMessage.value = {
        open: true,
        id: item.id,
        name: item.name,
        content: item.content,
        title: i18n.getMessage('TitleUpdate', item.name),
        saveButton: text.save,
    }
}

const closeMessage = () => {
    editMessage.value = {...defaultEditMsg}
}

const openAddMessage = () => {
    closeMessage()
    editMessage.value.open = true
}

const openDeleteMessage = item => {
    deleteMessage.value = {
        open: true,
        id: item.id,
        name: item.name,
    }
}

const closeDeleteMessage = () => {
    deleteMessage.value = {...defaultDeleteMsg}
}

const checkDuplicated = value => {
    const msg = chatStorage.getMessages(props.client).find(item => item.name === value)

    if (undefined === msg) {
        return false
    }

    if (null === editMessage.value.id) {
        return true
    }

    return editMessage.value.name !== value
}

const removeMessage = () => {
    chatStorage.removeMessage(props.client, deleteMessage.value.id)
    closeDeleteMessage()
}

const saveMessage = async event => {
    const result = await event

    if (false === result) {
        return
    }

    if (null === editMessage.value.id) {
        chatStorage.createMessage(props.client, editMessage.value.name, editMessage.value.content)
    } else {

    }

    closeMessage()
}
// export default {
//     methods: {
//         async saveMessage (event) {
//             const result = await event
//
//             if (false === result) {
//                 return
//             }
//
//             if (null === this.editMessage.id) {
//             } else {
//                 this.$store.dispatch('chat/updateMessage', {
//                     client: this.client,
//                     message: {
//                         id: this.editMessage.id,
//                         name: this.editMessage.name,
//                         content: this.editMessage.content,
//                     },
//                 })
//             }
//
//             this.closeMessage()
//         },
//     },
// }
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
                    <v-dialog v-model="editMessage.open" max-width="600">
                        <v-form validate-on="input" @submit.prevent="saveMessage">
                            <v-card>
                                <v-card-title>{{ editMessage.title }}</v-card-title>
                                <v-card-text>
                                    <v-text-field
                                        v-model="editMessage.name"
                                        :label="text.name"
                                        counter="20"
                                        :rules="nameRules"
                                    ></v-text-field>
                                    <v-textarea
                                        v-model="editMessage.content"
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
                                        variant="plain">{{ editMessage.saveButton }}
                                    </v-btn>
                                    <v-spacer></v-spacer>
                                </v-card-actions>
                            </v-card>
                        </v-form>
                    </v-dialog>
                    <v-dialog v-model="deleteMessage.open" max-width="450">
                        <v-card>
                            <v-card-title>
                                {{ i18n.getMessage('TitleDelete', deleteMessage.name) }}
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
                        v-if="!sortMessage"
                        variant="plain"
                        icon="fas fa-edit"
                        size="small"
                        @click="openMessage(item)">
                    </v-btn>
                    <v-btn
                        v-if="!sortMessage"
                        variant="plain"
                        icon="fas fa-sort"
                        size="small"
                        :disabled="messages.length < 2"
                        @click="startSort(item)">
                    </v-btn>
                    <v-btn
                        v-if="!sortMessage"
                        variant="plain"
                        icon="fas fa-trash"
                        size="small"
                        color="tertiary"
                        @click="openDeleteMessage(item)">
                    </v-btn>
                    <v-btn
                        v-if="sortMessage && sortMessage.id !== item.id"
                        variant="plain"
                        icon="fas fa-sort-up"
                        size="small"
                        :disabled="item.sort - 1 === sortMessage.sort"
                        @click="sortBefore(item)"></v-btn>
                    <v-btn
                        v-if="sortMessage && sortMessage.id !== item.id"
                        variant="plain"
                        icon="fas fa-sort-down"
                        size="small"
                        :disabled="item.sort + 1 === sortMessage.sort"
                        @click="sortAfter(item)"></v-btn>
                    <v-btn
                        v-if="sortMessage && sortMessage.id === item.id"
                        variant="plain"
                        icon="fas fa-times"
                        size="small"
                        @click="closeSort"></v-btn>
                </template>
            </v-data-table>
        </v-card-text>
    </v-card>
</template>
