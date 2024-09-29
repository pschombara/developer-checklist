<script setup>

import {computed} from 'vue'
import {useMainStorage} from '../../stores/mainStorage.js'

defineEmits(['themeSchemaChanged', 'themeColorChanged'])

const mainStorage = useMainStorage()

const themeSchema = computed({
    get: () => mainStorage.getThemeSchema,
    set: (value) => mainStorage.setThemeSchema(value),
})
const themeColor = computed({
    get: () => mainStorage.getThemeColor,
    set: (value) => mainStorage.setThemeColor(value),
})
const modules = computed(() => mainStorage.getModules)

const switchChanged = (modul, event) => {
    mainStorage.switchModule(modul, event.target.checked)
}

</script>

<template>
    <v-card flat class="mt-5">
        <v-card-text>
            <v-row>
                <v-col cols="4">
                    <h3>Module</h3>
                    <v-switch color="primary" :model-value="modules.jenkins" @change="switchChanged('jenkins', $event)">
                        <template #label><v-icon icon="fab fa-jenkins" class="mx-2" /> Jenkins</template>
                    </v-switch>
                    <v-switch color="primary" :model-value="modules.gitLab" @change="switchChanged('gitLab', $event)">
                        <template #label><v-icon icon="fab fa-gitlab" class="mx-2" /> GitLab</template>
                    </v-switch>
                    <v-switch color="primary" :model-value="modules.chat" @change="switchChanged('chat', $event)">
                        <template #label><v-icon icon="fas fa-comments" class="mx-2" /> Chat</template>
                    </v-switch>
                    <v-switch color="primary" :model-value="modules.cheatSheet" @change="switchChanged('cheatSheet', $event)">
                        <template #label><v-icon icon="fas fa-terminal" class="mx-2" /> Cheat Sheet</template>
                    </v-switch>
                </v-col>
                <v-col cols="4">
                    <h3>Theme</h3>
                    <v-select
                        v-model="themeSchema"
                        label="Brightness"
                        :items="['system', 'light', 'dark']"
                        variant="underlined"
                        class="mt-3"
                        @update:model-value="$emit('themeSchemaChanged')"
                    ></v-select>
                    <v-select
                        v-model="themeColor"
                        label="Color"
                        :items="['blue', 'orange', 'green', 'yellow']"
                        variant="underlined"
                        class="mt-2"
                        @update:model-value="$emit('themeColorChanged')"
                    ></v-select>
                </v-col>
            </v-row>
        </v-card-text>
    </v-card>
</template>
