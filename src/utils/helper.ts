import _ from 'lodash'

export default class Helper {
    static isURL(str: string, startsWith:string|null = null) {
        if ('' === str) {
            return true
        }

        let url

        try {
            url = new URL(str)
        } catch (_) {
            return false
        }

        if (null !== startsWith) {
            return str.startsWith(startsWith)
        }

        return 'http:' === url.protocol || 'https:' === url.protocol
    }

    static sortBefore(list, item, ref, key) {
        let previousSort = item.sort
        let refSort = ref.sort

        for (let listItem of list) {
            if (listItem.sort >= refSort && listItem.sort < previousSort && listItem[key] !== item[key]) {
                ++listItem.sort
            } else if (item[key] === listItem[key]) {
                listItem.sort = refSort
            }
        }

        this.resort(list)
    }

    static sortAfter(list, item, ref, key) {
        let previousSort = item.sort
        let refSort = ref.sort

        for (let listItem of list) {
            if (listItem.sort > previousSort && listItem.sort <= refSort && listItem[key] !== item[key]) {
                --listItem.sort
            } else if (item[key] === listItem[key]) {
                listItem.sort = refSort
            }
        }

        this.resort(list)
    }

    static resort(list) {
        let index = 0

        list = _.sortBy(list, ['sort'])

        for (let entry of list) {
            entry.sort = index++
        }

        return list
    }

    static localeDate(timestamp) {
        let date = new Date(timestamp * 1000)

        return date.toLocaleString(
            browser.i18n.getUILanguage(),
            {day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit'},
        )
    }
}
