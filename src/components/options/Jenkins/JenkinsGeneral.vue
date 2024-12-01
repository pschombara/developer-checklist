<script lang="ts" setup>

import Helper from '@/utils/helper'
import {computed} from 'vue'
import {useJenkinsStorage} from '@/stores/jenkins.ts'

const i18n = browser.i18n

const text = {
    host: i18n.getMessage('Host'),
    categories: i18n.getMessage('Categories'),
    builds: i18n.getMessage('Builds'),
    general: i18n.getMessage('General'),
}

const hostRules = [
    value => Helper.isURL(value) || i18n.getMessage('errUrlInvalid'),
]

const jenkinsStorage = useJenkinsStorage()

const host = computed({
    get() {
        return jenkinsStorage.getHost
    },
    set(value) {
        if (null === value || Helper.isURL(value)) {
            jenkinsStorage.updateHost(value ?? '')
        }
    },
})
</script>
<template>
    <v-card flat class="ml-5">
        <v-card-title>{{ text.general }}</v-card-title>
        <v-card-text>
            <v-text-field v-model="host" :label="text.host" :rules="hostRules" clearable clear-icon="fas fa-times"></v-text-field>
        </v-card-text>
    </v-card>
</template>
