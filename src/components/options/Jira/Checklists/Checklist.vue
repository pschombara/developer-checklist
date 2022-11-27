<template>
    <v-card flat>
        <v-card-text>
            <v-row>
                <v-col cols="12" sm="4" md="3">
                    <v-switch
                        v-model="enabled"
                        :label="text.enabled"
                    ></v-switch>
                </v-col>
                <v-col cols="12" sm="4" md="3">
                    <v-text-field
                        v-model="name"
                        :label="text.name"
                        counter="20"
                        ref="name"
                    ></v-text-field>
                </v-col>
                <v-col cols="12" sm="4" md="3">
                    <v-combobox
                        v-model="icon"
                        :items="icons"
                        label="Icon"
                    >
                        <template v-slot:selection="{item}">
                            <v-icon left>fas fa-{{ item.value }}</v-icon>
                            {{ item.value }}
                        </template>
                        <template v-slot:item="{item}">
                            <v-icon left>fas fa-{{ item.value }}</v-icon>
                            {{ item.value }}
                            <v-spacer></v-spacer>
                        </template>
                    </v-combobox>
                </v-col>
            </v-row>
            <v-row>
                <v-col cols="12" sm="4" md="3">
                    <h4>{{ text.buttons }}</h4>
                </v-col>
                <v-col cols="12" sm="4" md="3">
                    <h5>{{ text.success }}</h5>
                    <v-btn
                        :color="checklist.buttons.success.enabled ? 'success' : 'grey'"
                        outlined
                        @click="openButtonSuccessDialog"
                    >
                        <v-icon left>fas fa-check</v-icon>
                        {{ '' !== checklist.buttons.success.text ? checklist.buttons.success.text : '__Text__' }}
                    </v-btn>
                    <v-dialog v-model="dialogBtnSuccess.open" max-width="600">
                        <v-card>
                            <v-card-title>{{ text.success }}</v-card-title>
                            <v-card-text>
                                <v-form v-model="dialogBtnSuccess.valid" ref="formBtnSuccess">
                                    <v-switch
                                        color="primary"
                                        :label="text.buttonEnabled"
                                        v-model="dialogBtnSuccess.item.enabled"
                                    ></v-switch>
                                    <v-text-field
                                        :label="text.text"
                                        v-model="dialogBtnSuccess.item.text"
                                        :rules="textRules"
                                        counter="15"
                                    ></v-text-field>
                                    <v-select
                                        :label="text.comment"
                                        v-model="dialogBtnSuccess.item.comment"
                                        :items="templates"
                                        item-title="title"
                                        item-value="id"
                                        :menu-props="{closeOnContentClick: true}"
                                    >
                                        <template v-slot:prepend-item>
                                            <v-list-item
                                                @click="dialogBtnSuccess.item.comment = null"
                                                v-if="null !== dialogBtnSuccess.item.comment"
                                            >
                                                <v-list-item-title>No Comment (TODO)</v-list-item-title>
                                            </v-list-item>
                                        </template>
                                    </v-select>
                                    <v-switch
                                        :label="text.sendCommentImmediately"
                                        v-model="dialogBtnSuccess.item.autoComment"
                                    ></v-switch>
                                    <v-switch
                                        :label="text.listCompletelyChecked"
                                        v-model="dialogBtnSuccess.item.successRequiredAll"
                                    ></v-switch>
                                </v-form>
                            </v-card-text>
                            <v-card-actions>
                                <v-spacer></v-spacer>
                                <v-btn color="grey" plain @click="closeButtonSuccessDialog">{{ text.cancel }}</v-btn>
                                <v-btn color="primary" plain @click="saveButtonSuccess"
                                       :disabled="!dialogBtnSuccess.valid">{{ text.save }}
                                </v-btn>
                                <v-spacer></v-spacer>
                            </v-card-actions>
                        </v-card>
                    </v-dialog>
                </v-col>
                <v-col cols="12" sm="4" md="3">
                    <h5>{{ text.failed }}</h5>
                    <v-btn
                        :color="checklist.buttons.failed.enabled ? 'error' : 'grey'"
                        outlined
                        @click="openButtonFailedDialog"
                    >
                        <v-icon left>fas fa-times</v-icon>
                        {{ '' !== checklist.buttons.failed.text ? checklist.buttons.failed.text : '__Text__' }}
                    </v-btn>
                    <v-dialog v-model="dialogBtnFailed.open" max-width="600">
                        <v-card>
                            <v-card-title>{{ text.failed }}</v-card-title>
                            <v-card-text>
                                <v-form v-model="dialogBtnFailed.valid" ref="formBtnFailed">
                                    <v-switch
                                        :label="text.buttonEnabled"
                                        v-model="dialogBtnFailed.item.enabled"
                                    ></v-switch>
                                    <v-text-field
                                        :label="text.text"
                                        v-model="dialogBtnFailed.item.text"
                                        :rules="textRules"
                                        counter="15"
                                    ></v-text-field>
                                    <v-select
                                        :label="text.comment"
                                        v-model="dialogBtnFailed.item.comment"
                                        :items="templates"
                                        item-title="title"
                                        item-value="id"
                                    ></v-select>
                                    <v-switch
                                        :label="text.sendCommentImmediately"
                                        v-model="dialogBtnFailed.item.autoComment"
                                    ></v-switch>
                                </v-form>
                            </v-card-text>
                            <v-card-actions>
                                <v-spacer></v-spacer>
                                <v-btn color="grey" plain @click="closeButtonFailedDialog">{{ text.cancel }}</v-btn>
                                <v-btn color="primary" plain @click="saveButtonFailed"
                                       :disabled="!dialogBtnFailed.valid">{{ text.save }}
                                </v-btn>
                                <v-spacer></v-spacer>
                            </v-card-actions>
                        </v-card>
                    </v-dialog>
                </v-col>
            </v-row>
            <v-row>
                <v-col cols="12">
                    <h4>{{ text.checklists }}</h4>
                </v-col>
            </v-row>
            <v-row>
                <v-col cols="12">
                    <v-data-table
                        :items="categories"
                        :headers="categoriesHeader"
                        sort-by="sort"
                        :items-per-page=-1
                        :item-class="itemRowSortActiveClass"
                        :hide-default-footer=true
                    >
                        <template v-slot:top>
                            <v-toolbar flat>
                                <v-spacer></v-spacer>
                                <v-btn color="primary" @click="openCategory(null)">
                                    <v-icon left x-small>fas fa-plus</v-icon>
                                    {{ text.add }}
                                </v-btn>
                                <v-dialog
                                    v-model="openChecklistDialog"
                                    fullscreen
                                    hide-overlay
                                >
                                    <InnerList
                                        :uuid="uuid"
                                        :uid="categoryId"
                                        v-on:close="closeCategory"
                                        :text="text"></InnerList>
                                </v-dialog>
                                <v-dialog v-model="deleteCategory.open" max-width="450">
                                    <v-card>
                                        <v-card-title class="headline">
                                            {{ i18n.getMessage('TitleDelete', deleteCategory.title) }}
                                        </v-card-title>
                                        <v-card-actions>
                                            <v-spacer></v-spacer>
                                            <v-btn color="grey" plain @click="closeDialogDeleteCategory">{{ text.cancel }}</v-btn>
                                            <v-btn color="error" plain @click="removeCategory">{{ text.delete }}</v-btn>
                                            <v-spacer></v-spacer>
                                        </v-card-actions>
                                    </v-card>
                                </v-dialog>
                            </v-toolbar>
                        </template>
                        <template v-slot:item.actions="{item}">
                            <v-btn icon small @click="openCategory(item.uid)" v-if="!sortChecklist">
                                <v-icon small>fas fa-edit</v-icon>
                            </v-btn>
                            <v-btn icon small @click="categoryStartSort(item)" v-if="!sortChecklist">
                                <v-icon small>fas fa-sort</v-icon>
                            </v-btn>
                            <v-btn icon small @click="openDialogDeleteCategory(item)" v-if="!sortChecklist">
                                <v-icon small color="red darken-2">fas fa-trash</v-icon>
                            </v-btn>
                            <v-btn icon small
                                   @click="categoryInsertBefore(item)"
                                   v-if="sortChecklist && sortChecklist.uid !== item.uid"
                                   :disabled="item.sort - 1 === sortChecklist.sort">
                                <v-icon small>fas fa-sort-up</v-icon>
                            </v-btn>
                            <v-btn icon small
                                   @click="categoryInsertAfter(item)"
                                   v-if="sortChecklist && sortChecklist.uid !== item.uid"
                                   :disabled="item.sort + 1 === sortChecklist.sort">
                                <v-icon small>fas fa-sort-down</v-icon>
                            </v-btn>
                            <v-btn icon small @click="categoryCancelSort"
                                   v-if="sortChecklist && sortChecklist.uid === item.uid">
                                <v-icon small>fas fa-times</v-icon>
                            </v-btn>
                        </template>
                    </v-data-table>
                </v-col>
            </v-row>
        </v-card-text>
    </v-card>
