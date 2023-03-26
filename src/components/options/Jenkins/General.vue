<template>
    <v-card flat class="ml-5">
        <v-card-title>{{ text.general }}</v-card-title>
        <v-card-text>
            <v-text-field v-model="host" :label="text.host" :rules="hostRules" clearable clear-icon="fas fa-times"></v-text-field>
        </v-card-text>
    </v-card>
</template>

<script>

import Helper from '../../../mixins/helper'

export default {
    name: 'JenkinsGeneral',
    data() {
        return {
            hostRules: [
                value => Helper.isURL(value) || chrome.i18n.getMessage('errUrlInvalid'),
            ],
            i18n: chrome.i18n,
            text: {
                host: chrome.i18n.getMessage('Host'),
                categories: chrome.i18n.getMessage('Categories'),
                builds: chrome.i18n.getMessage('Builds'),
                general: chrome.i18n.getMessage('General'),
            },
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
    },
}
</script>
