import * as THREE from 'three';
import Debug from '../utils/Debug.js';
import Statistic from '../utils/Statistic.js'
import Sizes from '../utils/Sizes.js';
import Time from '../utils/Time.js';
import Cursor from '../utils/Cursor.js';
import Camera from './Camera.js'; 
import Renderer from './Renderer.js';
import Overlay from './world/Overlay.js';
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
        this.sizes = new Sizes();
        this.time = new Time();
        this.cursor = new Cursor();

        this.scene = new THREE.Scene();
        this.overlay = new Overlay();
        this.resources = new Resources();

        this.camera = new Camera();
        this.renderer = new Renderer();
        this.world = new World();
        
        /*
        * Event Manager
        */
        this.setLoadingLogic(); //Progress event

        this.sizes.on('resize', () => {
            this.resize()
        })

        this.time.on('tick', () => {
            this.update()
        })
    }

    //Start experience
    start() {

        gsap.killTweensOf(this.camera.instance.position);
        gsap.killTweensOf(this.camera.controls.target);

        //Calculate center of the ship
        const shipBox = new THREE.Box3().setFromObject(this.world.ship.model)
        const shipCenter = new THREE.Vector3()
        shipBox.getCenter(shipCenter)
        shipCenter.y -= 5 

        this.camera.params.lookAt.x = shipCenter.x;
        this.camera.params.lookAt.y = shipCenter.y;
        this.camera.params.lookAt.z = shipCenter.z;


        const tutorialUI = document.getElementById('tutorial-ui');

        //Internal function to hide the tutorial UI
        const hideTutorial = () => {
            tutorialUI.classList.remove('visible');

            //Remove event listeners
            window.removeEventListener('mousedown', hideTutorial);
            window.removeEventListener('touchstart', hideTutorial);
            window.removeEventListener('wheel', hideTutorial);
        }


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

                tutorialUI.classList.add('visible'); //Show tutorial UI

                //Event listeners to hide the tutorial UI
                window.addEventListener('mousedown', hideTutorial);
                window.addEventListener('touchstart', hideTutorial);
                window.addEventListener('wheel', hideTutorial);
            }
        })

        setTimeout(() => {
            const exitBtn = document.getElementById('exit-experience');
            if(exitBtn) exitBtn.classList.remove('hidden');
        }, 2500);
    }

    exit() {

        gsap.killTweensOf(this.camera.instance.position);
        gsap.killTweensOf(this.camera.controls.target);
      
        if (this.world.hotpoints) {
            this.world.hotpoints.active = false;
            this.world.hotpoints.container.classList.remove('active');
            this.world.hotpoints.closeModal(); 
        }

  
        const tutorialUI = document.getElementById('tutorial-ui');
        if(tutorialUI) tutorialUI.classList.remove('visible');

        this.camera.controls.enabled = false;
        this.camera.controls.maxDistance = 150;

        gsap.to(this.camera.instance.position, {
            duration: 2.5,
            x: this.camera.params.hero.x,
            y: this.camera.params.hero.y,
            z: this.camera.params.hero.z,
            ease: "power2.inOut",
            onUpdate: () => {
                this.camera.controls.update(); 
            }
        });

      
        gsap.to(this.camera.controls.target, {
            duration: 2.5,
            x: 0, 
            y: 5, 
            z: 0,
            ease: "power2.inOut"
        });

        setTimeout(() => {
                const exitBtn = document.getElementById('exit-experience');
                if(exitBtn) exitBtn.classList.add('hidden');
        }, 2500);
    }

    /**
     * Event Manager
     */
    setLoadingLogic() {
        const loadingScreen = document.querySelector('#loading-screen');
        const loadingBar = document.querySelector('#loading-bar');

        this.resources.on('progress', (progressRatio) => {
            loadingBar.style.transform = `scaleX(${progressRatio})`;
        });

        this.resources.on('ready', () => {
            setTimeout(() => {

                loadingScreen.classList.add('hidden');

                this.overlay.fade();

            }, 500); 
        });
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