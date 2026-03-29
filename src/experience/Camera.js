import * as THREE from 'three'
import Experience from './Experience.js'

export default class Camera {
    constructor() {
        this.experience = new Experience();
        this.sizes = this.experience.sizes;
        this.scene = this.experience.scene;
        this.canvas = this.experience.canvas;
        this.debug = this.experience.debug;

        // Camera position based on sections
        this.config = {
            hero: { x: 0, y: 8, z: 86 },
            immersive: { x: 0, y: 5, z: 20 },
            lookAt: { x: 0, y: 5, z: 0 }
        };

        this.setInstance();
        this.setDebug();
    }

    setInstance() {
        this.instance = new THREE.PerspectiveCamera(
            35,
            this.sizes.width / this.sizes.height,
            0.1,
            3000
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

    setDebug() {
        if(this.debug.active) {
            const folder = this.debug.getFolder('Camera/Position');

            // Funzione interna per aggiornare il lookAt ogni volta che muovi la camera
            const updateLookAt = () => {
                this.instance.lookAt(
                    this.config.lookAt.x, 
                    this.config.lookAt.y, 
                    this.config.lookAt.z
                );
            };

            folder.add(this.instance.position, 'x').min(-50).max(50).step(0.1).name('Pos X').onChange(updateLookAt);
            folder.add(this.instance.position, 'y').min(0).max(50).step(0.1).name('Pos Y').onChange(updateLookAt);
            folder.add(this.instance.position, 'z').min(0).max(100).step(0.1).name('Pos Z').onChange(updateLookAt);
            
            const lookAtFolder = this.debug.getFolder('Camera/LookAt');
            lookAtFolder.add(this.config.lookAt, 'y').min(-20).max(20).step(0.1).name('Target Y').onChange(updateLookAt);
        }
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