<template>
    <v-card v-if="hasPermissions" flat class="mt-5">
        <v-card-title>Tab Groups</v-card-title>
        <v-card-text>
            <v-chip-group
                v-model="activeColor"
                mandatory
            >
                <v-chip
                    v-for="color in colors"
                    :key="color"
                    :value="color"
                    :text-color="color"
                    :color="color"
                    :outlined="color !== activeColor"
                    label
                >{{ i18n.getMessage(color) }}</v-chip>
            </v-chip-group>
            <v-card v-for="color in colors" v-show="color === activeColor" :key="color">
                <v-card-text>

                </v-card-text>
            </v-card>
        </v-card-text>
    </v-card>
    <v-card v-else>
        <v-card-text>
            <v-row>
                <v-col><v-icon icon="fas fa-lock"/></v-col>
                <v-col></v-col>
            </v-row>
        </v-card-text>
        <v-card-actions>
            <v-btn @click="requestPermissions">Unlock</v-btn>
        </v-card-actions>
    </v-card>
</template>

<script>

export default {
    name: 'OptionChrome',
    data() {
        return {
            hasPermissions: false,
            activeColor: null,
            i18n: chrome.i18n,
        }
    },
    computed: {
        tabGroups() {
            return this.$store.getters['chromeBrowser/getTabGroups']
        },
        colors() {
            return Object.keys(this.$store.getters['chromeBrowser/getTabGroups'])
        },
    },
    created() {
        chrome.permissions.contains({
            permissions: ['tabGroups'],
        }, granted => {
            this.hasPermissions = granted
        })
    },
    methods: {
        requestPermissions: function () {
            chrome.permissions.request({
                permissions: ['tabGroups'],
            }, granted => {
                this.hasPermissions = granted
            })
        },
        todo: () => {
            for (let color of Object.values(chrome.tabGroups.Color)) {
                chrome.tabGroups.query({
                    color: color,
                    windowId: chrome.windows.WINDOW_ID_CURRENT,
                }, group => {
                    if (0 === group.length) {
                        chrome.tabs.create({}, tab => {
                            chrome.tabs.group({tabIds: [tab.id]}, groupId => {
                                chrome.tabGroups.update(groupId, {
                                    color: color,
                                    title: `test${color}`,
                                })
                            })
                        })
                    }
                })
            }
        },
    },
}
</script>
