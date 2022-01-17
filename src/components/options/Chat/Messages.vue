<template>
    <v-card>
        <v-card-text>
            <v-data-table
                :headers="messagesHeader"
                :items="messages"
                sort-by="sort"
                :items-per-page="-1"
                :item-class="itemRowSortActiveClass"
                :hide-default-footer="true"
            >
                <template v-slot:top>
                    <v-toolbar flat>
                        <v-spacer></v-spacer>
                        <v-btn color="primary" @click="openAddMessage"><v-icon left>fas fa-plus</v-icon>{{text.add}}</v-btn>
                    </v-toolbar>
                    <v-dialog v-model="editMessage.open" max-width="600">
                        <v-card>
                            <v-card-title>{{editMessage.title}}</v-card-title>
                            <v-card-text>
                                <v-form v-model="formValid" ref="messageForm">
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
                                </v-form>
                            </v-card-text>
                            <v-card-actions>
                                <v-spacer></v-spacer>
                                <v-btn color="grey" plain @click="closeMessage">{{ text.cancel }}</v-btn>
                                <v-btn color="primary" plain @click="saveMessage" v-if="!!editMessage.id" :disabled="!formValid">{{ text.save }}</v-btn>
                                <v-btn color="primary" plain @click="addMessage" v-else :disabled="!formValid">{{ text.add }}</v-btn>
                                <v-spacer></v-spacer>
                            </v-card-actions>
                        </v-card>
                    </v-dialog>
                    <v-dialog v-model="deleteMessage.open" max-width="450">
                        <v-card>
                            <v-card-title>
                                {{i18n.getMessage('TitleDelete', deleteMessage.name)}}
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
                <template v-slot:item.actions="{item}">
                    <v-btn icon small @click="openMessage(item)" v-if="!sortMessage">
                        <v-icon small>fas fa-edit</v-icon>
                    </v-btn>
                    <v-btn icon small @click="startSort(item)" v-if="!sortMessage" :disabled="messages.length < 2">
                        <v-icon small>fas fa-sort</v-icon>
                    </v-btn>
                    <v-btn icon small @click="openDeleteMessage(item)" v-if="!sortMessage">
                        <v-icon small color="red darken-2">fas fa-trash</v-icon>
                    </v-btn>
                    <v-btn icon small
                           @click="sortBefore(item)"
                           v-if="sortMessage && sortMessage.id !== item.id"
                           :disabled="item.sort - 1 === sortMessage.sort">
                        <v-icon small>fas fa-sort-up</v-icon>
                    </v-btn>
                    <v-btn icon small
                           @click="sortAfter(item)"
                           v-if="sortMessage && sortMessage.id !== item.id"
                           :disabled="item.sort + 1 === sortMessage.sort">
                        <v-icon small>fas fa-sort-down</v-icon>
                    </v-btn>
                    <v-btn icon small @click="closeSort"
                           v-if="sortMessage && sortMessage.id === item.id">
                        <v-icon small>fas fa-times</v-icon>
                    </v-btn>
                </template>
            </v-data-table>
        </v-card-text>
    </v-card>
</template>

<script>
export default {
    name: 'Messages',
    props: {
        client: {
            type: String,
            required: true,
        },
    },
    computed: {
        messages() {
            return this.$store.getters['chat/listMessages'](this.client)
        },
        messagesHeader() {
            return [
                {text: 'Name', value: 'name', sortable: false, width: '15%'},
                {text: 'Content', value: 'content', sortable: false, width: '75%'},
                {text: '', value: 'actions', align: 'end', sortable: false, width: '10%'},
            ]
        },
    },
    methods: {
        startSort: function (item) {
            this.sortMessage = item
        },
        closeSort: function () {
            this.sortMessage = null
        },
        sortBefore: function (item) {
            this.$store.dispatch('chat/messageSortBefore', {
                client: this.client,
                ref: item.id,
                current: this.sortMessage.id,
            })
        },
        sortAfter: function (item) {
            this.$store.dispatch('chat/messageSortAfter', {
                client: this.client,
                ref: item.id,
                current: this.sortMessage.id,
            })
        },
        itemRowSortActiveClass: function (item) {
            if (null === this.sortMessage) {
                return ''
            }

            return item.id === this.sortMessage.id ? 'primary' : ''
        },
        openMessage: function (item) {
            this.editMessage = {
                open: true,
                id: item.id,
                name: item.name,
                content: item.content,
                title: this.i18n.getMessage('TitleUpdate', item.name),
            }
        },
        openAddMessage: function () {
            this.closeMessage()
            this.editMessage.open = true
        },
        closeMessage: function () {
            this.editMessage = {
                open: false,
                id: null,
                name: '',
                content: '',
                title: '',
            }
        },
        saveMessage: function () {
            if (this.$refs.messageForm.validate()) {
                this.$store.dispatch('chat/updateMessage', {
                    client: this.client,
                    message: {
                        id: this.editMessage.id,
                        name: this.editMessage.name,
                        content: this.editMessage.content,
                    },
                })
            }

            this.closeMessage()
        },
        addMessage: function () {
            if (this.$refs.messageForm.validate()) {
                this.$store.dispatch('chat/addMessage', {
                    client: this.client,
                    message: {
                        name: this.editMessage.name,
                        content: this.editMessage.content,
                    },
                })
            }

            this.closeMessage()
        },
        openDeleteMessage: function (item) {
            this.deleteMessage = {
                open: true,
                id: item.id,
                name: item.name,
            }
        },
        closeDeleteMessage: function () {
            this.deleteMessage = {
                open: false,
                id: null,
                name: '',
            }
        },
        removeMessage: function () {
            this.$store.dispatch('chat/removeMessage', {
                client: this.client,
                id: this.deleteMessage.id,
            })
        },
        checkDuplicated: function (value) {
            const message = this.$store.getters['chat/listMessages'](this.client).find(item => item.name === value)

            if (undefined === message) {
                return false
            }

            if (null === this.editMessage.id) {
                return true
            }

            return this.editMessage.name !== value
        },
    },
    data() {
        return {
            sortMessage: null,
            editMessage: {
                open: false,
                id: null,
                name: '',
                content: '',
            },
            deleteMessage: {
                open: false,
                id: null,
                name: '',
            },
            i18n: chrome.i18n,
            text: {
                add: chrome.i18n.getMessage('Add'),
                save: chrome.i18n.getMessage('Save'),
                cancel: chrome.i18n.getMessage('Cancel'),
                delete: chrome.i18n.getMessage('Delete'),
                name: chrome.i18n.getMessage('Name'),
                content: chrome.i18n.getMessage('TextContent'),
            },
            nameRules: [
                value => !!value || chrome.i18n.getMessage('errNotBlank'),
                value => value.length <= 20 || chrome.i18n.getMessage('errMaxLength', '20'),
                value => false === this.checkDuplicated(value) || chrome.i18n.getMessage('errDuplicated'),
            ],
            contentRules: [
                value => !!value || chrome.i18n.getMessage('errNotBlank'),
                value => value.length <= 200 || chrome.i18n.getMessage('errMaxLength', '200'),
            ],
            formValid: false,
        }
    },
}
</script>
