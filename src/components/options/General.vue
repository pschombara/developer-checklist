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
<!--                    <v-switch color="primary" :model-value="modules.chrome" @change="switchChanged('chrome', $event)">
                        <template v-slot:label><v-icon icon="fab fa-chrome" class="mx-2" /> Chrome</template>
                    </v-switch>-->
                </v-col>
                <v-col cols="4">
                    <h3>Theme</h3>
                    <v-select
                        v-model="themeSchema"
                        label="Brightness"
                        :items="['system', 'light', 'dark']"
                        variant="underlined"
                        class="mt-3"
                    ></v-select>
                    <v-select
                        v-model="themeColor"
                        label="Color"
                        :items="['blue', 'orange', 'green', 'yellow']"
                        variant="underlined"
                        class="mt-2"
                    ></v-select>
                </v-col>
            </v-row>
        </v-card-text>
    </v-card>
</template>

<script>
export default {
    name: 'OptionGeneral',
    emits: ['themeSchemaChanged', 'themeColorChanged'],
    computed: {
        modules() {
            return this.$store.getters['modules']
        },
        themeSchema: {
            get() {
                return this.$store.getters['themeSchema']
            },
            set(value) {
                this.$store.dispatch('changeThemeSchema', value)
                this.$emit('themeSchemaChanged', value)
            },
        },
        themeColor: {
            get() {
                return this.$store.getters['themeColor']
            },
            set(value) {
                this.$store.dispatch('changeThemeColor', value)
                this.$emit('themeColorChanged', value)
            },
        },
    },
    methods: {
        switchChanged: function (module, event) {
            this.$store.dispatch('switchModule', {module, value: event.target.checked})
        },
    },
}
</script>
