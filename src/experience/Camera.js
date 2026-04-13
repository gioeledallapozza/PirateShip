import * as THREE from 'three'
import Experience from './Experience.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

export default class Camera {
    constructor() {
        this.experience = new Experience();
        this.sizes = this.experience.sizes;
        this.scene = this.experience.scene;
        this.canvas = this.experience.canvas;
        this.debug = this.experience.debug;

        // Camera position based on sections
        this.params = {
            hero: { x: 0, y: 8, z: 86 },
            immersive: { x: -4.5, y: 10, z: 51 },
            lookAt: { x: 0, y: 5, z: 0 },

            hFov: 85
        };

        this.setInstance();
        this.setControls();
        this.setDebug();
        this.resize();
    }

    setInstance() {
        this.instance = new THREE.PerspectiveCamera(
            35,
            this.sizes.width / this.sizes.height,
            0.1,
            3000
        );

        this.instance.position.set(
            this.params.hero.x, 
            this.params.hero.y, 
            this.params.hero.z
        );

        this.instance.lookAt(
            this.params.lookAt.x, 
            this.params.lookAt.y, 
            this.params.lookAt.z
        );
      
        this.scene.add(this.instance);
    }

    setControls() {
        this.controls = new OrbitControls(this.instance, this.canvas)
        this.controls.enabled = false 

        this.controls.enableDamping = true 

        this.controls.enablePan = false; //Panning
        
        // Security limit
        this.controls.maxPolarAngle = Math.PI / 2 - 0.05 
        this.controls.minDistance = 10  
        this.controls.maxDistance = 150
    }

    setDebug() {
        if(this.debug.active) {
            const folder = this.debug.getFolder('Camera/Position');

            // Funzione interna per aggiornare il lookAt ogni volta che muovi la camera
            const updateLookAt = () => {
                this.instance.lookAt(
                    this.params.lookAt.x, 
                    this.params.lookAt.y, 
                    this.params.lookAt.z
                );
            };

            folder.add(this.instance.position, 'x').min(-50).max(50).step(0.1).name('Pos X').onChange(updateLookAt);
            folder.add(this.instance.position, 'y').min(0).max(50).step(0.1).name('Pos Y').onChange(updateLookAt);
            folder.add(this.instance.position, 'z').min(0).max(200).step(0.1).name('Pos Z').onChange(updateLookAt);
            
            const lookAtFolder = this.debug.getFolder('Camera/LookAt');
            lookAtFolder.add(this.params.lookAt, 'y').min(-20).max(20).step(0.1).name('Target Y').onChange(updateLookAt);
        }
    }

    /**
     *  Helpers
     */
    setPosition(x, y, z) {
        this.instance.position.set(x, y, z);
    }

    /*
    * Event Manager
    */

    resize() {
        this.instance.aspect = this.sizes.width / this.sizes.height;

        //Keep the horizontal FOV constant and adjust the vertical FOV
        const radHFov = THREE.MathUtils.degToRad(this.params.hFov);
        const vFov = 2 * Math.atan(Math.tan(radHFov / 2) / this.instance.aspect);

        this.instance.fov = THREE.MathUtils.radToDeg(vFov);
        this.instance.fov = THREE.MathUtils.clamp(this.instance.fov, 20, 90);

        this.instance.updateProjectionMatrix();
    }

    update() {
        // Update
        if(this.controls) {
            this.controls.update()
        }
    }


}