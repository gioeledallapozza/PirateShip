import * as THREE from 'three';
import Experience from '../Experience.js';

import seaFragmentShader from '../../shaders/sea/fragment.glsl';
import seaVertexShader from '../../shaders/sea/vertex.glsl';
import { ThreeMFLoader } from 'three/examples/jsm/Addons.js';
import { color, fog, vec2 } from 'three/tsl';
import { Fog } from 'three/webgpu';

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

            //SEA FOLDER
            const seaFolder = this.debug.getFolder('World/Sea');
            seaFolder.close();


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
            bigWavesFolder.close();

            //Small Waves
            const smallWavesFolder = this.debug.getFolder('World/Sea/Big Waves');

            // Normal Mapping
            const normalFolder = this.debug.getFolder('World/Sea/Normal');
            normalFolder.add(this.material.uniforms.uNormalScale, 'value', 1, 100, 0.1).name('Normal Scale');
            normalFolder.add(this.material.uniforms.uNormalSpeed, 'value', 0, 0.5, 0.001).name('Normal Speed');
            normalFolder.close()

            //Foam
            const foamFolder = this.debug.getFolder('World/Sea/Foam');
            foamFolder.add(this.material.uniforms.uFoamScale.value, 'x').name('Scale X').min(0).max(0.2).step(0.001);
            foamFolder.add(this.material.uniforms.uFoamScale.value, 'y').name('Scale Y').min(0).max(0.2).step(0.001);
            foamFolder.add(this.material.uniforms.uFoamSpeed, 'value').name('Speed').min(0).max(0.5).step(0.001);
            foamFolder.add(this.material.uniforms.uFoamThreshold.value, 'x').name('Erosion Min').min(0).max(1).step(0.01);
            foamFolder.add(this.material.uniforms.uFoamThreshold.value, 'y').name('Erosion Max').min(0).max(1).step(0.01);
            foamFolder.add(this.material.uniforms.uFoamTextureIntensity, 'value').name('Tex Intensity').min(0).max(5).step(0.1);
            foamFolder.add(this.material.uniforms.uFoamModulation, 'value').name('Wave Modulation').min(0).max(3).step(0.1);
            foamFolder.add(this.material.uniforms.uFoamNormalIntensity, 'value').name('Normal Strength').min(0).max(10).step(0.1);
            foamFolder.addColor(this.material.uniforms.uFoamColor, 'value').name('Foam Color');
            foamFolder.close();
                
            //Light & view
            const lightViewFolder = this.debug.getFolder('World/Sea/Light & View');

            // Light
            lightViewFolder.add(this.material.uniforms.uLightDirection.value, 'x', -10, 10, 0.1).name('Light X');
            lightViewFolder.add(this.material.uniforms.uLightDirection.value, 'y', -10, 10, 0.1).name('Light Y');
            lightViewFolder.add(this.material.uniforms.uLightDirection.value, 'z', -10, 10, 0.1).name('Light Z');
            lightViewFolder.addColor(this.material.uniforms.uSkyColor, 'value').name('Sky Color')
            lightViewFolder.add(this.material.uniforms.uSpecularIntensity, 'value', 0, 2, 0.01).name('Spec Intensity');
            lightViewFolder.add(this.material.uniforms.uSpecularPower, 'value', 1, 200, 1).name('Spec Power');
            lightViewFolder.add(this.material.uniforms.uFresnelPower, 'value', 0.1, 10, 0.1).name('Fresnel Power');
            lightViewFolder.add(this.material.uniforms.uFresnelIntensity, 'value', 0, 1, 0.01).name('Fresnel Intensity');
            lightViewFolder.close();

            //Subsurface Scattering
            const sssFolder = this.debug.getFolder('World/Sea/SSS');
            sssFolder.addColor(this.material.uniforms.uSSSColor, 'value').name('Color');
            sssFolder.add(this.material.uniforms.uSSSIntensity, 'value', 0, 5, 0.1).name('Intensity');
            sssFolder.add(this.material.uniforms.uSSSPower, 'value', 1, 20, 1).name('Power');
            sssFolder.add(this.material.uniforms.uSSSDepth, 'value', -1, 1, 0.01).name('Depth Mask');
            sssFolder.close();

            //Fog
            const fogFolder = this.debug.getFolder('World/Sea/Fog');
            fogFolder.addColor(this.material.uniforms.uFogColorSun, 'value').name('Fog Color Sun');
            fogFolder.addColor(this.material.uniforms.uFogColorDark, 'value').name('Fog Color Dark');
            fogFolder.add(this.material.uniforms.uFogFactor, 'value', 0, 10, 0.1).name('Fog Factor');
            fogFolder.add(this.material.uniforms.uFogHaloEdge, 'value', 0, 1, 0.01).name('Fog Halo Edge');
            fogFolder.add(this.material.uniforms.uFogTailStrength, 'value', 0, 1, 0.01).name('Fog Tail Strength');
            fogFolder.add(this.material.uniforms.uFogPeakStrength, 'value', 0, 1, 0.01).name('Fog Peak Strength');
            fogFolder.close();

            //Colors
            const colorFolder = this.debug.getFolder('World/Sea/Colors');
            colorFolder.addColor(this.material.uniforms.uDepthColor, 'value').name('Depth Color');
            colorFolder.addColor(this.material.uniforms.uSurfaceColor, 'value').name('Surface Color');
            colorFolder.add(this.material.uniforms.uColorOffset, 'value', 0, 1, 0.001).name('Offset');
            colorFolder.add(this.material.uniforms.uColorMultiplier, 'value', 0, 10, 0.001).name('Multiplier');
            colorFolder.close();
        }
    }

    setGeometry(){
        this.geometry = new THREE.PlaneGeometry(400, 400, 256, 256);
    }

    setMaterial(){
        this.setWaves()

        this.material = new THREE.ShaderMaterial({
            // precision: 'lowp',
            vertexShader: seaVertexShader,
            fragmentShader: seaFragmentShader,
            lights: true,
            uniforms: THREE.UniformsUtils.merge([
                THREE.UniformsLib['fog'],
                THREE.UniformsLib['lights'],
                {
                    //Time
                    uTime: new THREE.Uniform(0),
                    //BigWave
                    uBigWaves: new THREE.Uniform(this.BigWaveData),
                    //Light & view
                    uLightDirection: new THREE.Uniform(new THREE.Vector3(1.0, 0.9, -5.2).normalize()), 
                    uSkyColor: new THREE.Uniform(new THREE.Color('#ffe3d5')),
                    uSpecularIntensity: new THREE.Uniform(1.4),
                    uSpecularPower: new THREE.Uniform(200.0),
                    uSpecularColor: new THREE.Uniform(new THREE.Color('#ffe8a8')),
                    uFresnelPower: new THREE.Uniform(7.2), 
                    uFresnelIntensity: new THREE.Uniform(0.27),
                    //Color
                    uDepthColor: new THREE.Uniform(new THREE.Color('#001f4d')),
                    uSurfaceColor: new THREE.Uniform(new THREE.Color('#004d40')),
                    uColorOffset: new THREE.Uniform(0.35),
                    uColorMultiplier: new THREE.Uniform(5.0),
                    //NormalMap
                    uNormalMap: new THREE.Uniform(this.resources.items.waterNormal),
                    uNormalScale: new THREE.Uniform(2.0),
                    uNormalSpeed: new THREE.Uniform(0.02),
                    //Foam
                    uFoamColorMap: new THREE.Uniform(this.resources.items.foamTexture),
                    uFoamScale: new THREE.Uniform(new THREE.Vector2(0.05, 0.02)),
                    uFoamSpeed: new THREE.Uniform(0.01),
                    uFoamNormalMap: new THREE.Uniform(this.resources.items.foamNormal),
                    uFoamThreshold: new THREE.Uniform(new THREE.Vector2(0.2, 1.0)), 
                    uFoamTextureIntensity: new THREE.Uniform(0.8),
                    uFoamModulation: new THREE.Uniform(1.0), 
                    uFoamNormalIntensity: new THREE.Uniform(0.2),
                    uFoamColor: new THREE.Uniform(new THREE.Color('#e6ffff')),
                    //Subsurface Scattering
                    uSSSColor: new THREE.Uniform(new THREE.Color('#00ff80')),
                    uSSSIntensity: new THREE.Uniform(0.5),              
                    uSSSPower: new THREE.Uniform(18.0),                    
                    uSSSDepth: new THREE.Uniform(0.80),
                    //Fog
                    uFogColorSun: new THREE.Uniform(new THREE.Color('#cd8b7b').convertLinearToSRGB()),
                    uFogColorDark: new THREE.Uniform(new THREE.Color('#2c2021').convertLinearToSRGB()),
                    uFogFactor: new THREE.Uniform(2.0),
                    uFogHaloEdge: new THREE.Uniform(0.95), 
                    uFogTailStrength: new THREE.Uniform(0.4),  
                    uFogPeakStrength: new THREE.Uniform(0.88)    
                }            
            ]),
            fog: true,
            wireframe: false,
        });
    }

    setWaves(){
        this.BigWaveData = [
            // Main Waves
            { direction: new THREE.Vector2(1.0, 0.1).normalize(), steepness: 0.5, elevation: 0.45, frequency: 0.08, speed: 0.6 },
            { direction: new THREE.Vector2(-0.7, 0.4).normalize(), steepness: 0.7, elevation: 0.30, frequency: 0.15, speed: 0.9 },

            // Secondary waves
            { direction: new THREE.Vector2(0.3, 0.8).normalize(), steepness: 0.15, elevation: 0.12, frequency: 0.35, speed: 1.4 },
            { direction: new THREE.Vector2(-0.2, -0.9).normalize(), steepness: 0.1, elevation: 0.08, frequency: 0.55, speed: 2.1 },

            // Small ripples
            { direction: new THREE.Vector2(0.8, -0.5).normalize(), steepness: 0.05, elevation: 0.04, frequency: 1.2, speed: 3.5 },
            { direction: new THREE.Vector2(-0.5, 0.1).normalize(), steepness: 0.05, elevation: 0.02, frequency: 2.5, speed: 4.2 }
        ];
    }

    setMesh(){
        //Set mesh
        this.mesh = new THREE.Mesh(
            this.geometry, 
            this.material
        );
        this.mesh.rotation.x = -Math.PI * 0.5;
        this.mesh.receiveShadow = true;
        this.scene.add(this.mesh);
    }

    /*
    *  Event Manager
    */
    update(){
        this.material.uniforms.uTime.value = this.experience.time.elapsed * 0.001;
    }
}