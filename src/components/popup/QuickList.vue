<template>
    <v-card>
        <v-card-text>
            <v-row>
                <v-col><h3>{{ text.open }}</h3></v-col>
            </v-row>
            <v-row class="d-flex align-center mt-0">
                <v-col cols="5">
                    <v-combobox v-model="board" :items="boards"></v-combobox>
                </v-col>
                <v-col cols="5">
                    <v-text-field
                        v-model="issueNumber"
                        type="number"
                        min="1"
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
                        <v-btn :color="buttonColor(issue)" block>
                            {{issue.name}}
                        </v-btn>
                    </v-col>
                </template>
            </v-row>


<!--            <v-data-iterator
                :items="issues"
                :items-per-page="maximumIssues"
                :sort-by="['pinned', 'updateDate']"
                :sort-desc="[true, true]"
                multi-sort
                hide-default-footer
            >
                <template v-slot:default="props">
                    <v-row class="mt-3">
                        <v-col
                            cols="4"
                            v-for="issue in props.items"
                            :key="issue.name"
                        >
                            <v-tooltip top>
                                <template v-slot:activator="{props}">
                                    <v-btn
                                        :color="buttonColor(issue)"
                                        v-bind="props"
                                        @click="openIssue(issue.name)"
                                        block
                                    >{{ issue.name }}
                                    </v-btn>
                                </template>
                                <span class="success&#45;&#45;text" v-if="issue.pinned">{{ text.pinned }}: </span>
                                <span>{{ issue.title }}</span>
                            </v-tooltip>
                        </v-col>
                    </v-row>
                </template>
            </v-data-iterator>-->
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
            return  this.$store.getters['issues/list']
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
