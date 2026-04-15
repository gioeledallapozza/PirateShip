import Experience from './experience/Experience.js'

const experience = new Experience(document.querySelector('canvas.webgl'));

const startBtn = document.getElementById('start-experience')
const uiWrapper = document.getElementById('ui-wrapper')
const mainHeader = document.getElementsByClassName('main-header')

//Add event listener to start
startBtn.addEventListener('click', () => {
    experience.start()
    uiWrapper.classList.add('hidden') 
    mainHeader.item(0).classList.add('hidden') 
})