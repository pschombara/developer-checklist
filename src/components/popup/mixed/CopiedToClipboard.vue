<script setup>
import {ref} from 'vue'

const text = {
    close: chrome.i18n.getMessage('Close'),
    copiedToClipboard: chrome.i18n.getMessage('copiedToClipboard'),
}

const visible = ref(false)

const showMessage = () => {
    visible.value = true
}

defineExpose({
    show: showMessage,
})
</script>

<template>
    <v-snackbar
        v-model="visible"
        :timeout="2200"
    >
        <v-icon left color="success">fas fa-check</v-icon>
        {{text.copiedToClipboard}}

        <template #action="{ attrs }">
            <v-btn
                color="blue"
                variant="text"
                v-bind="attrs"
                @click="visible = false"
            >
                {{text.close}}
            </v-btn>
        </template>
    </v-snackbar>
</template>

<style scoped>

</style>
