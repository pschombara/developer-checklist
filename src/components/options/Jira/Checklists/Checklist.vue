<template>
    <v-card flat>
        <v-card-text>
            <v-row>
                <v-col cols="12" sm="4" md="3">
                    <v-switch
                        v-model="enabled"
                        :label="text.enabled"
                        color="primary"
                    ></v-switch>
                </v-col>
                <v-col cols="12" sm="4" md="3">
                    <v-text-field
                        ref="name"
                        v-model="name"
                        :label="text.name"
                        counter="20"
                    ></v-text-field>
                </v-col>
                <v-col cols="12" sm="4" md="3">
                    <v-combobox
                        v-model="icon"
                        :items="icons"
                        label="Icon"
                    >
                        <template #selection="{ item }">
                            <v-icon :icon="'fas fa-' + item.value"></v-icon>
                            <span class="ms-2">{{item.value}}</span>
                        </template>
                        <template #item="{props, item}">
                            <v-list-item
                                v-bind="props"
                                :prepend-icon="'fas fa-' + item.value"
                                :title="item.value"></v-list-item>
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
                        :color="checklist.buttons.success.enabled ? 'primary' : 'secondary'"
                        variant="outlined"
                        prepend-icon="fas fa-check"
                        @click="openButtonSuccessDialog">
                        {{ '' !== checklist.buttons.success.text ? checklist.buttons.success.text : '__Text__' }}
                    </v-btn>
                    <v-dialog v-model="dialogBtnSuccess.open" max-width="600">
                        <v-card>
                            <v-card-title>{{ text.success }}</v-card-title>
                            <v-card-text>
                                <v-form ref="formBtnSuccess" v-model="dialogBtnSuccess.valid">
                                    <v-switch
                                        v-model="dialogBtnSuccess.item.enabled"
                                        color="primary"
                                        :label="text.buttonEnabled"
                                    ></v-switch>
                                    <v-text-field
                                        v-model="dialogBtnSuccess.item.text"
                                        :label="text.text"
                                        :rules="textRules"
                                        counter="15"
                                    ></v-text-field>
                                    <v-select
                                        v-model="dialogBtnSuccess.item.comment"
                                        :label="text.comment"
                                        :items="templates"
                                        item-title="title"
                                        item-value="id"
                                        :menu-props="{closeOnContentClick: true}"
                                    >
                                        <template #prepend-item>
                                            <v-list-item
                                                v-if="null !== dialogBtnSuccess.item.comment"
                                                @click="dialogBtnSuccess.item.comment = null"
                                            >
                                                <v-list-item-title>No Comment (TODO)</v-list-item-title>
                                            </v-list-item>
                                        </template>
                                    </v-select>
                                    <v-switch
                                        v-model="dialogBtnSuccess.item.autoComment"
                                        :label="text.sendCommentImmediately"
                                        color="primary"
                                    ></v-switch>
                                    <v-switch
                                        v-model="dialogBtnSuccess.item.successRequiredAll"
                                        :label="text.listCompletelyChecked"
                                        color="primary"
                                    ></v-switch>
                                </v-form>
                            </v-card-text>
                            <v-card-actions>
                                <v-spacer></v-spacer>
                                <v-btn
                                    variant="plain"
                                    color="secondary"
                                    plain
                                    @click="closeButtonSuccessDialog">{{ text.cancel }}</v-btn>
                                <v-btn
                                    variant="plain"
                                    color="primary"
                                    :disabled="!dialogBtnSuccess.valid"
                                    @click="saveButtonSuccess">{{ text.save }}</v-btn>
                                <v-spacer></v-spacer>
                            </v-card-actions>
                        </v-card>
                    </v-dialog>
                </v-col>
                <v-col cols="12" sm="4" md="3">
                    <h5>{{ text.failed }}</h5>
                    <v-btn
                        :color="checklist.buttons.failed.enabled ? 'tertiary' : 'grey'"
                        variant="outlined"
                        prepend-icon="fas fa-times"
                        @click="openButtonFailedDialog"
                    >
                        {{ '' !== checklist.buttons.failed.text ? checklist.buttons.failed.text : '__Text__' }}
                    </v-btn>
                    <v-dialog v-model="dialogBtnFailed.open" max-width="600">
                        <v-card>
                            <v-card-title>{{ text.failed }}</v-card-title>
                            <v-card-text>
                                <v-form ref="formBtnFailed" v-model="dialogBtnFailed.valid">
                                    <v-switch
                                        v-model="dialogBtnFailed.item.enabled"
                                        :label="text.buttonEnabled"
                                        color="primary"
                                    ></v-switch>
                                    <v-text-field
                                        v-model="dialogBtnFailed.item.text"
                                        :label="text.text"
                                        :rules="textRules"
                                        counter="15"
                                    ></v-text-field>
                                    <v-select
                                        v-model="dialogBtnFailed.item.comment"
                                        :label="text.comment"
                                        :items="templates"
                                        item-title="title"
                                        item-value="id"
                                    ></v-select>
                                    <v-switch
                                        v-model="dialogBtnFailed.item.autoComment"
                                        :label="text.sendCommentImmediately"
                                        color="primary"
                                    ></v-switch>
                                </v-form>
                            </v-card-text>
                            <v-card-actions>
                                <v-spacer></v-spacer>
                                <v-btn variant="plain" color="grey" @click="closeButtonFailedDialog">{{ text.cancel }}</v-btn>
                                <v-btn
                                    variant="plain"
                                    color="primary"
                                    :disabled="!dialogBtnFailed.valid"
                                    @click="saveButtonFailed">{{ text.save }}</v-btn>
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
                        :sort-by="[{key: 'sort', order: 'asc'}]"
                        :items-per-page=-1
                        :item-class="itemRowSortActiveClass"
                        :hide-default-footer=true
                    >
                        <template #top>
                            <v-toolbar flat>
                                <v-spacer></v-spacer>
                                <v-btn
                                    variant="plain"
                                    prepend-icon="fas fa-plus"
                                    color="primary"
                                    @click="openCategory(null)">
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
                                        :text="text"
                                        @close="closeCategory"></InnerList>
                                </v-dialog>
                                <v-dialog v-model="deleteCategory.open" max-width="450">
                                    <v-card>
                                        <v-card-title class="headline">
                                            {{ i18n.getMessage('TitleDelete', deleteCategory.title) }}
                                        </v-card-title>
                                        <v-card-actions>
                                            <v-spacer></v-spacer>
                                            <v-btn variant="plain" color="secondary" @click="closeDialogDeleteCategory">{{ text.cancel }}</v-btn>
                                            <v-btn variant="plain" color="tertiary" @click="removeCategory">{{ text.delete }}</v-btn>
                                            <v-spacer></v-spacer>
                                        </v-card-actions>
                                    </v-card>
                                </v-dialog>
                            </v-toolbar>
                        </template>
                        <template #item.actions="{item}">
                            <v-btn
                                v-if="!sortChecklist"
                                variant="plain"
                                icon="fas fa-edit"
                                small
                                @click="openCategory(item.raw.uid)"></v-btn>
                            <v-btn
                                v-if="!sortChecklist"
                                variant="plain"
                                icon="fas fa-sort"
                                size="small"
                                @click="categoryStartSort(item)"></v-btn>
                            <v-btn
                                v-if="!sortChecklist"
                                variant="plain"
                                icon="fas fa-trash"
                                size="small"
                                color="tertiary"
                                @click="openDialogDeleteCategory(item)"></v-btn>
                            <v-btn
                                v-if="sortChecklist && sortChecklist.raw.uid !== item.raw.uid"
                                variant="plain"
                                icon="fas fa-sort-up"
                                size="small"
                                :disabled="item.raw.sort - 1 === sortChecklist.raw.sort"
                                @click="categoryInsertBefore(item)"></v-btn>
                            <v-btn
                                v-if="sortChecklist && sortChecklist.raw.uid !== item.raw.uid"
                                variant="plain"
                                icon="fas fa-sort-down"
                                size="small"
                                :disabled="item.raw.sort + 1 === sortChecklist.raw.sort"
                                @click="categoryInsertAfter(item)"></v-btn>
                            <v-btn
                                v-if="sortChecklist && sortChecklist.raw.uid === item.raw.uid"
                                variant="plain"
                                icon="fas fa-times"
                                size="small"
                                @click="categoryCancelSort"> </v-btn>
                        </template>
                    </v-data-table>
                </v-col>
            </v-row>
        </v-card-text>
    </v-card>
</template>

<script>

import InnerList from './InnerList.vue'

export default {
    name: 'ChecklistsChecklist',
    components: {InnerList},
    props: {
        uuid: {
            type: String,
            required: true,
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
                {title: this.text.name, key: 'title', sortable: false},
                {title: '', key: 'actions', align: 'end', sortable: false},
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
    created() {
        this.checklist = this.$store.getters['jira/getChecklist'](this.uuid)
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
                uid: category.raw.uid,
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
                current: this.sortChecklist.raw.uid,
                ref: item.raw.uid,
            })
        },
        categoryInsertAfter: function (item) {
            this.$store.dispatch('jira/categoryMoveAfter', {
                uuid: this.uuid,
                current: this.sortChecklist.raw.uid,
                ref: item.raw.uid,
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
}
</script>
