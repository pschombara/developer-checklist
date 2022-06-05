<template>
    <v-card flat class="mt-5">
        <v-card-text>
            <v-row>
                <v-col cols="12">
                    <v-switch :value="modules.jenkins" @change="switchChanged('jenkins', $event)">
                        <template v-slot:label><v-icon class="mx-2">fab fa-jenkins</v-icon> Jenkins</template>
                    </v-switch>
                    <v-switch :value="modules.gitLab" @change="switchChanged('gitLab', $event)">
                        <template v-slot:label><v-icon class="mx-2">fab fa-gitlab</v-icon> GitLab</template>
                    </v-switch>
                    <v-switch :value="modules.chat" @change="switchChanged('chat', $event)">
                        <template v-slot:label><v-icon class="mx-2">fas fa-comments</v-icon> Chat</template>
                    </v-switch>
                    <v-switch :value="modules.cheatSheet" @change="switchChanged('cheatSheet', $event)">
                        <template v-slot:label><v-icon class="mx-2">fas fa-terminal</v-icon> Cheat Sheet</template>
                    </v-switch>
<!--                    <v-switch :value="modules.chrome" @change="switchChanged('chrome', $event)">
                        <template v-slot:label><v-icon class="mx-2">fab fa-chrome</v-icon> Chrome</template>
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
        switchChanged: function (module, value) {
            this.$store.dispatch('switchModule', {module, value})
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
