import * as THREE from 'three'
import Experience from "../Experience.js";

export default class Ship 
{
    constructor() 
    {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.time = this.experience.time

        // Setup
        this.ship = this.resources.items.pirateShip
        this.model = this.ship.scene

        this.setModel()
    }

    setModel() 
    {
        this.model.scale.set(0.2, 0.2, 0.2)
        this.model.rotation.y = Math.PI / 2
        this.model.position.set(0, 3, 0)
        
        this.scene.add(this.model)

        this.model.traverse((child) => 
        {
            if (child instanceof THREE.Mesh) 
            {
                child.castShadow = true
                child.receiveShadow = true
                
                if(child.material.map) child.material.map.colorSpace = THREE.SRGBColorSpace
            }
        })
    }

    update() 
    {
        const time = this.time.elapsed * 0.001
    
        // 1. Oscillazione verticale (Sali e scendi)
        // Usa la stessa frequenza del mare!
        this.model.position.y = Math.sin(time * 0.5) * 0.2 

        // 2. Beccheggio (Avanti e indietro)
        this.model.rotation.x = Math.sin(time * 0.5) * 0.03
        
        // 3. Rollio (Destra e sinistra)
        this.model.rotation.z = Math.sin(time * 0.3) * 0.02
    }
}