import * as THREE from 'three'
import CSM from 'three-custom-shader-material/vanilla'
import Experience from "../Experience.js";
import sailsVertexShader from '../../shaders/ship/sails/vertex.glsl'
import sailsFragmentShader from '../../shaders/ship/sails/fragment.glsl'

export default class Ship 
{
    constructor() 
    {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.time = this.experience.time
        this.debug = this.experience.debug

        this.params = {
            x: 10,
            y: 2,
            z: 2,
            scale: 0.125,
            rotationY: 2, // Math.PI / 2
            amplitudeY: 0.2,
            speedY: 0.5
        }

        // Setup
        this.ship = this.resources.items.pirateShip
        this.model = this.ship.scene

        this.setModel()
        this.setDebug()
    }

    setModel() 
    {
        this.model.scale.set(this.params.scale, this.params.scale, this.params.scale)
        this.model.rotation.y = this.params.rotationY
        this.model.position.set(this.params.x, this.params.y, this.params.z)
        
        this.scene.add(this.model)

        this.model.traverse((child) => 
        {
            if (child instanceof THREE.Mesh) 
            {
  
                child.castShadow = true
                child.receiveShadow = true
                

                if (child.name.includes('Sails')) {
                    const originalMaterial = child.material

                    child.material = new CSM({
                        baseMaterial: originalMaterial,
                        vertexShader: sailsVertexShader,
                        fragmentShader: sailsFragmentShader,
                        uniforms: {
                            uTime: new THREE.Uniform(0),
                            uWindSpeed: new THREE.Uniform(1.5),
                            uWindStrength: new THREE.Uniform(0.2),
                        }
                    })
                    this.sailsMaterial = child.material
                }

                if(child.material.map) child.material.map.colorSpace = THREE.SRGBColorSpace
            }
        })
    }

    updateModel()
    {
        this.model.scale.set(this.params.scale, this.params.scale, this.params.scale)
        this.model.rotation.y = this.params.rotationY
        this.model.position.set(this.params.x, this.params.y, this.params.z)
    }

    setDebug()
    {
      if(this.debug.active)
        {
            const shipFolder = this.debug.getFolder('World/Ship')
            
            // Position
            const posFolder = shipFolder.addFolder('Position')
            posFolder.add(this.params, 'x').name('X').min(-50).max(50).step(0.1).onChange(() => this.updateModel())
            posFolder.add(this.params, 'y').name('Y').min(-10).max(10).step(0.1).onChange(() => this.updateModel())
            posFolder.add(this.params, 'z').name('Z').min(-250).max(50).step(0.1).onChange(() => this.updateModel())

            // Trasform
            shipFolder.add(this.params, 'scale').name('Scale').min(0.001).max(0.8).step(0.001).onChange(() => this.updateModel())
            shipFolder.add(this.params, 'rotationY').name('Rotation Y').min(0).max(Math.PI * 2).step(0.01).onChange(() => this.updateModel())
            
            // Animation (?) Non used
            const animFolder = shipFolder.addFolder('Animation')
            animFolder.add(this.params, 'amplitudeY').name('Oscillation Amp').min(0).max(2).step(0.01)
            animFolder.add(this.params, 'speedY').name('Oscillation Speed').min(0).max(5).step(0.1)
        }
    }

    update() 
    {
        if(this.sailsMaterial) {
            this.sailsMaterial.uniforms.uTime.value = this.experience.time.elapsed * 0.001;
        }
    }
}