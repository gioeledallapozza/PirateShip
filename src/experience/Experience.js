import * as THREE from 'three';
import Debug from '../utils/Debug.js';
import Statistic from '../utils/Statistic.js'
import Sizes from '../utils/Sizes.js';
import Time from '../utils/Time.js';
import Cursor from '../utils/Cursor.js';
import Camera from './Camera.js'; 
import Renderer from './Renderer.js';
import World from './world/World.js';
import Resources from "../utils/Resources.js";
import gsap from 'gsap';

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
        this.cursor = new Cursor();
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

    //Start experience
    start() {

        //Calculate center of the ship
        const shipBox = new THREE.Box3().setFromObject(this.world.ship.model)
        const shipCenter = new THREE.Vector3()
        shipBox.getCenter(shipCenter)
        shipCenter.y -= 5 

       gsap.to(this.camera.instance.position, {
            duration: 3,
            x: this.camera.params.immersive.x,
            y: this.camera.params.immersive.y,
            z: this.camera.params.immersive.z,
            ease: "power2.inOut"
        })

        gsap.to(this.camera.controls.target, {
            duration: 3,
            x: shipCenter.x,
            y: shipCenter.y,
            z: shipCenter.z,
            ease: "power2.inOut",
            onComplete: () => {
                this.camera.controls.maxDistance = 50
                this.camera.controls.enabled = true

                this.world.hotpoints.activate();
            }
        })
    }

    /**
     * Event Manager
     */
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