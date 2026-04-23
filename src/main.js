import Experience from './experience/Experience.js'

const experience = new Experience(document.querySelector('canvas.webgl'));

const startBtn = document.getElementById('start-experience')
const exitBtn = document.getElementById('exit-experience')
const uiWrapper = document.getElementById('ui-wrapper')
const mainHeader = document.getElementsByClassName('main-header')

//Add event listener to start
startBtn.addEventListener('click', () => {
    experience.start()
    uiWrapper.classList.add('hidden') 
    mainHeader.item(0).classList.add('hidden') 
})

if(exitBtn) {
    exitBtn.addEventListener('click', () => {
        experience.exit()
        uiWrapper.classList.remove('hidden') 
        mainHeader.item(0).classList.remove('hidden') 
        
        exitBtn.classList.add('hidden') 
    })
}