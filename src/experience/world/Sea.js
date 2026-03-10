import * as THREE from 'three';
import Experience from '../Experience.js';

import seaFragmentsShader from '../../shaders/sea/fragments.glsl';
import seaVertexShader from '../../shaders/sea/vertex.glsl';

export default class Sea 
{
     constructor() {
        this.experience = new Experience();
        this.debug = this.experience.debug;
        this.scene = this.experience.scene;
        // this.resources = this.experience.resources

        this.setGeometry();
        this.setMaterial();
        this.setMesh();

        //Debug
        this.setDebug()
    }

    setDebug() {
        if(this.debug.active) {
            const folder = this.debug.getFolder('World/Sea/Big Waves');
            
            folder.add(this.material.uniforms.uBigWavesElevation, 'value', 0, 1, 0.01).name('Elevation');
            folder.add(this.material.uniforms.uBigWavesFrequency.value, 'x', 0, 10, 0.01).name('Freq X');
            folder.add(this.material.uniforms.uBigWavesFrequency.value, 'y', 0, 10, 0.01).name('Freq Z');
            folder.add(this.material.uniforms.uBigWavesSpeed, 'value', 0, 4, 0.01).name('Speed');
            folder.add(this.material.uniforms.uBigWavesSteepness, 'value', 0, 1, 0.01).name('Steepness');

            const colorFolder = this.debug.getFolder('World/Sea/Colors');

            colorFolder.addColor(this.material.uniforms.uDepthColor, 'value').name('Depth Color');
            colorFolder.addColor(this.material.uniforms.uSurfaceColor, 'value').name('Surface Color');
            colorFolder.add(this.material.uniforms.uColorOffset, 'value', 0, 1, 0.001).name('Offset');
            colorFolder.add(this.material.uniforms.uColorMultiplier, 'value', 0, 10, 0.001).name('Multiplier');
        }
    }

    setGeometry(){
        this.geometry = new THREE.PlaneGeometry(20, 20, 128, 128);
    }

    setMaterial(){
        this.material = new THREE.ShaderMaterial({
            vertexShader: seaVertexShader,
            fragmentShader: seaFragmentsShader,
            uniforms: {
                uTime: { value: 0 },
                uBigWavesElevation: { value: 0.2 },
                uBigWavesFrequency: { value: new THREE.Vector2(4, 1.5) }, // X e Z
                uBigWavesSpeed: { value: 0.75 },
                uBigWavesSteepness: { value: 0.5 },

                uDepthColor: { value: new THREE.Color('#1e3f5a') },
                uSurfaceColor: { value: new THREE.Color('#4d9aaa') },
                uColorOffset: { value: 0.08 },
                uColorMultiplier: { value: 5.0 }
            },
            wireframe: false 
        });
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