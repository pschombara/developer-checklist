export default class Debounce {
    constructor(time = 1000) {
        this.timer = null
        this.time = time
    }

    debounce(callback, ...args) {
        if (null !== this.timer) {
            clearTimeout(this.timer)
        }

        this.timer = setTimeout(() => callback(args), this.time)
    }
}
