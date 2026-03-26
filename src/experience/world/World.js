// import * as THREE from 'three'
import Experience from "../Experience.js";
import Environment from "./Environment.js";
import Sea from "./Sea.js";


export default class World{
    constructor() {
        this.experience = new Experience();
        this.debug = this.experience.debug;
        this.scene = this.experience.scene;
        this.resources = this.experience.resources;

        //Debug
        this.debugFolder = this.debug.getFolder('World');

        // Event Manager
        this.resources.on('ready', () => {
            this.sea = new Sea();
            this.environment = new Environment();
        })
    }


    update() {
        if (this.sea) {
            this.sea.update();
        }
    }
}
