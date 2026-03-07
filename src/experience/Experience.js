import * as THREE from 'three';
import Debug from '../utils/Debug.js';
import Sizes from '../utils/Sizes.js';
import Time from '../utils/Time.js';
import Camera from './Camera.js'; 
import Renderer from './Renderer.js';

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
        this.sizes = new Sizes();
        this.time = new Time();
        this.scene = new THREE.Scene();
        this.camera = new Camera();
        this.renderer = new Renderer();
        

        // Placeholder Mesh (Sostituiremo con Sea e Ship)
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshStandardMaterial({ color: 0x00ff00, wireframe: true });
        this.mesh = new THREE.Mesh(geometry, material);
        this.scene.add(this.mesh);

        this.sunLight = new THREE.DirectionalLight('#ffffff', 4)
        this.sunLight.position.set(3, 5, 5)
        this.scene.add(this.sunLight)

        this.ambientLight = new THREE.AmbientLight('#ffffff', 0.5)
        this.scene.add(this.ambientLight)


        console.log(this.renderer);
        
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
        this.camera.update()
        this.renderer.update()
    }
}