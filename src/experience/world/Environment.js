import * as THREE from 'three'
import Experience from '../Experience.js'
import { Sky } from 'three/addons/objects/Sky.js'

export default class Environment
{
    constructor(){
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.debug = this.experience.debug

        //Debug
        this.debugFolder = this.debug.getFolder('World/Environment');

        //Sky parameters
        this.params = {
            turbidity: 2,
            rayleigh: 3,
            mieCoefficient: 0.005,
            mieDirectionalG: 0.7,
            elevation: 2,   // Sun angle (0 = horizon, 90 = zenith)  //10 (telefono)
            azimuth: 160,   //180 (telefono)
            exposure: 1.0,

            hemiSkyColor: '#ffddcc',   // Luce del cielo (calda)
            hemiGroundColor: '#1d2a3a', // Luce di rimbalzo dal mare (blu scuro)
            hemiIntensity: 0.6,         // Intensità base

            //Shadow
            shadowSize: 30, 
            shadowNear: 1,
            shadowFar: 100,
            shadowBias: -0.0005,
            showShadowHelper: false 
        }

        this.sun = new THREE.Vector3()

        this.setSky()
        this.setFog()
        this.setAmbientLight()
        this.updateSun()
        this.setDebug()
    }

    setSky() {
        this.sky = new Sky()
        this.sky.scale.setScalar(450000)
        this.scene.add(this.sky)

        // Uniforms dello shader Sky
        this.skyVariables = this.sky.material.uniforms
        this.skyVariables['turbidity'].value = this.params.turbidity
        this.skyVariables['rayleigh'].value = this.params.rayleigh
        this.skyVariables['mieCoefficient'].value = this.params.mieCoefficient
        this.skyVariables['mieDirectionalG'].value = this.params.mieDirectionalG
    }

    setFog(){
        const fogColor = '#d8a08f'; 
        this.scene.fog = new THREE.FogExp2(fogColor, 0.007);
    }

    setAmbientLight() {
        this.hemiLight = new THREE.HemisphereLight(
            this.params.hemiSkyColor, 
            this.params.hemiGroundColor, 
            this.params.hemiIntensity
        );
        this.scene.add(this.hemiLight);
    }

    updateSun() {
        // Angle conversion
        const phi = THREE.MathUtils.degToRad(90 - this.params.elevation)
        const theta = THREE.MathUtils.degToRad(this.params.azimuth)

        this.sun.setFromSphericalCoords(1, phi, theta)

        // Update sky shader
        this.sky.material.uniforms['sunPosition'].value.copy(this.sun)

        //Light for simulate the sun
        if(!this.sunLight) {
            this.sunLight = new THREE.DirectionalLight('#ffe3d5', 2) // Intensità 2 o più

            //Shadow
            this.sunLight.castShadow = true
            this.sunLight.shadow.mapSize.set(2048, 2048)
            this.sunLight.shadow.camera.near = 1
            this.sunLight.shadow.camera.far = 100
            this.sunLight.shadow.camera.left = -30
            this.sunLight.shadow.camera.right = 30
            this.sunLight.shadow.camera.top = 30
            this.sunLight.shadow.camera.bottom = -30
            this.sunLight.shadow.bias = -0.0005
            
            this.scene.add(this.sunLight)


            this.shadowHelper = new THREE.CameraHelper(this.sunLight.shadow.camera)
            this.shadowHelper.visible = this.params.showShadowHelper
            this.scene.add(this.shadowHelper)

            this.scene.add(this.sunLight)
        }

        // Position the sun light FAR from the center
        this.sunLight.position.copy(this.sun).multiplyScalar(40);
        this.sunLight.lookAt(0, 0, 0);  

        if(this.shadowHelper) {
            this.shadowHelper.update()
        }

        //Copy direction of the sky To handle better
        if(this.experience.world.sea) {
            this.experience.world.sea.material.uniforms.uLightDirection.value.copy(this.sun)
        }
        
        this.updateEnvironmentMap()
    }

