import Stats from 'stats.js'
import Experience from '../experience/Experience.js'

export default class Statistic {
    constructor() {
        this.experience = new Experience();
        this.debug = this.experience.debug
        this.active = this.debug.active

        if (this.active) {
            this.instance = new Stats()
            this.instance.showPanel(0) // 0: fps, 1: ms, 2: mb
            document.body.appendChild(this.instance.dom)
        }
    }

    begin() {
        if (this.active) this.instance.begin()
    }

    end() {
        if (this.active) this.instance.end()
    }
}