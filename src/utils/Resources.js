import * as THREE from 'three'
import EventEmitter from "./EventEmitter.js"
import sources from '../experience/sources.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'


export default class Resources extends EventEmitter 
{
    constructor(){
        super()

        //Options
        this.sources = sources

        //Setup
        this.items = {}
        this.toLoad = this.sources.length
        this.loaded = 0

        this.setLoaders()
        this.startLoading()
    }

    setLoaders(){
        this.loaders = {}

        const dracoLoader = new DRACOLoader()
        dracoLoader.setDecoderPath('/draco/') 

        this.loaders.gltfLoader = new GLTFLoader()
        this.loaders.gltfLoader.setDRACOLoader(dracoLoader)
        this.loaders.textureLoader = new THREE.TextureLoader()
    }

    startLoading(){
        //loop through each source
       for (const source of this.sources) {
            if (source.type === 'texture') {
                this.loaders.textureLoader.load(
                    source.path,
                    (file) => {
                        this.sourceLoaded(source, file)
                    }
                )
            }
            else if (source.type === 'gltfModel') {
                this.loaders.gltfLoader.load(
                    source.path,
                    (file) => { 
                        this.sourceLoaded(source, file)
                     },
                    null,
                    (error) => { console.error(`Errore caricamento modello: ${source.path}`, error) }
                )
            }
        }
    }

    sourceLoaded(source, file){
       if (source.name === 'waterNormal' || source.name === 'foamTexture' ) {
            file.wrapS = THREE.RepeatWrapping
            file.wrapT = THREE.RepeatWrapping
        }

        this.items[source.name] = file
        this.loaded++

        if (this.loaded === this.toLoad) {
            this.trigger('ready')
        }
    }
}