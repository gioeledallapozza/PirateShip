import * as THREE from 'three';
import Experience from '../Experience.js';
import gsap from 'gsap';

export default class Hotpoints{

    constructor(){
        this.experience = new Experience();
        this.scene = this.experience.scene;
        this.cameraClass = this.experience.camera;
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
                gsapPosition: { x: -21.04, y: 10.15, z: 22.67 },
                gsapTarget: { x: -16.44, y: 6.65, z: 9.04 },
                category: 'Origin',
                title: 'Charting the Course',
                description: `My interest in Computer Science started early, long before university.

I studied at ITIS Rossi and I’m currently pursuing a degree in Computer Science at the University of Padua.

At the same time, I work part-time as a developer at RBFDMAT. It’s my way of staying connected to both sides of this field: theory and real-world problems.`
            },
            {
                targetName: 'MainSail2_Sails_0',
                offset: new THREE.Vector3(0,30,0),
                position: new THREE.Vector3(-6.9, 27.55, 14.92),  //Deafult position will be overridden
                gsapPosition: { x: -17.50, y: 24.15, z: 47.55 },
                gsapTarget: { x: -5.33, y: 21.91, z: 22.78 },
                category: 'Technical',
                title: "Under the Canvas",
                description: `This project is where I really started exploring three.js and the WebGL world.

The challenge wasn’t just making it look good, but making it run well. Keeping everything smooth at 60 FPS across devices forced me to think about performance, not just visuals.

It made me realize how much depth there is behind interactive 3D experiences.`
            },
            {
                targetName: 'anchor',
                offset: new THREE.Vector3(0.10, -0.5, 0.10),
                position: new THREE.Vector3(-0.96, 6.05, 17.86),  //Deafult position will be overridden
                gsapPosition: { x: 1.42, y: 1.43, z: 38.12 },
                gsapTarget: { x: 8.03, y: -0.43, z: 1.55 },
                category: 'Philosophy',
                title: 'Dropping Anchor',
                description: `I don’t spend all my time coding.

Training is an important part of my routine. For me, physical health and mental clarity go together.

Over time I noticed that the way I train is similar to how I code: attention to detail, consistency, and focusing on small improvements that compound over time.`
            },
            {
                targetName: 'Jibboom_Poles_0',
                offset: new THREE.Vector3(0, 58, 9),
                position: new THREE.Vector3(21.9, 8.5, 31.9), //Deafult position will be overridden
                gsapPosition: { x: -10.56, y: 7.28, z: 22.16 },
                gsapTarget: { x: 1.73, y: 6.62, z: 27.01 },
                category: 'Future',
                title: 'New Horizons',
                description: `This project is just a starting point, not the final destination.

There’s still a lot I want to explore, from React Three Fiber to WebGPU and beyond.

The goal is to build interactive experiences that feel alive, something people actually want to explore, not just scroll past.`
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

        //Event delegation for points
        this.container.addEventListener('click', (event) => {
            if (this.isAnimating) return;

            const clickedElement = event.target.closest('.point'); //Get point

            if (!clickedElement) return;

            // add class tap-active to label and text to give an animation
            const label = clickedElement.querySelector('.label');
            const text = clickedElement.querySelector('.text'); 

            if (label) label.classList.add('tap-active');
            if (text) text.classList.add('tap-active');

            setTimeout(() => {
                if (label) label.classList.remove('tap-active');
                if (text) text.classList.remove('tap-active');
            }, 250);

            const index = clickedElement.dataset.index; //Get index
            const data = this.points[index]; //Get data
            
            this.isAnimating = true;

            //if we click on the same point adjust camera and exit
            if (this.currentPointIndex === index) { 
                this.gsapTo(data.gsapPosition, data.gsapTarget);
                return;
            }

            // If nothing is open or we click on a different point
            if (this.currentPointIndex !== null) {
            
                //Close modal
                this.closeModal();

                this.gsapTo(data.gsapPosition, data.gsapTarget);

                //Wait for modal to close
                setTimeout(() => {
                    this.updateModalContent(data);
                    this.openModal(index);
                }, 600); 
            } else {
                this.updateModalContent(data);
                this.gsapTo(data.gsapPosition, data.gsapTarget);
                this.openModal(index);
            }
        });

        //Event delegation for close button
        this.btnClose.addEventListener('click', () => {
            if (this.isAnimating) return;

            this.isAnimating = true;
            this.closeModal();
 
            //Return to default camera position
            const basePosition = this.cameraClass.params.immersive; 
            const baseTarget = this.cameraClass.params.lookAt;
            
            this.gsapTo(basePosition, baseTarget, true);
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

            this.debugFolder = this.debug.getFolder('Hotpoints/Offsets');
            for (const point of this.points) {
                const folder = this.debugFolder.addFolder(point.title);
                // Modificando questi, l'offset cambia e il localToWorld nel loop fa il resto
                folder.add(point.offset, 'x', -10, 10, 0.1).name('Offset X');
                folder.add(point.offset, 'y', -10, 10, 0.1).name('Offset Y');
                folder.add(point.offset, 'z', -10, 10, 0.1).name('Offset Z');
            }


            // AGGIUNGIAMO IL TOOL PER LE CAMERE
            const gsapCameraFolder = this.debug.getFolder('Hotpoints/GSAP');
            
            const debugActions = {
                logCurrentCameraParams: () => {
                    const pos = this.camera.position;
                    const target = this.cameraClass.controls.target;
                    
                    console.log(`
                        /* --- COPIA QUESTI DATI NEL pointsData --- */
                        gsapPosition: { x: ${pos.x.toFixed(2)}, y: ${pos.y.toFixed(2)}, z: ${pos.z.toFixed(2)} },
                        gsapTarget: { x: ${target.x.toFixed(2)}, y: ${target.y.toFixed(2)}, z: ${target.z.toFixed(2)} }
                    `);
                    
                    alert("Parametri stampati nella console!");
                }
            };

            // Aggiunge un bottone cliccabile nella GUI
            gsapCameraFolder.add(debugActions, 'logCurrentCameraParams').name('Log Camera & Target');
        }
    }

    gsapTo(targetPosition, targetLookAt, isReturning = false) {

        this.cameraClass.controls.enabled = false;

        this.container.style.transition = 'opacity 0.2s ease';
        this.container.style.opacity = '0';

        // Move the camera to the target
        gsap.to(this.camera.position, {
            x: targetPosition.x,
            y: targetPosition.y,
            z: targetPosition.z,
            duration: 1.5,
            ease: "power2.inOut",
            onUpdate: () => {
               this.cameraClass.controls.update(); 
            },
            onComplete: () => {
                this.isAnimating = false;

                if (isReturning) {
                    this.cameraClass.controls.enabled = true;
                }

                this.container.style.transition = 'opacity 0.5s ease-in';
                this.container.style.opacity = '1';
            }
        });

        //Rotate camera to look at the target
        gsap.to(this.cameraClass.controls.target, {
            x: targetLookAt.x,
            y: targetLookAt.y,
            z: targetLookAt.z,
            duration: 1.5,
            ease: "power2.inOut"
        });
    }

    // Inject only data
    updateModalContent(data) {
        this.modal.querySelector('.project-title').textContent = data.title;
        this.modal.querySelector('.project-description').textContent = data.description;
        
        // Gestione categoria (se l'hai aggiunta ai dati)
        const category = this.modal.querySelector('.modal-category span');
        if(category) category.textContent = data.category || 'Discovery';

        // const footer = this.modal.querySelector('.modal-footer');
        // const link = this.modal.querySelector('.project-link');
        // if (data.link && data.link !== '#') {
        //     footer.classList.remove('hidden_footer'); // Usa un'altra classe per il footer
        //     link.href = data.link;
        // } else {
        //     footer.classList.add('hidden_footer');
        // }
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

        this.points.forEach(p => p.element.classList.remove('is-active'));
        if (this.points[index] && this.points[index].element) {
            this.points[index].element.classList.add('is-active');
        }
    }

    closeModal() {
        this.currentPointIndex = null;
        this.modal.classList.add('hidden');

        this.points.forEach(p => p.element.classList.remove('is-active'));
    }

    update(){
        if (!this.active || this.isAnimating) return;
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

            //check if the point is behind the camera
            if (screenPosition.z > 1) {
                point.element.classList.remove('visible');
                continue; 
            }

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