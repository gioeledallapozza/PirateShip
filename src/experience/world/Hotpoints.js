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
        this.setEvents();
        this.setDebug();
    }

    setPoints(){
        const pointsData = [
            {
                position: new THREE.Vector3(-16.44, 6.65, 9.04), 
                category: 'Origin',
                title: 'The Navigator',
                description: `Computer Science student in Padua, currently in my second year.

                    I work part-time as a software developer in industrial automation, where things need to be solid, predictable, and efficient.

                    At the same time, I’m exploring the creative side of development, building interactive 3D experiences for the web. This project is where those two worlds start to meet.`
            },
            {
                position: new THREE.Vector3(-6.9, 27.55, 14.92), 
                category: 'Technical',
                title: "Ship's Anatomy",
                description: `This project is built with vanilla Three.js.

                    I focused on understanding what’s happening under the hood: custom shaders for the ocean, raycasting for interactions, and syncing 3D elements with the DOM.

                    Not perfect, but every piece is something I wanted to understand deeply, not just use.`
            },
            {
                position: new THREE.Vector3(-0.96, 6.05, 17.86), 
                category: 'Philosophy',
                title: 'Hybrid Mindset',
                description: `I spend a good amount of time training in the gym.

                    At some point I realized I approach coding in a similar way: building something that works is not enough, I also care about how it looks and feels.

                    Structure matters, but so do the details.`
            },
            {
                position: new THREE.Vector3(21.9, 8.5, 31.9), 
                category: 'Future',
                title: 'New Horizons',
                description: `Right now I’m learning more about React Three Fiber and advanced shader techniques.

                    This project is just a step, not a final product.

                    I’m trying to get better at building things that are not only functional, but also engaging to explore.`
            }
        ];

        this.points = [];
        this.container = document.querySelector('.hotpointsContainer');

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

            //Save the index
            element.dataset.index = index;

            //Add to DOM
            this.container.appendChild(element);

            // Save the point data
            this.points.push({
                ...data,
                element: element
            });
        });
    }

    setParameters(){               
        this.raycaster = new THREE.Raycaster();
        this.shipModel = this.experience.world.ship.model;
        this.active = false;
    }

    setEvents(){
        //save the modal
        this.modal = document.querySelector('#project-modal');
        this.btnClose = this.modal.querySelector('.close-btn');

        this.container.addEventListener('click', (event) => {
            const clickedElement = event.target.closest('.point');
            if (!clickedElement) return;

            const index = clickedElement.dataset.index;
            const data = this.points[index];

            this.openModal(data);
        });

        this.btnClose.addEventListener('click', () => {
            this.closeModal();
        });
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
        this.container.classList.add('active');
    }

    openModal(data) {
        //Inject data
        this.modal.querySelector('.project-title').textContent = data.title;
        this.modal.querySelector('.project-description').textContent = data.description;
        this.modal.querySelector('.project-link').href = data.link;
        console.log(data);

        const footer = this.modal.querySelector('.modal-footer');
        const link = this.modal.querySelector('.project-link');

        if (data.link && data.link !== '#') {
            footer.classList.remove('hidden');
            link.href = data.link;
            link.textContent = data.linkText || 'Read More';
        } else {
            footer.classList.add('hidden');
        }

        //Show modal
        this.modal.classList.remove('hidden');
    }

    closeModal() {
        this.modal.classList.add('hidden');
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