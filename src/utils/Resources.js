import * as THREE from 'three'
import EventEmitter from "./EventEmitter.js"
import sources from '../experience/sources.js'


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

        // this.loaders.gltfLoader = new GLTFLoader()
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
                },
                null,
                (error) => {
                    console.error(`Errore nel caricamento della risorsa: ${source.path}`, error)
                }
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