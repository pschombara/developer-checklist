<template>
    <v-card flat class="mt-5">
        <v-card-text>
            <v-row>
                <v-col cols="4">
                    <v-switch color="primary" :model-value="modules.jenkins" @change="switchChanged('jenkins', $event)">
                        <template v-slot:label><v-icon icon="fab fa-jenkins" class="mx-2" /> Jenkins</template>
                    </v-switch>
                    <v-switch color="primary" :model-value="modules.gitLab" @change="switchChanged('gitLab', $event)">
                        <template v-slot:label><v-icon icon="fab fa-gitlab" class="mx-2" /> GitLab</template>
                    </v-switch>
                    <v-switch color="primary" :model-value="modules.chat" @change="switchChanged('chat', $event)">
                        <template v-slot:label><v-icon icon="fas fa-comments" class="mx-2" /> Chat</template>
                    </v-switch>
                    <v-switch color="primary" :model-value="modules.cheatSheet" @change="switchChanged('cheatSheet', $event)">
                        <template v-slot:label><v-icon icon="fas fa-terminal" class="mx-2" /> Cheat Sheet</template>
                    </v-switch>
<!--                    <v-switch color="primary" :model-value="modules.chrome" @change="switchChanged('chrome', $event)">
                        <template v-slot:label><v-icon icon="fab fa-chrome" class="mx-2" /> Chrome</template>
                    </v-switch>-->
                </v-col>
            </v-row>
        </v-card-text>
    </v-card>
</template>

<script>
export default {
    name: 'OptionModules',
    methods: {
        switchChanged: function (module, event) {
            this.$store.dispatch('switchModule', {module, value: event.target.checked})
        },
    },
    computed: {
        modules() {
            return this.$store.getters['modules']
        },
    },
    data() {
        return {
        }
    },
}
</script>
