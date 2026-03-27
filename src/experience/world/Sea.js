import * as THREE from 'three';
import Experience from '../Experience.js';

import seaFragmentShader from '../../shaders/sea/fragment.glsl';
import seaVertexShader from '../../shaders/sea/vertex.glsl';
import { ThreeMFLoader } from 'three/examples/jsm/Addons.js';

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

            // Normal Mapping
            const normalFolder = this.debug.getFolder('World/Sea/Normal');
            normalFolder.add(this.material.uniforms.uNormalScale, 'value', 1, 100, 0.1).name('Normal Scale');
            normalFolder.add(this.material.uniforms.uNormalSpeed, 'value', 0, 0.5, 0.001).name('Normal Speed');

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
                uLightDirection: new THREE.Uniform(new THREE.Vector3(1.0, 0.9, -5.2).normalize()), 
                uSkyColor: new THREE.Uniform(new THREE.Color('#ccf1ff')),
                uSpecularIntensity: new THREE.Uniform(0.53),
                uSpecularPower: new THREE.Uniform(200.0),
                uFresnelPower: new THREE.Uniform(7.2), 
                uFresnelIntensity: new THREE.Uniform(0.27),
                //Color
                uDepthColor: new THREE.Uniform(new THREE.Color('#1e3f5a')),
                uSurfaceColor: new THREE.Uniform(new THREE.Color('#4d9aaa')),
                uColorOffset: new THREE.Uniform(0.08),
                uColorMultiplier: new THREE.Uniform(5.0),
                //NormalMap
                uNormalMap: new THREE.Uniform(this.resources.items.waterNormal),
                uNormalScale: new THREE.Uniform(2.0),
                uNormalSpeed: new THREE.Uniform(0.02),
                //Foam
                uFoamColorMap: new THREE.Uniform(this.resources.items.foamTexture),
            },
            wireframe: false 
        });
    }

    setWaves(){
      this.BigWaveData = [
            // 1. L'ONDA DOMINANTE: Più grande e più lenta, decide la direzione del mare
           { 
                direction: new THREE.Vector2(1.0, 0.5).normalize(), // Direzione diagonale "sporca"
                steepness: 0.4,   // Abbastanza ripida per la schiuma
                elevation: 0.4,   // Alza il volume del mare
                frequency: 0.4,   // Circa 1.2 creste in tutto il piano da 20m
                speed: 1.2 
            },
            // 2. L'ONDA DI CONTRASTO (Più corta, rompe il ritmo)
            { 
                direction: new THREE.Vector2(-0.8, 0.3).normalize(), 
                steepness: 0.3, 
                elevation: 0.15, 
                frequency: 1.1,  // Numero non multiplo della prima
                speed: 1.8 
            },
            // 3. IL DETTAGLIO (Onde di vento superficiali)
            { 
                direction: new THREE.Vector2(0.1, 1.0).normalize(), 
                steepness: 0.2, 
                elevation: 0.05, 
                frequency: 2.7, 
                speed: 2.5 
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