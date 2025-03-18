import { vars } from "./main.js";

let tracks = null;

fetch('../../assets/tracks/registry.json')
    .then(response => response.json())
    .then(data => {
        console.log(data);
        tracks = data;
        ready();
    })
    .catch(error => console.error('Unable to retrieve track registry :', error));

function setup() {

}



function ready() {
    let audio = new Audio();
    audio.volume = 1;
    let playedtracks = 0;
    let fadeDuration = 750;

    function fadeIn(audio) {
        let currentVolume = 0;
        audio.volume = currentVolume;
        let fadeInInterval = setInterval(() => {
            currentVolume += 0.01;
            if (currentVolume < 1) {
                audio.volume = currentVolume;
            } else {
                clearInterval(fadeInInterval);
            }
        }, fadeDuration);
    }

    function fadeOut(audio) {
        let currentVolume = audio.volume;
        let fadeOutInterval = setInterval(() => {
            currentVolume -= 0.01;
            if (currentVolume > 0) {
                audio.volume = currentVolume;
            } else {
                clearInterval(fadeOutInterval);
                audio.pause();
            }
        }, fadeDuration);
    }

    async function play() {
        playedtracks++;
        if (!audio.paused) {
            //audio.pause();
            fadeOut(audio);
        }

        setTimeout(async () => {
            console.log("../../assets/tracks/" + tracks[playedtracks].file.track);
             audio.src = "../../assets/tracks/" + tracks[playedtracks].file.track;
            await audio.play();
        },  fadeDuration);

       
    }

    const buttonStart = document.getElementById('button_action');
    buttonStart.addEventListener('click', () => {
        if (audio.paused) {
            play();
            setInterval(() => play(), vars.data.turnTime);
            buttonStart.textContent = '⏸️ Pause';
        } else {
            audio.pause();
            buttonStart.textContent = '▶️ Play';
        }
    });
}



export default { setup };