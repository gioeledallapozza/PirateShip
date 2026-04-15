import * as THREE from 'three';
import Experience from '../Experience.js';

export default class Hotpoints{

    constructor(){
        this.experience = new Experience();
        this.scene = this.experience.scene;
        this.camera = this.experience.camera;
        this.debug = this.experience.debug;
 

        this.setPoints();
        this.setParameters();
        this.setDebug();
    }

    setPoints(){
        const pointsData = [
            {
                position: new THREE.Vector3(21.9, 8.5, 31.9), 
                title: 'Project Alpha',
                element: document.querySelector('.point-0') // div HTML 
            },
            {
                position: new THREE.Vector3(-16.44, 6.65, 9.04), 
                title: 'Creative Lab',
                element: document.querySelector('.point-1') // div HTML 
            }
        ];

        this.points = [];
        const container = document.querySelector('.hotpointsContainer');

        //Cycle through the data and create the HTML elements
        pointsData.forEach((data, index) => {
            // Main div for the point
            const element = document.createElement('div');
            element.classList.add('point');
            
            // Template HTML
            element.innerHTML = `
                <div class="label">${index + 1}</div>
                <div class="text">
                    <strong>${data.title}</strong>
                </div>
            `;

            //Add to DOM
            container.appendChild(element);

            // Save the point data
            this.points.push({
                position: data.position,
                element: element
            });
        });
    }

    setParameters(){               
        this.raycaster = new THREE.Raycaster();
        this.shipModel = this.experience.world.ship.model;
        this.active = false;
    }

    setDebug(){
        //create mesh sphere for HELP
        this.debugPoints = [];
        for (const point of this.points) {
            const geometry = new THREE.SphereGeometry(0.5, 16, 16);
            const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
            const sphere = new THREE.Mesh(geometry, material);
            sphere.position.copy(point.position);
            this.scene.add(sphere);

            this.debugPoints.push(sphere);
        }



        if(this.debug.active){
            this.debugFolder = this.debug.ui.addFolder('Hitpoints');
            for (const point of this.debugPoints) {
                this.debugFolder.add(point.position, 'x', -30, 30).name('X');
                this.debugFolder.add(point.position, 'y', -20, 30).name('Y');
                this.debugFolder.add(point.position, 'z', -20, 40).name('Z');
            }
            this.debugFolder.close();
        }
    }

    /**
     * Event Manager
     */

    activate() {
        this.active = true;
        document.querySelector('.hotpointsContainer').classList.add('active');
    }

    update(){
        if (!this.active) return;

        for(const point of this.points) {
            
            //Copy the position, .project may modify original vector
            const screenPosition = point.position.clone();
            //Project the 3D position to 2D screen space
            screenPosition.project(this.experience.camera.instance); //Returns [-1, 1] range

            // Check if the point is visible by casting a ray from the camera to the point
            this.raycaster.setFromCamera(screenPosition, this.experience.camera.instance);
            
            const intersects = this.raycaster.intersectObject(this.shipModel, true);

            if(intersects.length === 0) {
                point.element.classList.add('visible');
            } else {
                const intersectionDistance = intersects[0].distance;
                const pointDistance = point.position.distanceTo(this.experience.camera.instance.position);

                if(intersectionDistance < pointDistance) {
                    point.element.classList.remove('visible');
                } else {
                    point.element.classList.add('visible');
                }
            }

            //Mapping from NDC [-1,1] to screen [0, width/height]
            const translateX = (screenPosition.x * 0.5 + 0.5) * this.experience.sizes.width;
            const translateY = (1 - (screenPosition.y * 0.5 + 0.5)) * this.experience.sizes.height;

            //Apply Css
            point.element.style.transform = `translate3d(${translateX}px, ${translateY}px, 0)`;
        }
    }


}