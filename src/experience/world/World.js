// import * as THREE from 'three'
import Experience from "../Experience.js";
import Environment from "./Environment.js";
import Sea from "./Sea.js";
import Ship from "./Ship.js";

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
            this.environment = new Environment();
            this.sea = new Sea();
            this.ship = new Ship();
        })
    }

    update() {
        if (this.sea) {
            this.sea.update();
        }
        if (this.ship) {
            this.ship.update();
        }
    }
}