</template>

<script>

import InnerList from '@/components/options/Jira/Checklists/InnerList'

export default {
    name: 'ChecklistsChecklist',
    components: {InnerList},
    props: ['uuid'],
    created() {
        this.checklist = this.$store.getters['jira/getChecklist'](this.uuid)
    },
    computed: {
        name: {
            get() {
                return this.checklist.name
            },
            set(value) {
                if (this.$refs.name.validate()) {
                    this.$store.dispatch('jira/updateChecklistName', {uuid: this.uuid, name: value})
                }
            },
        },
        icon: {
            get() {
                return this.checklist.icon
            },
            set(value) {
                this.$store.dispatch(
                    'jira/updateChecklistIcon',
                    {uuid: this.uuid, icon: value ?? ''},
                )
            },
        },
        categories: {
            get() {
                return this.checklist.checklist
            },
        },
        categoriesHeader() {
            return [
                {text: this.text.name, value: 'title', sortable: false},
                {text: '', value: 'actions', align: 'end', sortable: false},
            ]
        },
        enabled: {
            get() {
                return this.checklist.enabled
            },
            set(value) {
                this.$store.dispatch(
                    'jira/updateChecklistEnabled',
                    {uuid: this.uuid, enabled: value},
                )
            },
        },
        icons: {
            get() {
                return this.$store.getters['icons/getIcons']
            },
        },
        templates() {
            return this.$store.getters['jira/templates']
        },
    },
    methods: {
        openButtonSuccessDialog: function () {
            this.dialogBtnSuccess.open = true
            this.dialogBtnSuccess.item = Object.assign({}, this.checklist.buttons.success)
            this.dialogBtnSuccess.item.successRequiredAll = this.checklist.successRequiredAll
        },
        closeButtonSuccessDialog: function () {
            this.dialogBtnSuccess.open = false
        },
        saveButtonSuccess: function () {
            if (this.$refs.formBtnSuccess.validate()) {
                this.$store.dispatch('jira/updateButtonSuccess', {
                    uuid: this.uuid,
                    button: this.dialogBtnSuccess.item,
                })
            }

            this.closeButtonSuccessDialog()
        },
        openButtonFailedDialog: function () {
            this.dialogBtnFailed.open = true
            this.dialogBtnFailed.item = Object.assign({}, this.checklist.buttons.failed)
        },
        closeButtonFailedDialog: function () {
            this.dialogBtnFailed.open = false
        },
        saveButtonFailed: function () {
            if (this.$refs.formBtnFailed.validate()) {
                this.$store.dispatch('jira/updateButtonFailed', {
                    uuid: this.uuid,
                    button: this.dialogBtnFailed.item,
                })
            }

            this.closeButtonFailedDialog()
        },
        openDialogDeleteCategory: function (category) {
            this.deleteCategory = {
                uid: category.uid,
                title: category.title,
                open: true,
            }
        },
        closeDialogDeleteCategory: function () {
            this.deleteCategory = {
                uid: null,
                title: '',
                open: false,
            }
        },
        removeCategory: function () {
            this.$store.dispatch('jira/removeCategory', {
                uuid: this.uuid,
                uid: this.deleteCategory.uid,
            })

            this.closeDialogDeleteCategory()
        },
        categoryStartSort: function (checklist) {
            this.sortChecklist = checklist
        },
        categoryCancelSort: function () {
            this.sortChecklist = null
        },
        categoryInsertBefore: function (item) {
            this.$store.dispatch('jira/categoryMoveBefore', {
                uuid: this.uuid,
                current: this.sortChecklist.uid,
                ref: item.uid,
            })
        },
        categoryInsertAfter: function (item) {
            this.$store.dispatch('jira/categoryMoveAfter', {
                uuid: this.uuid,
                current: this.sortChecklist.uid,
                ref: item.uid,
            })
        },
        itemRowSortActiveClass: function (item) {
            if (null === this.sortChecklist) {
                return ''
            }

            return item.uid === this.sortChecklist.uid ? 'primary' : ''
        },
        openCategory: function (uid) {
            this.categoryId = uid
            this.openChecklistDialog = true
        },
        closeCategory: function () {
            this.categoryId = null
            this.openChecklistDialog = false
        },
    },
    data() {
        return {
            text: {
                name: chrome.i18n.getMessage('Name'),
                cancel: chrome.i18n.getMessage('Cancel'),
                save: chrome.i18n.getMessage('Save'),
                enabled: chrome.i18n.getMessage('ChecklistEnabled'),
                buttons: chrome.i18n.getMessage('Buttons'),
                buttonEnabled: chrome.i18n.getMessage('ButtonEnabled'),
                success: chrome.i18n.getMessage('Success'),
                failed: chrome.i18n.getMessage('Failed'),
                text: chrome.i18n.getMessage('Text'),
                comment: chrome.i18n.getMessage('comment'),
                sendCommentImmediately: chrome.i18n.getMessage('SendCommentImmediately'),
                listCompletelyChecked: chrome.i18n.getMessage('ListCompletelyChecked'),
                checklists: chrome.i18n.getMessage('Checklists'),
                add: chrome.i18n.getMessage('Add'),
                delete: chrome.i18n.getMessage('Delete'),
            },
            i18n: chrome.i18n,
            checklist: {},
            dialogBtnSuccess: {
                open: false,
                item: {
                    enabled: false,
                    text: '',
                    comment: '',
                    autoComment: false,
                    successRequiredAll: false,
                },
                valid: true,
            },
            dialogBtnFailed: {
                open: false,
                item: {
                    enabled: false,
                    text: '',
                    comment: '',
                    autoComment: false,
                },
                valid: true,
            },
            textRules: [
                value => value.length <= 15 || chrome.i18n.getMessage('errMaxLength', '15'),
            ],
            sortChecklist: null,
            openChecklistDialog: false,
            categoryId: null,
            deleteCategory: {
                uid: null,
                title: '',
                open: false,
            },
        }
    },
}
</script>
