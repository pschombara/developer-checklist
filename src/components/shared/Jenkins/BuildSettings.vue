<script setup>
import {useJenkinsStorage} from '../../../stores/jenkins.ts'
import {computed, ref} from 'vue'

const jenkinsStore = useJenkinsStorage()

const props = defineProps({
    build: {
        type: Object,
        required: true,
    },
    create: {
        type: Boolean,
        required: true,
    },
})

const emits = defineEmits(['close'])

const i18n = browser.i18n

const text = {
    cancel: i18n.getMessage('Cancel'),
    label: i18n.getMessage('Label'),
    name: i18n.getMessage('Name'),
    job: i18n.getMessage('Job'),
    add: i18n.getMessage('Add'),
    save: i18n.getMessage('Save'),
    newBuild: i18n.getMessage('NewBuild'),
}

const categories = computed(() => {
    return jenkinsStore.getCategories
})

const buildNameRules = [
    value => !!value || i18n.getMessage('errNotBlank'),
    value => false === checkBuildDuplicated(value) || i18n.getMessage('errDuplicated'),
]

const buildJobRules = [
    value => !!value || i18n.getMessage('errNotBlank'),
]

const buildTypeRules = [
    value => !!value || i18n.getMessage('errNotBlank'),
]

const buildData = ref(props.build)

const saveBuild = async event => {
    const result = await event

    if (false === result.valid) {
        return
    }

    if (null === buildData.value.uuid) {
        jenkinsStore.addBuild(
            buildData.value.type,
            buildData.value.job,
            buildData.value.label,
            buildData.value.name,
        )
    } else {
        jenkinsStore.updateBuild(
            buildData.value.uuid,
            buildData.value.type,
            buildData.value.job,
            buildData.value.label,
            buildData.value.name,
        )
    }

    emits('close')
}

const checkBuildDuplicated = value => {
    if (null === value) {
        return false
    }

    const search = jenkinsStore.getBuilds.find(build => build.type === buildData.value.type && build.name.toLowerCase() === buildData.value.name.toLowerCase())

    if (undefined === search) {
        return false
    }

    if (props.create) {
        return true
    }

    return search.uuid !== buildData.value.uuid || props.build.uuid !== buildData.value.uuid
}
</script>

<template>
    <v-form
        validate-on="submit"
        @submit.prevent="saveBuild"
    >
        <v-card>
            <v-card-title>{{ create ? text.newBuild : i18n.getMessage('TitleUpdate', build.name) }}</v-card-title>
            <v-card-text>
                <v-autocomplete
                    v-model="buildData.type"
                    :items="categories"
                    :rules="buildTypeRules"
                    :label="text.category"
                    item-title="name"
                    item-value="name"
                ></v-autocomplete>
                <v-text-field
                    v-model="buildData.name"
                    :rules="buildNameRules"
                    :label="text.name"
                ></v-text-field>
                <v-text-field
                    v-model="buildData.label"
                    :label="text.label"
                ></v-text-field>
                <v-text-field
                    v-model="buildData.job"
                    :rules="buildJobRules"
                    :label="text.job"
                ></v-text-field>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="secondary" variant="plain" @click="$emit('close')">{{ text.cancel }}</v-btn>
                <v-btn
                    type="submit"
                    color="primary"
                    variant="plain">{{ create ? text.add : text.save }}
                </v-btn>
                <v-spacer></v-spacer>
            </v-card-actions>
        </v-card>
    </v-form>
</template>

<style scoped>

</style>
