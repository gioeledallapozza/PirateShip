import * as THREE from 'three';
import Experience from '../Experience.js';
import gsap from 'gsap';

export default class Overlay {
    constructor() {
        this.experience = new Experience();
        this.scene = this.experience.scene;

        this.setGeometry();
        this.setMaterial();
        this.setMesh();
    }

    setGeometry() {
        this.geometry = new THREE.PlaneGeometry(2, 2, 1, 1);
    }

    setMaterial() {
        this.material = new THREE.ShaderMaterial({
            transparent: true,
            uniforms: {
                uAlpha: { value: 1.0 } // 1.0 = Black
            },
            vertexShader: `
                void main() {
                    gl_Position = vec4(position, 1.0); //Not use projectedMatrix or viewMatrix so is infront of the camera
                }
            `,
            fragmentShader: `
                uniform float uAlpha;
                void main() {
                    gl_FragColor = vec4(0.0, 0.0, 0.0, uAlpha);
                }
            `
        });
    }

    setMesh() {
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.scene.add(this.mesh);
    }

    /*
    * Event Manager
    */

    fade() {
        gsap.to(this.material.uniforms.uAlpha, {
            duration: 1.5,
            value: 0,
            ease: "power2.inOut",
            onComplete: () => {
                // Pulizia della memoria
                this.geometry.dispose();
                this.material.dispose();
                this.scene.remove(this.mesh);
            }
        });
    }
}