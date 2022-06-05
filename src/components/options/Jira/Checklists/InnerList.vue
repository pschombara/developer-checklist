<template>
    <v-card>
        <v-card-title>{{checklist.title}}</v-card-title>
        <v-card-text>
            <v-text-field
                v-model="checklist.title"
                :label="text.name"
                :rules="nameRules"
            ></v-text-field>
            <v-data-table
                :items="checklist.items"
                :headers="header"
                sort-by="sort"
                :items-per-page=-1
                :item-class="activeSortClass"
                :hide-default-footer=true
            >
                <template v-slot:top>
                    <v-toolbar flat>
                        <v-spacer></v-spacer>
                        <v-btn color="primary" @click="openEntry(defaultEntry)">
                            <v-icon left x-small>fas fa-plus</v-icon>
                            {{ text.add }}
                        </v-btn>
                        <v-dialog v-model="deleteElement.open" max-width="450">
                            <v-card>
                                <v-card-title class="headline">{{text.delete}}</v-card-title>
                                <v-card-text>
                                    {{ i18n.getMessage('TitleDelete', deleteElement.text) }}
                                </v-card-text>
                                <v-card-actions>
                                    <v-spacer></v-spacer>
                                    <v-btn color="grey" plain @click="closeRemoveEntry">{{ text.cancel }}</v-btn>
                                    <v-btn color="error" plain @click="removeEntry">{{ text.delete }}</v-btn>
                                    <v-spacer></v-spacer>
                                </v-card-actions>
                            </v-card>
                        </v-dialog>
                        <v-dialog v-model="entry.open" max-width="450">
                            <v-card>
                                <v-card-text>
                                    <v-text-field v-model="entry.text" :label="text.text"></v-text-field>
                                </v-card-text>
                                <v-card-actions>
                                    <v-spacer></v-spacer>
                                    <v-btn color="grey" plain @click="closeEntry">{{text.cancel}}</v-btn>
                                    <v-btn color="primary" plain @click="saveEntry" v-if="entry.id">{{text.save}}</v-btn>
                                    <v-btn color="primary" plain @click="addEntry" v-else>{{text.add}}</v-btn>
                                    <v-spacer></v-spacer>
                                </v-card-actions>
                            </v-card>
                        </v-dialog>
                    </v-toolbar>
                </template>
                <template v-slot:item.actions="{item}">
                    <v-btn icon small @click="openEntry(item)" v-if="!sortItem">
                        <v-icon small>fas fa-edit</v-icon>
                    </v-btn>
                    <v-btn icon small @click="startSort(item)" v-if="!sortItem">
                        <v-icon small>fas fa-sort</v-icon>
                    </v-btn>
                    <v-btn icon small @click="openRemoveEntry(item)" v-if="!sortItem">
                        <v-icon small color="red darken-2">fas fa-trash</v-icon>
                    </v-btn>
                    <v-btn icon small
                           @click="insertBefore(item)"
                           v-if="sortItem && sortItem.id !== item.id"
                           :disabled="item.sort - 1 === sortItem.sort">
                        <v-icon small>fas fa-sort-up</v-icon>
                    </v-btn>
                    <v-btn icon small
                           @click="insertAfter(item)"
                           v-if="sortItem && sortItem.id !== item.id"
                           :disabled="item.sort + 1 === sortItem.sort">
                        <v-icon small>fas fa-sort-down</v-icon>
                    </v-btn>
                    <v-btn icon small @click="cancelSort" v-if="sortItem && sortItem.id === item.id">
                        <v-icon small>fas fa-times</v-icon>
                    </v-btn>
                </template>
            </v-data-table>
        </v-card-text>
        <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="grey" plain @click="$emit('close')">{{ text.cancel }}</v-btn>
            <v-btn
                color="primary"
                plain
                @click="saveCategory"
                :disabled="checklist.title.length <= 0 && 0 === checklist.items.length"
                v-if="!!checklist.uid"
            >{{ text.save }}</v-btn>
            <v-btn
                color="primary"
                plain
                @click="addCategory"
                :disabled="checklist.title.length <= 0 && 0 === checklist.items.length"
                v-else
            >{{ text.add }}</v-btn>
            <v-spacer></v-spacer>
        </v-card-actions>
    </v-card>
