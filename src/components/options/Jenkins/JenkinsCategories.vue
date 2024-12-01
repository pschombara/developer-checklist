<script lang="ts" setup>

import {computed, ref} from 'vue'
import {useJenkinsStorage} from '@/stores/jenkins.ts'

const i18n = browser.i18n
const jenkinsStorage = useJenkinsStorage()

const text = {
    categories: i18n.getMessage('Categories'),
    category: i18n.getMessage('Category'),
    newCategory: i18n.getMessage('NewCategory'),
    search: i18n.getMessage('Search'),
    add: i18n.getMessage('Add'),
    save: i18n.getMessage('Save'),
    cancel: i18n.getMessage('Cancel'),
    delete: i18n.getMessage('Delete'),
    label: i18n.getMessage('Label'),
    name: i18n.getMessage('Name'),
    subTitleDeleteCategory: i18n.getMessage('SubTitleDeleteCategory')
}

const categoryRules = [
    value => !!value || i18n.getMessage('errNotBlank'),
    value => false === checkCategoryDuplicated(value) || i18n.getMessage('errDuplicated'),
]

const defaultCategory = {name: ''}
const searchCategory = ref('')
const dialogDeleteCategory = ref(false)
const deleteCategory = ref({})
const dialogCategory = ref({
    open: false,
    title: '',
    current: null,
    item: {...defaultCategory},
    saveButton: '',
})

const categoriesHeader = [
    { title: text.category, key: 'name' },
    { title: '', key: 'actions', sortable: false, align:'end' },
]

const categories = computed(() => {
    return jenkinsStorage.categories.map(category => {
        return {name: category}
    })
})

const openCategory = category => {
    dialogCategory.value = {
        open: true,
        title: i18n.getMessage('TitleUpdate', category.name),
        current: category,
        item: {...category},
        saveButton: text.save,
    }
}

const openNewCategory = () => {
    dialogCategory.value = {
        open: true,
        title: text.newCategory,
        current: null,
        item: {...defaultCategory},
        saveButton: text.add,
    }
}

const closeDialogCategory = () => {
    dialogCategory.value.open = false
    dialogCategory.value.current = null
}

const saveCategory = async event => {
    const result = await event

    if (false === result.valid) {
        return
    }

    if (null === dialogCategory.value.current) {
        jenkinsStorage.addCategory(dialogCategory.value.item.name)
    } else {
        jenkinsStorage.renameCategory(defaultCategory.value.current.name, dialogCategory.value.item.name)
    }

    closeDialogCategory()
}

const openDialogDeleteCategory = category => {
    dialogDeleteCategory.value = true
    deleteCategory.value = {...category}
}

const removeCategory = category => {
    jenkinsStorage.removeCategory(category.name)
    closeDialogDeleteCategory()
}

const closeDialogDeleteCategory = () => {
    dialogDeleteCategory.value = false
    deleteCategory.value = {}
}

const checkCategoryDuplicated = value => {
    if (false === jenkinsStorage.getCategories.map(x => x.toLowerCase()).includes(value.toLowerCase())) {
        return false
    }

    if (null === dialogCategory.value.current) {
        return true
    }

    return value !== dialogCategory.value.current.name
}
</script>

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
                        <v-toolbar-title>
                            <v-text-field
                                v-model="searchCategory"
                                prepend-icon="fas fa-search"
                                clear-icon="fas fa-times"
                                :label="text.search"
                                single-line
                                hide-details
                                clearable
                            ></v-text-field>
                        </v-toolbar-title>

                        <v-spacer></v-spacer>
                        <v-btn
                            variant="plain"
                            prepend-icon="fas fa-plus"
                            color="primary"
                            @click="openNewCategory">{{text.add}}</v-btn>
                        <v-dialog v-model="dialogCategory.open" max-width="450">
                            <v-form
                                validate-on="input"
                                @submit.prevent="saveCategory">
                                <v-card>
                                    <v-card-title>{{ dialogCategory.title }}</v-card-title>
                                    <v-card-text>
                                            <v-text-field
                                                v-model="dialogCategory.item.name"
                                                :rules="categoryRules"
                                                :label="text.name"
                                            ></v-text-field>
                                    </v-card-text>
                                    <v-card-actions>
                                        <v-spacer></v-spacer>
                                        <v-btn color="secondary" plain @click="closeDialogCategory">{{ text.cancel }}</v-btn>
                                        <v-btn
                                            type="submit"
                                            color="primary"
                                            variant="plain">{{ dialogCategory.saveButton }}</v-btn>
                                        <v-spacer></v-spacer>
                                    </v-card-actions>
                                </v-card>
                            </v-form>
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
