<template>
    <v-card>
        <v-card-text>
            <v-row>
                <v-col><h3>{{ text.open }}</h3></v-col>
            </v-row>
            <v-row class="d-flex align-center mt-0">
                <v-col cols="5">
                    <v-combobox v-model="board" :items="boards" variant="underlined"></v-combobox>
                </v-col>
                <v-col cols="5">
                    <v-text-field
                        v-model="issueNumber"
                        type="number"
                        min="1"
                        variant="underlined"
                        autofocus
                        @keypress.enter="open"
                    ></v-text-field>
                </v-col>
                <v-col cols="2">
                    <v-btn color="primary" :disabled="!checkButtonEnabled()" @click="open">GO</v-btn>
                </v-col>
            </v-row>
            <v-row v-if="maximumIssues > 0 && issues.length > 0">
                <v-col><h3>{{text.lastOpened}}</h3></v-col>
            </v-row>
            <v-row  class="mt-3">
                <template v-for="issue in issues" :key="issue.id">
                    <v-col cols="4">
                        <v-btn :color="buttonColor(issue)" block @click="openIssue(issue.name)">
                            {{issue.name}}
                        </v-btn>
                    </v-col>
                </template>
            </v-row>
        </v-card-text>
    </v-card>
</template>

<script>

export default {
    name: 'PopupQuickList',
    data() {
        return {
            boards: [],
            board: '',
            jiraUrl: '',
            text: {
                lastOpened: chrome.i18n.getMessage('lastOpenedIssues'),
                open: chrome.i18n.getMessage('openIssue'),
                pinned: chrome.i18n.getMessage('pinned'),
            },
            issueNumber: null,
        }
    },
    computed: {
        issues() {
            let issues = [...this.$store.getters['issues/list']] // create copy to not adjust original
            const maximum = this.$store.getters['jira/getMaximumIssues']

            issues = issues.sort((a, b) => {
                if (a.pinned !== b.pinned) {
                    return a.pinned ? -1 : 1
                }

                return a.updateDate > b.updateDate ? -1 : 1
            })

            return issues.slice(0, maximum)
        },
        maximumIssues() {
            return this.$store.getters['jira/getMaximumIssues']
        },
    },
    created() {
        const boards = this.$store.getters['jira/getBoards']

        for (let board of boards) {
            this.boards.push(board.key)

            if (board.default) {
                this.board = board.key
            }
        }

        this.jiraUrl = this.$store.getters['jira/getUrl']
    },
    methods: {
        openIssue: function (issueNumber) {
            chrome.tabs.create({url: `${this.jiraUrl}/browse/${issueNumber}`})
        },
        checkButtonEnabled: function () {
            return null !== this.issueNumber
                && '' !== this.issueNumber
                && '' !== this.board
                && this.boards.includes(this.board)
        },
        open: function () {
            if (false === this.checkButtonEnabled()) {
                return
            }

            this.openIssue(`${this.board}-${this.issueNumber}`)
        },
        buttonColor: function (item) {
            return item.pinned ? 'primary' : 'secondary'
        },
    },
}
</script>