</template>

<script>
import Helper from '@/mixins/helper'
import _ from 'lodash'
import {Uuid} from '@/mixins/uuid'

export default  {
    name: 'ChecklistsInnerList',
    props: ['uuid', 'uid', 'text'],
    created() {
        this.getCategory()
    },
    computed: {
        header() {
            return [
                { text: this.text.name, value: 'text', sortable: false },
                { text: '', value: 'actions', align: 'end', sortable: false},
            ]
        },
    },
    watch: {
        uid: function () {
            this.getCategory()
        },
    },
    methods: {
        startSort: function (item) {
            this.sortItem = item
        },
        openRemoveEntry: function (item) {
            this.deleteElement = {
                id: item.id,
                text: item.text,
                open: true,
            }
        },
        closeRemoveEntry: function () {
            this.deleteElement = Object.assign({}, this.defaultEntry)
        },
        removeEntry: function () {
            const index = this.checklist.items.findIndex(element => element.id === this.deleteElement.id)

            if (-1 !== index) {
                this.checklist.items.splice(index, 1)
                Helper.resort(this.checklist.items)
            }

            this.closeRemoveEntry()
        },
        insertBefore: function (item) {
            Helper.sortBefore(this.checklist.items, this.sortItem, item, 'id')
        },
        insertAfter: function (item) {
            Helper.sortAfter(this.checklist.items, this.sortItem, item, 'id')
        },
        cancelSort: function () {
            this.sortItem = null
        },
        activeSortClass: function (item) {
            if (null === this.sortItem) {
                return ''
            }

            return item.id === this.sortItem.id ? 'primary' : ''
        },
        saveCategory: function () {
            this.$store.dispatch('jira/updateCategory', {
                uuid: this.uuid,
                category: this.checklist,
            })

            this.$emit('close')
        },
        addCategory: function () {
            this.$store.dispatch('jira/addCategory', {
                uuid: this.uuid,
                category: this.checklist,
            })

            this.checklist = _.cloneDeep(this.defaultChecklist)

            this.$emit('close')
        },
        getCategory: function () {
            if (null === this.uid) {
                this.checklist = _.cloneDeep(this.defaultChecklist)

                return
            }

            this.checklist = _.cloneDeep(this.$store.getters['jira/getCategory'](this.uuid, this.uid))
        },
        openEntry: function (entry) {
            this.entry = {
                id: entry.id,
                text: entry.text,
                open: true,
            }
        },
        closeEntry: function () {
            this.entry = Object.assign({}, this.defaultEntry)
        },
        saveEntry: function () {
            const entry = this.checklist.items.find(element => element.id === this.entry.id)

            entry.text = this.entry.text

            this.closeEntry()
        },
        addEntry: function () {
            this.checklist.items.push({
                id: Uuid.generate(),
                text: this.entry.text,
                sort: Number.MAX_SAFE_INTEGER,
            })

            Helper.resort(this.checklist.items)

            this.closeEntry()
        },
    },
    data() {
        return {
            nameRules: [
                value => !!value || chrome.i18n.getMessage('errNotBlank'),
            ],
            sortItem: null,
            checklist: {
                uid: null,
                title: '',
                sort: -1,
                items: [],
            },
            defaultChecklist: {
                uid: null,
                title: '',
                sort: -1,
                items: [],
            },
            i18n: chrome.i18n,
            deleteElement: {
                id: null,
                text: '',
                open: false,
            },
            entry: {
                id: null,
                text: '',
                open: false,
            },
            defaultEntry: {
                id: null,
                text: '',
                open: false,
            },
        }
    },
}
</script>
