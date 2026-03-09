import * as THREE from 'three'
import Experience from '../Experience.js'

export default class Environment
{
    constructor(){
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.debug = this.experience.debug

        //Debug
        this.debugFolder = this.debug.getFolder('World/Environment');


        // this.setSunLight()
        // this.setEnvironmentMap()

        //Light basic  (test)
        this.sunLight = new THREE.DirectionalLight('#ffffff', 4)
        this.sunLight.position.set(3, 5, 5)
        this.scene.add(this.sunLight)

        this.ambientLight = new THREE.AmbientLight('#ffffff', 0.5)
        this.scene.add(this.ambientLight);
    }
}