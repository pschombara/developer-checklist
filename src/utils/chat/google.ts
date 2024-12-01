export class Google {
    static format(msg: string, issues: string[], jiraUrl: string, name: string) {
        let formattedMessage = {
            text: msg,
        }

        if (issues.length > 0) {
            formattedMessage.cardsV2 = [
                {
                    cardId: 'checklist-' + Date.now(),
                    card: {
                        header: {
                            title: 'Issues',
                        },
                        sections: [
                            {
                                widgets: [
                                    {
                                        buttonList: {
                                            buttons: [],
                                        },
                                    },
                                ],
                            },
                        ],
                    },
                },
            ]
        }

        if ('' !== name) {
            formattedMessage.cardsV2[0].card.header.title = 'Issues (' + name + ')'
            formattedMessage.sender = {
                name: 'users/app',
                displayName: name + ' (Checklist)',
            }
        }

        for (let issue of issues) {
            formattedMessage.cardsV2[0].card.sections[0].widgets[0].buttonList.buttons.push(
                {
                    text: issue,
                    onClick: {
                        openLink: {
                            url: `${jiraUrl}/browse/${issue}`,
                        },
                    },
                },
            )
        }

        return JSON.stringify(formattedMessage)
    }
}
