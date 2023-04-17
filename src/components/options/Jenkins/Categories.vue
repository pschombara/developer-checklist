<template>
    <v-card flat class="ml-5">
        <v-card-title>{{ text.categories }}</v-card-title>
        <v-card-text>
            <v-data-table
                :headers="categoriesHeader"
                :items="categories"
                :search="searchCategory"
                :sort-by="[{key: 'name', order: 'asc'}]"
            >
                <template #top>
                    <v-toolbar flat>
                        <v-text-field
                            v-model="searchCategory"
                            prepend-icon="fas fa-search"
                            clear-icon="fas fa-times"
                            :label="text.search"
                            single-line
                            hide-details
                            clearable
                        ></v-text-field>
                        <v-spacer></v-spacer>
                        <v-btn
                            variant="plain"
                            prepend-icon="fas fa-plus"
                            color="primary"
                            @click="openNewCategory">{{text.add}}</v-btn>
                        <v-dialog v-model="dialogCategory.open" max-width="450">
                            <v-card>
                                <v-card-title>{{ dialogCategory.title }}</v-card-title>
                                <v-card-text>
                                    <v-form ref="categoryForm" v-model="dialogCategory.valid">
                                        <v-text-field
                                            v-model="dialogCategory.item.name"
                                            :rules="categoryRules"
                                            :label="text.name"
                                        ></v-text-field>
                                    </v-form>
                                </v-card-text>
                                <v-card-actions>
                                    <v-spacer></v-spacer>
                                    <v-btn color="secondary" plain @click="closeDialogCategory">{{ text.cancel }}</v-btn>
                                    <v-btn v-if="null === dialogCategory.current" color="primary" plain :disabled="!dialogCategory.valid" @click="addCategory">{{ text.add }}</v-btn>
                                    <v-btn v-else color="primary" plain :disabled="!dialogCategory.valid" @click="saveCategory">{{ text.save }}</v-btn>
                                    <v-spacer></v-spacer>
                                </v-card-actions>
                            </v-card>
                        </v-dialog>
                        <v-dialog v-model="dialogDeleteCategory" max-width="450">
                            <v-card>
                                <v-card-title class="headline">{{ i18n.getMessage('TitleDelete', deleteCategory.name) }}</v-card-title>
                                <v-card-text>{{ text.subTitleDeleteCategory }}</v-card-text>
                                <v-card-actions>
                                    <v-spacer></v-spacer>
                                    <v-btn color="secondary" plain @click="closeDialogDeleteCategory()">
                                        {{ text.cancel }}</v-btn>
                                    <v-btn color="tertiary" plain @click="removeCategory(deleteCategory)">
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
                        @click="openCategory(item)">
                    </v-btn>
                    <v-btn
                        variant="plain"
                        icon="fas fa-trash"
                        size="small"
                        color="tertiary"
                        @click="openDialogDeleteCategory(item)">
                    </v-btn>
                </template>
            </v-data-table>
        </v-card-text>
    </v-card>
</template>

<script>

import Helper from '../../../mixins/helper'

export default {
    name: 'JenkinsCategories',
    data() {
        return {
            i18n: chrome.i18n,
            text: {
                categories: chrome.i18n.getMessage('Categories'),
                category: chrome.i18n.getMessage('Category'),
                newCategory: chrome.i18n.getMessage('NewCategory'),
                search: chrome.i18n.getMessage('Search'),
                add: chrome.i18n.getMessage('Add'),
                save: chrome.i18n.getMessage('Save'),
                cancel: chrome.i18n.getMessage('Cancel'),
                delete: chrome.i18n.getMessage('Delete'),
                label: chrome.i18n.getMessage('Label'),
                name: chrome.i18n.getMessage('Name'),
            },
            categoryRules: [
                value => !!value || chrome.i18n.getMessage('errNotBlank'),
                value => false === this.checkCategoryDuplicated(value) || chrome.i18n.getMessage('errDuplicated'),
            ],
            searchCategory: '',
            dialogDeleteCategory: false,
            dialogCategory: {
                open: false,
                title: '',
                valid: false,
                current: null,
                item: {
                    name: '',
                },
            },
            defaultCategory: {
                name: '',
            },
            deleteCategory: {},
        }
    },
    computed: {
        host: {
            get() {
                return this.$store.getters['jenkins/getHost']
            },
            set(value) {
                if (null === value || Helper.isURL(value)) {
                    this.$store.dispatch('jenkins/updateHost', value ?? '')
                }
            },
        },
        categories() {
            return this.$store.getters['jenkins/getCategories']
        },
        categoriesHeader() {
            return [
                { title: this.text.category, key: 'name' },
                { title: '', key: 'actions', sortable: false, align:'end' },
            ]
        },
    },
    methods: {
        openCategory: function (category) {
            this.dialogCategory = {
                open: true,
                title: this.i18n.getMessage('TitleUpdate', category.name),
                valid: true,
                current: category,
                item: Object.assign({}, category),
            }
        },
        openNewCategory: function () {
            this.dialogCategory = {
                open: true,
                title: this.text.newCategory,
                valid: false,
                current: null,
                item: Object.assign({}, this.defaultCategory),
            }
        },
        closeDialogCategory: function () {
            this.dialogCategory.open = false
            this.dialogCategory.current = null
        },
        saveCategory: function () {
            if (this.$refs.categoryForm.validate()) {
                this.$store.dispatch(
                    'jenkins/updateCategory',
                    {
                        previousName: this.dialogCategory.current.name,
                        newName: this.dialogCategory.item.name,
                    },
                )
            }

            this.closeDialogCategory()
        },
        addCategory: function () {
            if (this.$refs.categoryForm.validate()) {
                this.$store.dispatch('jenkins/addCategory', this.dialogCategory.item.name)
            }

            this.closeDialogCategory()
        },
        openDialogDeleteCategory: function (category) {
            this.dialogDeleteCategory = true
            this.deleteCategory = Object.assign({}, category)
        },
        removeCategory: function (category) {
            this.$store.dispatch('jenkins/removeCategory', category.name)
            this.closeDialogDeleteCategory()
        },
        closeDialogDeleteCategory: function () {
            this.dialogDeleteCategory = false
            this.deleteCategory = {}
        },
        checkCategoryDuplicated: function (value) {
            if (false === this.$store.getters['jenkins/getCategoryNames'].map(x => x.toLowerCase()).includes(value.toLowerCase())) {
                return false
            }

            if (null === this.dialogCategory.current) {
                return true
            }

            return value !== this.dialogCategory.current.name
        },
    },
}
</script>
