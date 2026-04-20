import EventEmitter from "./EventEmitter.js"

export default class Cursor extends EventEmitter
{
    constructor() {
        super()
        //Setup
        this.cursor = { x: 0, y: 0 }

        //Resize event
        window.addEventListener('mousemove', (event) => {
            //Update sizes
            this.cursor.x = (event.clientX / window.innerWidth) - 0.5 // Mapping to -0.5 to 0.5
            this.cursor.y = (event.clientY / window.innerHeight) - 0.5 // Mapping to -0.5 to 0.5

            //Event emitter
            this.trigger('mousemove')
        })
    }
}