    updateEnvironmentMap() {
        // Make the sky the environment map for reflections (it's like a better ambient light)
        const pmremGenerator = new THREE.PMREMGenerator(this.experience.renderer.instance) 
        
        const renderTarget = pmremGenerator.fromScene(this.sky)
        this.scene.environment = renderTarget.texture
        this.scene.environmentIntensity = 1.5;
        
        pmremGenerator.dispose()
    }

    setDebug() {
        if(this.debug.active) {
            const environmentFolder = this.debug.getFolder('World/Environment');
            environmentFolder.close();

            //Sky
            const skyFolder = this.debug.getFolder('World/Environment/Sky');
            
            skyFolder.add(this.params, 'turbidity', 0, 20).onChange(() => this.skyVariables['turbidity'].value = this.params.turbidity)
            skyFolder.add(this.params, 'rayleigh', 0, 4).onChange(() => this.skyVariables['rayleigh'].value = this.params.rayleigh)
            skyFolder.add(this.params, 'elevation', 0, 5, 0.1).name('Sun Elevation').onChange(() => this.updateSun())
            skyFolder.add(this.params, 'azimuth', -180, 180, 0.1).name('Sun Azimuth').onChange(() => this.updateSun())
            skyFolder.add(this.params, 'exposure', 0, 2, 0.01).name('Exposure').onChange(() => {
                this.experience.renderer.instance.toneMappingExposure = this.params.exposure
            })
            skyFolder.close();

            const fogFolder = this.debug.getFolder('World/Environment/Fog');
            fogFolder.add(this.scene.fog, 'density', 0, 0.1, 0.001).name('Fog Density');
            fogFolder.addColor(this.scene.fog, 'color').name('Fog Color');
            fogFolder.close();

            //Hemisphere light
            const hemiFolder = this.debug.getFolder('World/Environment/Hemisphere');
            hemiFolder.addColor(this.params, 'hemiSkyColor').name('Sky Color').onChange(() => {
                this.hemiLight.color.set(this.params.hemiSkyColor);
            });
            hemiFolder.addColor(this.params, 'hemiGroundColor').name('Ground Color').onChange(() => {
                this.hemiLight.groundColor.set(this.params.hemiGroundColor);
            });
            hemiFolder.add(this.params, 'hemiIntensity', 0, 3, 0.01).name('Intensity').onChange(() => {
                this.hemiLight.intensity = this.params.hemiIntensity;
            });
            hemiFolder.close();

            //Shadow
            const shadowFolder = this.debug.getFolder('World/Environment/Shadows');
    
            const updateShadowCamera = () => {
                this.sunLight.shadow.camera.near = this.params.shadowNear;
                this.sunLight.shadow.camera.far = this.params.shadowFar;
                this.sunLight.shadow.camera.left = -this.params.shadowSize;
                this.sunLight.shadow.camera.right = this.params.shadowSize;
                this.sunLight.shadow.camera.top = this.params.shadowSize;
                this.sunLight.shadow.camera.bottom = -this.params.shadowSize;
                
                // Obbligatorio in Three.js quando cambi near/far/left/right/ecc
                this.sunLight.shadow.camera.updateProjectionMatrix();
                
                if(this.shadowHelper) this.shadowHelper.update();
            }

            shadowFolder.add(this.params, 'showShadowHelper').name('Show Helper').onChange((value) => {
                this.shadowHelper.visible = value;
            });

            shadowFolder.add(this.params, 'shadowSize', 10, 200, 1).name('Area Size').onChange(updateShadowCamera);
            shadowFolder.add(this.params, 'shadowNear', 0.1, 100, 0.1).name('Near').onChange(updateShadowCamera);
            shadowFolder.add(this.params, 'shadowFar', 10, 500, 1).name('Far').onChange(updateShadowCamera);
            shadowFolder.add(this.params, 'shadowBias', -0.01, 0.01, 0.0001).name('Bias').onChange(() => {
                this.sunLight.shadow.bias = this.params.shadowBias;
            });
            shadowFolder.close();
        }
    }
}