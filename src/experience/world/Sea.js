import * as THREE from 'three';
import Experience from '../Experience.js';

import seaFragmentShader from '../../shaders/sea/fragment.glsl';
import seaVertexShader from '../../shaders/sea/vertex.glsl';

export default class Sea 
{
     constructor() {
        this.experience = new Experience();
        this.debug = this.experience.debug;
        this.scene = this.experience.scene;
        this.resources = this.experience.resources;

        this.setGeometry();
        this.setMaterial();
        this.setMesh();

        //Debug
        this.setDebug()
    }

    setDebug() {
        if(this.debug.active) {
            //Big Waves
            const bigWavesFolder = this.debug.getFolder('World/Sea/Big Waves');

            this.BigWaveData.forEach((wave, index) => {
                const folder = this.debug.getFolder(`World/Sea/Big Waves/Wave ${index + 1}`);
                
                folder.add(wave, 'elevation').min(0).max(1).step(0.01).name('Elevation');
                folder.add(wave, 'frequency').min(0).max(20).step(0.1).name('Frequency');
                folder.add(wave, 'speed').min(0).max(4).step(0.01).name('Speed');
                folder.add(wave, 'steepness').min(0).max(1).step(0.01).name('Steepness');
                
                // Direzione (Vector2)
                folder.add(wave.direction, 'x').min(-1).max(1).step(0.1).name('Dir X');
                folder.add(wave.direction, 'y').min(-1).max(1).step(0.1).name('Dir Z');

                // Chiude la cartella di default
                folder.close();
            });

            //Small Waves
            const smallWavesFolder = this.debug.getFolder('World/Sea/Big Waves');

            //Light & view
            const lightViewFolder = this.debug.getFolder('World/Sea/Light & View');

            // Light
            lightViewFolder.add(this.material.uniforms.uLightDirection.value, 'x', -10, 10, 0.1).name('Light X');
            lightViewFolder.add(this.material.uniforms.uLightDirection.value, 'y', -10, 10, 0.1).name('Light Y');
            lightViewFolder.add(this.material.uniforms.uLightDirection.value, 'z', -10, 10, 0.1).name('Light Z');

            // View (Specular & Fresnel)
            lightViewFolder.add(this.material.uniforms.uSpecularIntensity, 'value', 0, 2, 0.01).name('Spec Intensity');
            lightViewFolder.add(this.material.uniforms.uSpecularPower, 'value', 1, 200, 1).name('Spec Power');
            lightViewFolder.add(this.material.uniforms.uFresnelPower, 'value', 0.1, 10, 0.1).name('Fresnel Power');
            lightViewFolder.add(this.material.uniforms.uFresnelIntensity, 'value', 0, 1, 0.01).name('Fresnel Intensity');

            //Colors
            const colorFolder = this.debug.getFolder('World/Sea/Colors');

            colorFolder.addColor(this.material.uniforms.uDepthColor, 'value').name('Depth Color');
            colorFolder.addColor(this.material.uniforms.uSurfaceColor, 'value').name('Surface Color');
            colorFolder.add(this.material.uniforms.uColorOffset, 'value', 0, 1, 0.001).name('Offset');
            colorFolder.add(this.material.uniforms.uColorMultiplier, 'value', 0, 10, 0.001).name('Multiplier');
        }
    }

    setGeometry(){
        this.geometry = new THREE.PlaneGeometry(20, 20, 256, 256);
    }

    setMaterial(){
        this.setWaves()

        this.material = new THREE.ShaderMaterial({
            vertexShader: seaVertexShader,
            fragmentShader: seaFragmentShader,
            uniforms: {
                //Time
                uTime: new THREE.Uniform(0),
                //BigWave
                uBigWaves: new THREE.Uniform(this.BigWaveData),
                //Light & view
                uLightDirection: new THREE.Uniform(new THREE.Vector3(1, 1, 0.5)), // Direzione del sole
                uSkyColor: new THREE.Uniform(new THREE.Color('#ccf1ff')),        // Riflesso azzurro chiaro
                uSpecularIntensity: new THREE.Uniform(0.5),                      // Forza del riflesso
                uSpecularPower: new THREE.Uniform(30.0),                         // Durezza del riflesso
                uFresnelPower: new THREE.Uniform(3.0),                           // Curva Fresnel
                uFresnelIntensity: new THREE.Uniform(0.2),
                //Color
                uDepthColor: new THREE.Uniform(new THREE.Color('#1e3f5a')),
                uSurfaceColor: new THREE.Uniform(new THREE.Color('#4d9aaa')),
                uColorOffset: new THREE.Uniform(0.08),
                uColorMultiplier: new THREE.Uniform(5.0),
                //NormalMap
                uNormalMap: new THREE.Uniform(this.resources.items.waterNormal),
            },
            wireframe: false 
        });
    }

    setWaves(){
        this.BigWaveData = [
            { 
                direction: new THREE.Vector2(1.0, 0.2), steepness: 0.5, elevation: 0.2, frequency: 4.0, speed: 0.75 
            },
            { 
                direction: new THREE.Vector2(-0.7, 0.9), steepness: 0.25, elevation: 0.08, frequency: 8.4, speed: 0.9 
            },
            { 
                direction: new THREE.Vector2(0.3, -1.0), steepness: 0.15, elevation: 0.04, frequency: 18.0, speed: 1.35 
            },
            { 
                direction: new THREE.Vector2(-0.1, -0.8), steepness: 0.1, elevation: 0.02, frequency: 32.0, speed: 1.87 
            }
        ];
    }

    setMesh(){
        this.mesh = new THREE.Mesh(
            this.geometry, 
            this.material
        );
        this.mesh.rotation.x = -Math.PI * 0.5;

        this.scene.add(this.mesh);
    }

    /*
    *  Event Manager
    */
   update(){
    this.material.uniforms.uTime.value = this.experience.time.elapsed * 0.001;
   }
}