import * as THREE from 'three'
import Experience from './Experience.js'

export default class Camera {
    constructor() {
        this.experience = new Experience();
        this.sizes = this.experience.sizes;
        this.scene = this.experience.scene;
        this.canvas = this.experience.canvas;

        // Camera position based on sections
        this.config = {
            hero: { x: 0, y: 3, z: 12 },
            immersive: { x: 0, y: 5, z: 20 },
            lookAt: { x: 0, y: 0, z: 0 }
        };

        this.setInstance();
    }

    setInstance() {
        this.instance = new THREE.PerspectiveCamera(
            35,
            this.sizes.width / this.sizes.height,
            0.1,
            1000
        );

        this.instance.position.set(
            this.config.hero.x, 
            this.config.hero.y, 
            this.config.hero.z
        );

        this.instance.lookAt(
            this.config.lookAt.x, 
            this.config.lookAt.y, 
            this.config.lookAt.z
        );

        this.scene.add(this.instance);
    }

    setPosition(x, y, z) {
        this.instance.position.set(x, y, z);
    }

    /*
    * Event Manager
    */

    resize() {
        this.instance.aspect = this.sizes.width / this.sizes.height
        this.instance.updateProjectionMatrix()
    }

    update() {
        // Update
    }
}