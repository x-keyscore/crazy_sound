import { vars } from "./main.js";

const playerbox_1 = document.getElementById("playerbox_1");
const playerbox_2 = document.getElementById("playerbox_2");
const playerbox_1_readybox = document.getElementById("playerbox_1_readybox");
const playerbox_2_readybox = document.getElementById("playerbox_2_readybox");
const playerbox_1_selectbox = document.getElementById("playerbox_1_selectbox");
const playerbox_2_selectbox = document.getElementById("playerbox_2_selectbox");
const playerbox_1_selectbox_1 = playerbox_1_selectbox.querySelector("[name='select_1']");
const playerbox_1_selectbox_2 = playerbox_1_selectbox.querySelector("[name='select_2']");
const playerbox_2_selectbox_1 = playerbox_2_selectbox.querySelector("[name='select_1']");
const playerbox_2_selectbox_2 = playerbox_2_selectbox.querySelector("[name='select_2']");

let audioContext = null;
let audioBuffer = null;
let audioSource = null;
let state = "WAIT_READY";

fetch('../../assets/tracks/registry.json')
    .then(response => response.json())
    .then(data => {
        console.log(data);
        vars.data.tracks = data;
    })
    .catch(error => console.error('Unable to retrieve tracks registry :', error));

async function loadMP3(url) {
   try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        console.log('MP3 fetching');
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        console.log('MP3 fetched');

        audioSource = audioContext.createBufferSource();
        audioSource.buffer = audioBuffer;
        audioSource.connect(audioContext.destination);
        audioSource.start(0);
        console.log('On reading...');
    } catch (error) {
        console.error('MP3 fetch error :', error);
    }
}

const timerValue = document.getElementById("timer_value");
const timerRing = document.getElementById("timer_ring");

function setup() {
    if (!vars.data.tracks.length) throw new Error("Tracks is not initialized");

    // SETUP TIMER
    timerValue.textContent = String(vars.data.round.time) + "s";

    // SETUP SCORES
    vars.data.players[1].score = 0;
    vars.data.players[2].score = 0;

    // SETUP PLAYER READY
    vars.data.players[1].isReady = false;
    vars.data.players[2].isReady = false;

    // SETUP PLAYERBOX
    playerbox_1.style.removeProperty("display");
    if (vars.data.playersCount === 2) {
        playerbox_2.style.removeProperty("display");
    }

    // SETUP PLAYERBOX READYBOX
    playerbox_1_readybox.style.removeProperty("display");
    if (vars.data.playersCount === 2) {
        playerbox_2_readybox.style.removeProperty("display");
    }

    // SETUP PLAYERBOX PSEUDO
    playerbox_1_readybox.querySelector("[name='pseudo']").textContent = vars.data.players[1].pseudo;
    playerbox_1_selectbox.querySelector("[name='pseudo']").textContent = vars.data.players[1].pseudo;
    if (vars.data.playersCount === 2) {
        playerbox_2_readybox.querySelector("[name='pseudo']").textContent = vars.data.players[2].pseudo;
        playerbox_2_selectbox.querySelector("[name='pseudo']").textContent = vars.data.players[2].pseudo;
    }

    // SETUP DATA ROUND
    vars.data.round.roundFinish = 0;
    if (vars.data.genres.has("random")) {
        vars.data.round.tracks = vars.data.tracks;
    } else {
        vars.data.round.tracks = vars.data.tracks.filter((track) => {
            return (track.genres.some(genre => vars.data.genres.has(genre)));
        });
    }
}

function gameloop() {
    // RETRIVE VALIDATE TRACK
    const roundTracks = vars.data.round.tracks;
    const validateTrackIndex = Math.floor(Math.random() * roundTracks.length);
    const validateTrack = roundTracks[validateTrackIndex];

     // RETRIVE INVALIDATE TRACK
    const proposableTracks = vars.data.tracks.filter((track) => {
        return (track.title !== validateTrack.title
            && track.genres.some(genre => validateTrack.genres.includes(genre)));
    });
    const invalidateTrackIndex = Math.floor(Math.random() * proposableTracks.length);
    const invalidateTrack = proposableTracks[invalidateTrackIndex];

    vars.data.round.current.titleValidate = validateTrack.title;
    vars.data.round.current.titleInvalidate = invalidateTrack.title;

    console.log(vars.data.round.current);

    // SET SELECTABLE TITLE
    const validatePosition = Math.floor(Math.random() * 2);
    const playerbox_1_selectbox_1_span = playerbox_1_selectbox_1.querySelector("span");
    const playerbox_1_selectbox_2_span = playerbox_1_selectbox_2.querySelector("span");
    const playerbox_2_selectbox_1_span = playerbox_2_selectbox_1.querySelector("span");
    const playerbox_2_selectbox_2_span = playerbox_2_selectbox_2.querySelector("span");
    if (validatePosition === 0) {
        playerbox_1_selectbox_1_span.textContent = vars.data.round.current.titleValidate;
        playerbox_1_selectbox_2_span.textContent = vars.data.round.current.titleInvalidate;
        playerbox_2_selectbox_1_span.textContent = vars.data.round.current.titleValidate;
        playerbox_2_selectbox_2_span.textContent = vars.data.round.current.titleInvalidate;
    } else {
        playerbox_1_selectbox_1_psan.textContent = vars.data.round.current.titleInvalidate;
        playerbox_1_selectbox_2_span.textContent = vars.data.round.current.titleValidate;
        playerbox_2_selectbox_1_span.textContent = vars.data.round.current.titleInvalidate;
        playerbox_2_selectbox_2_span.textContent = vars.data.round.current.titleValidate;
    }

    loadMP3("../../assets/tracks/" + validateTrack.file.track);
}

// PLAYER MANAGEMENT READY

function playerReady(playerIndex, buttonTarget) {
    if (vars.data.players[playerIndex].isReady) return ;
    vars.data.players[playerIndex].isReady = true;
    buttonTarget.style.opacity = "0.7";
    buttonTarget.style.pointerEvents = "none";

    // CHECK ALL READY
    const player_1 = vars.data.players[1];
    const player_2 = vars.data.players[2];
    if (vars.data.playersCount === 2 && (!player_1.isReady || !player_2.isReady)) return ;

    playerbox_1_readybox.style.display = "none";
    playerbox_2_readybox.style.display = "none";

    playerbox_1_selectbox.style.removeProperty("display");
    if (vars.data.playersCount === 2) {
        playerbox_2_selectbox.style.removeProperty("display");
    }

    state = "WAIT_SELECT";
    gameloop();
}

playerbox_1_readybox.addEventListener("click", (e) => {
    const buttonTarget = e.target.closest("button");
    if (!buttonTarget) return;
    if (vars.data.players[1].isReady) return ;

    playerReady(1, buttonTarget);
})

playerbox_2_readybox.addEventListener("click", (e) => {
    const buttonTarget = e.target.closest("button");
    if (!buttonTarget) return;
    if (vars.data.players[2].isReady) return ;

    playerReady(2, buttonTarget);
})

// PLAYER MANAGEMENT SELECT

/**
 * @param {1 | 2} playerIndex 
 * @param {"select_1" | "select_2" | "ready"} selectPosition 
 */
function playerSelect(playerIndex, selectPosition) {
    
}

playerbox_1_selectbox.addEventListener("click", (e) => {
    const buttonTarget = e.target.closest("button");
    if (!buttonTarget) return;
    
})

playerbox_2_selectbox.addEventListener("click", (e) => {
    const buttonTarget = e.target.closest("button");
    if (!buttonTarget) return;
    
})

// PLAYER MANAGEMENT KEYS

export default { setup };