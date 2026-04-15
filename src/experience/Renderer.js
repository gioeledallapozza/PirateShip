import * as THREE from 'three'
import Experience from './Experience.js'
// import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
// import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
// import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
// import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js'

export default class Renderer {
    constructor() {
        this.experience = new Experience()
        this.debug = this.experience.debug
        this.canvas = this.experience.canvas
        this.sizes = this.experience.sizes
        this.scene = this.experience.scene
        this.camera = this.experience.camera

        this.setInstance()
        this.setComposer()
        this.setDebug()
    }

    setInstance() {
        this.instance = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            alpha: false //background css
        })

        //Settings
        this.instance.outputColorSpace = THREE.SRGBColorSpace


        // this.instance.outputColorSpace = THREE.LinearSRGBColorSpace
        this.instance.toneMapping = THREE.ACESFilmicToneMapping 
        // this.instance.toneMappingExposure = 1.75
        this.instance.toneMappingExposure = 1.0

        this.instance.shadowMap.enabled = true
        this.instance.shadowMap.type = THREE.PCFShadowMap
        
        this.instance.setSize(this.sizes.width, this.sizes.height)
        this.instance.setPixelRatio(this.sizes.pixelRatio)
    }

    setComposer(){

        //POST-PROCESSING
    //     const renderTarget = new THREE.WebGLRenderTarget(
    //     this.sizes.width,
    //     this.sizes.height,
    //     {
    //         samples: 4,
    //         type: THREE.HalfFloatType, // <--- FONDAMENTALE per ACESFilmic e Bloom
    //         format: THREE.RGBAFormat,
    //         colorSpace: THREE.LinearSRGBColorSpace,
    //     }
    // )

    //     this.composer = new EffectComposer(this.instance, renderTarget)
    //     this.composer.setPixelRatio(this.sizes.pixelRatio)
    //     this.composer.setSize(this.sizes.width, this.sizes.height)


    //     const renderPass = new RenderPass(this.scene, this.camera.instance)
    //     this.composer.addPass(renderPass)

        // this.bloomPass = new UnrealBloomPass(
        //     new THREE.Vector2(this.sizes.width, this.sizes.height),
        //     1.5,  // Strength
        //     0.4,  // Radius
        //     1.0   // Threshold
        // )
        // this.composer.addPass(this.bloomPass)

        // this.outputPass = new OutputPass()
        // this.composer.addPass(this.outputPass)
    }

    setDebug(){
        if(this.debug.active){
            const debugFolder = this.debug.getFolder('Renderer')
            debugFolder.close();

            if(this.bloomPass) {
                debugFolder.add(this.bloomPass, 'strength').min(0).max(3).step(0.01).name('Bloom strength')
                debugFolder.add(this.bloomPass, 'radius').min(0).max(1).step(0.01).name('Bloom radius')
                debugFolder.add(this.bloomPass, 'threshold').min(0).max(2).step(0.01).name('Bloom threshold')
            }
        }
    }

    resize() {
        this.instance.setSize(this.sizes.width, this.sizes.height)
        this.instance.setPixelRatio(this.sizes.pixelRatio)
    }

    update() {
        this.instance.render(this.scene, this.camera.instance)
        // this.composer.render()
    }
}