import * as THREE from 'three'
import Experience from '../Experience.js'
import { Sky } from 'three/addons/objects/Sky.js'
import { fog } from 'three/tsl'

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
            elevation: 2,   // Angolo del sole (0 = orizzonte)
            azimuth: 180,   // Posizione intorno al piano
            exposure: 0.5
        }

        this.sun = new THREE.Vector3()

        this.setSky()
        this.setFog()
        this.setDebug()
        this.updateSun()
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
        this.scene.fog = new THREE.FogExp2(fogColor, 0.002);
    }

    updateSun() {
        // Angle conversion
        const phi = THREE.MathUtils.degToRad(90 - this.params.elevation)
        const theta = THREE.MathUtils.degToRad(this.params.azimuth)

        this.sun.setFromSphericalCoords(1, phi, theta)

        // Update sky shader
        this.sky.material.uniforms['sunPosition'].value.copy(this.sun)

        //Copy direction of the sky To handle better
        if(this.experience.world.sea) {
            this.experience.world.sea.material.uniforms.uLightDirection.value.copy(this.sun)
        }
        
        // Se hai una luce direzionale fisica (opzionale)
        // this.sunLight.position.copy(this.sun)
    }

    setDebug() {
        if(this.debug.active) {
            const folder = this.debug.getFolder('World/Environment');
            
            folder.add(this.params, 'turbidity', 0, 20).onChange(() => this.skyVariables['turbidity'].value = this.params.turbidity)
            folder.add(this.params, 'rayleigh', 0, 4).onChange(() => this.skyVariables['rayleigh'].value = this.params.rayleigh)
            folder.add(this.params, 'elevation', 0, 90, 0.1).name('Sun Elevation').onChange(() => this.updateSun())
            folder.add(this.params, 'azimuth', -180, 180, 0.1).name('Sun Azimuth').onChange(() => this.updateSun())
        }
    }
}