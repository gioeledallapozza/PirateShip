import * as THREE from 'three';
import Experience from '../Experience.js';

export default class Hotpoints{

    constructor(){
        this.experience = new Experience();
        this.scene = this.experience.scene;
        this.camera = this.experience.camera.instance;
        this.debug = this.experience.debug;
 
   
        this.setPoints();
        this.setParameters();
        this.setEvents();
        // this.setDebug();
    }

    setPoints(){
        const pointsData = [
            {
                targetName: 'rudder_2',
                offset: new THREE.Vector3(0, 0, 2),
                position: new THREE.Vector3(-16.44, 6.65, 9.04),  //Deafult position will be overridden
                category: 'Origin',
                title: 'The Navigator',
                description: `Computer Science student in Padua, currently in my second year.

                    I work part-time as a software developer in industrial automation, where things need to be solid, predictable, and efficient.

                    At the same time, I’m exploring the creative side of development, building interactive 3D experiences for the web. This project is where those two worlds start to meet.`
            },
            {
                targetName: 'MainSail2_Sails_0',
                offset: new THREE.Vector3(0,30,0),
                position: new THREE.Vector3(-6.9, 27.55, 14.92),  //Deafult position will be overridden
                category: 'Technical',
                title: "Ship's Anatomy",
                description: `This project is built with vanilla Three.js.

                    I focused on understanding what’s happening under the hood: custom shaders for the ocean, raycasting for interactions, and syncing 3D elements with the DOM.

                    Not perfect, but every piece is something I wanted to understand deeply, not just use.`
            },
            {
                targetName: 'anchor',
                offset: new THREE.Vector3(0.10, -0.5, 0.10),
                position: new THREE.Vector3(-0.96, 6.05, 17.86),  //Deafult position will be overridden
                category: 'Philosophy',
                title: 'Hybrid Mindset',
                description: `I spend a good amount of time training in the gym.

                    At some point I realized I approach coding in a similar way: building something that works is not enough, I also care about how it looks and feels.

                    Structure matters, but so do the details.`
            },
            {
                targetName: 'Jibboom_Poles_0',
                offset: new THREE.Vector3(0, 58, 9),
                position: new THREE.Vector3(21.9, 8.5, 31.9), //Deafult position will be overridden
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
                element: element,   
                targetMesh: null
            });
        });
    }

    setParameters(){               
        this.frameCount = 0;
        this.raycaster = new THREE.Raycaster();
        this.shipModel = this.experience.world.ship.model;
        //Associate a mesh to each point based on the targetName
        for(const point of this.points) {
            //Search for the target mesh
            const mesh = this.shipModel.getObjectByName(point.targetName);
            
            if(mesh) {
                point.targetMesh = mesh; 
            }
        }

        this.active = false;
        this.currentPointIndex = null;
    }

    setEvents(){
        //save the modal
        this.modal = document.querySelector('#project-modal');
        this.btnClose = this.modal.querySelector('.close-btn');
        this.isAnimating = false;

        this.container.addEventListener('click', (event) => {
            const clickedElement = event.target.closest('.point');
            if (!clickedElement) return;

            const index = clickedElement.dataset.index;
            const data = this.points[index];

            if (this.currentPointIndex === index) return; //skip if we try to open the same modal again

            if (this.currentPointIndex !== null) {
                this.isAnimating = true;
            
                this.closeModal();
            
                setTimeout(() => {
                    this.updateModalContent(data);
                    this.openModal(index);
                    this.isAnimating = false;
                }, 600); 
            } else {
                this.updateModalContent(data);
                this.openModal(index);
            }
        });

        this.btnClose.addEventListener('click', () => {
            this.closeModal();
        });
    }

    setDebug() {
        this.debugPoints = [];
        
        // Creiamo una sola geometria e materiale per ottimizzare
        const geometry = new THREE.SphereGeometry(0.5, 16, 16);
        const material = new THREE.MeshBasicMaterial({ color: 0xff0000, depthTest: false }); 

        for (const point of this.points) {
            const sphere = new THREE.Mesh(geometry, material);
            this.scene.add(sphere);
            
            // Salviamo la sfera nel punto così possiamo aggiornarla nel loop
            point.debugSphere = sphere;
        }

        // Colleghiamo la GUI agli OFFSET, non alla posizione assoluta
        if (this.debug.active) {
            this.debugFolder = this.debug.ui.addFolder('Hotpoints Offsets');
            for (const point of this.points) {
                const folder = this.debugFolder.addFolder(point.title);
                // Modificando questi, l'offset cambia e il localToWorld nel loop fa il resto
                folder.add(point.offset, 'x', -10, 10, 0.1).name('Offset X');
                folder.add(point.offset, 'y', -10, 10, 0.1).name('Offset Y');
                folder.add(point.offset, 'z', -10, 10, 0.1).name('Offset Z');
            }
        }
    }

    // Inject only data
    updateModalContent(data) {
        this.modal.querySelector('.project-title').textContent = data.title;
        this.modal.querySelector('.project-description').textContent = data.description;
        
        // Gestione categoria (se l'hai aggiunta ai dati)
        const category = this.modal.querySelector('.modal-category span');
        if(category) category.textContent = data.category || 'Discovery';

        const footer = this.modal.querySelector('.modal-footer');
        const link = this.modal.querySelector('.project-link');
        if (data.link && data.link !== '#') {
            footer.classList.remove('hidden_footer'); // Usa un'altra classe per il footer
            link.href = data.link;
        } else {
            footer.classList.add('hidden_footer');
        }
    }

    /**
     * Event Manager
     */

    activate() {
        this.active = true;
        this.container.classList.add('active');
    }

    openModal(index) {
        this.currentPointIndex = index;
        this.modal.classList.remove('hidden');
    }

    closeModal() {
        this.currentPointIndex = null;
        this.modal.classList.add('hidden');
    }

    update(){
        if (!this.active) return;
        this.frameCount++;

        const shouldCheckOcclusion = this.frameCount % 5 === 0;

    
        for(const point of this.points) {

            if(point.targetMesh) { 
            
                const calculatedPosition = point.offset.clone(); //clone the offset
                point.targetMesh.localToWorld(calculatedPosition); //Get the position of the mesh: applicated to the offset
                
                point.position.copy(calculatedPosition);

                if(point.debugSphere) point.debugSphere.position.copy(point.position);
            }

            //Copy the position, .project may modify original vector
            const screenPosition = point.position.clone();
            //Project the 3D position to 2D screen space
            screenPosition.project(this.camera); //Returns [-1, 1] range

            if (shouldCheckOcclusion) {
     

                // Check if the point is visible by casting a ray from the camera to the point
                this.raycaster.setFromCamera(screenPosition, this.camera);
                
                const intersects = this.raycaster.intersectObject(this.shipModel, true);

                if(intersects.length === 0) {
                    point.element.classList.add('visible');
                } else {
                    const intersectionDistance = intersects[0].distance;
                    const pointDistance = point.position.distanceTo(this.camera.position);

                    if(intersectionDistance < pointDistance) {
                        point.element.classList.remove('visible');
                    } else {
                        point.element.classList.add('visible');
                    }
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