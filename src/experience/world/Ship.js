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

        this.sailsMaterials = []

        this.params = {
            x: -10, //x: -16 (telefono)
            y: 2, 
            z: 12.5, // z: -64 (telefono)
            scale: 0.125,
            rotationY: 4.16, // Math.PI / 2  //3.61 (telefono)
            windStrength: 9.5,
            windSpeed: 0.5,
            windPrimary: new THREE.Vector3(1.0, 0.0, 1.0), 
            windCounter: new THREE.Vector3(-0.3, 0.0, -0.3)
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

               if (child.name.includes('Sails')) 
                {

                    const material = new CSM({
                        baseMaterial: child.material,
                        vertexShader: sailsVertexShader,
                        fragmentShader: sailsFragmentShader,
                        uniforms: {
                            uTime: new THREE.Uniform(0),
                            uOffset: new THREE.Uniform(Math.random() * 100.0),
                            uWindSpeed: new THREE.Uniform(this.params.windSpeed),
                            uWindStrength: new THREE.Uniform(this.params.windStrength),
                            uWindPrimary: new THREE.Uniform(this.params.windPrimary),
                            uWindCounter: new THREE.Uniform(this.params.windCounter)
                        }
                    })

                    child.material = material
                    this.sailsMaterials.push(material)
                }
                else if (child.name.includes('Window')) {
                    child.material.emissiveIntensity = 10.0
                    child.material.emissive = new THREE.Color('#9c6800') 
                    child.material.roughness = 0
                    child.material.metalness = 1.0
                    // child.material = new THREE.MeshStandardMaterial({
                    //     color: new THREE.Color('#000000'), 
                    //     emissive: new THREE.Color('#ffaa00'), // Arancione caldo lanterna
                    //     emissiveIntensity: 1, // Spinge oltre il Threshold del Bloom
                    //     roughness: 0,
                    //     metalness: 0.5
                    // })
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
            

            // Sails
            const sailsFolder = shipFolder.addFolder('Sails')

            //Wind
            const windFolder = sailsFolder.addFolder('Wind')
            windFolder.add(this.params, 'windSpeed', 0.1).min(0).max(5).name('Wind Speed')
            windFolder.add(this.params, 'windStrength', 0.01).min(0).max(10).name('Wind Strength')
            const windDirectionFolder = windFolder.addFolder('Direction')
            windDirectionFolder.add(this.params.windPrimary, 'x', 0.1).min(-1).max(1).name('Primary X')
            windDirectionFolder.add(this.params.windPrimary, 'z', 0.1).min(-1).max(1).name('Primary Z')
            windDirectionFolder.add(this.params.windCounter, 'x', 0.1).min(-1).max(1).name('Counter X')
            windDirectionFolder.add(this.params.windCounter, 'z', 0.1).min(-1).max(1).name('Counter Z')
        }
    }

    update() 
    {
        const time = this.experience.time.elapsed * 0.001
        // 1. Logica di galleggiamento e posizione (Fondamentale)
        this.model.position.set(
            this.params.x,
            this.params.y + Math.sin(time * 0.5) * 0.2, // Galleggiamento
            this.params.z
        )
        
        // Rotazione dinamica per dare vita
        this.model.rotation.x = Math.sin(time * 0.5) * 0.03
        this.model.rotation.z = Math.sin(time * 0.3) * 0.02

        for(const mat of this.sailsMaterials) 
        {
            mat.uniforms.uTime.value = time

            mat.uniforms.uWindSpeed.value = this.params.windSpeed
            mat.uniforms.uWindStrength.value = this.params.windStrength
            mat.uniforms.uWindPrimary.value.copy(this.params.windPrimary)
            mat.uniforms.uWindCounter.value.copy(this.params.windCounter)
        }
    }
}