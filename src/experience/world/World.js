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

        // Setup
        this.sea = new Sea();
        this.Environment = new Environment();

        

        // All resources ready?
        // this.resources.on('ready', () => {
        //     //Setup

        //     this.environment = new Environment();
        // })
    }


     
}
