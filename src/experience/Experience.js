import * as THREE from 'three';
import Debug from '../utils/Debug.js';
import Statistic from '../utils/Statistic.js'
import Sizes from '../utils/Sizes.js';
import Time from '../utils/Time.js';
import Camera from './Camera.js'; 
import Renderer from './Renderer.js';
import World from './world/World.js';
import Resources from "../utils/Resources.js";

let instance = null;

export default class Experience {
    constructor(canvas) {
        // Singleton
        if (instance) return instance;
        instance = this;

        // Options
        this.canvas = canvas;

        // Setup
        this.debug = new Debug();
        this.statistics = new Statistic();
        this.resources = new Resources();
        this.sizes = new Sizes();
        this.time = new Time();
        this.scene = new THREE.Scene();
        this.camera = new Camera();
        this.renderer = new Renderer();
        this.world = new World();

        
        /*
        * Event Manager
        */
        this.sizes.on('resize', () => {
            this.resize()
        })

        this.time.on('tick', () => {
            this.update()
        })
    }

    resize() {
        this.camera.resize()
        this.renderer.resize()
    }

    update() {
        this.statistics.begin()
        this.camera.update()

        this.world.update();

        this.renderer.update()
        this.statistics.end()
    }
}