import GUI from 'lil-gui';

export default class Debug {
    constructor() {
        this.active = window.location.hash === '#debug';
        this.folders = {}; // Cache for storing folders

        if (this.active) {
            this.ui = new GUI();
            this.ui.title = '🏴‍☠️ Pirate Debug';
        }
    }

    /**
     * Create or get a folder based on the path
     */
    getFolder(path) {
        if (!this.active) return null;

        const parts = path.split('/');
        let currentFolder = this.ui;
        let currentPath = '';

        parts.forEach((part, index) => {
            currentPath += (currentPath ? '/' : '') + part;

            if (!this.folders[currentPath]) {
                const newFolder = currentFolder.addFolder(part);
                
                //Add indentation
                if (index > 0) {
                    const indent = index * 12;
                    newFolder.domElement.style.marginLeft = `${indent}px`;
                    newFolder.domElement.style.borderLeft = '1px solid rgba(255, 255, 255, 0.2)';
                    newFolder.domElement.style.paddingLeft = '4px';
                }

                this.folders[currentPath] = newFolder;
            }
            currentFolder = this.folders[currentPath];
        });

        return currentFolder;
    }
}