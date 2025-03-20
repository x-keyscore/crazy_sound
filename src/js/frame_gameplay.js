import { vars } from "./main.js";

const gameplay = document.getElementById("gameplay");
const timerRing = document.getElementById("timer_ring");
const timerValue = document.getElementById("timer_value");
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
        vars.tracks = data;
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

function handleDisplay() {
    if (!vars.tracks.length) throw new Error("Tracks is not initialized");

    // SETUP TIMER
    timerValue.textContent = String(vars.params.rounds.timeRounds) + "s";

    // SETUP GAMEPLAY ELEMENT
    gameplay.dataset.totalPlayers = vars.params.players.totalPlayers;

    // RESET PLAYER SCORES
    vars.ingame.round.players[1].score = 0;
    vars.ingame.round.players[2].score = 0;

    // RESET PLAYER READY
    vars.ingame.round.players[1].isReady = false;
    vars.ingame.round.players[2].isReady = false;

    // SETUP PLAYERBOX
    playerbox_1.style.removeProperty("display");
    if (vars.params.players.totalPlayers === 2) {
        playerbox_2.style.removeProperty("display");
    }

    // SETUP PLAYERBOX READYBOX
    playerbox_1_readybox.style.removeProperty("display");
    playerbox_2_readybox.style.removeProperty("display");

    // SETUP PLAYERBOX PSEUDO
    setPlayerBoxPseudo(1, vars.params.players[1].pseudo);
    setPlayerBoxPseudo(2, vars.params.players[2].pseudo);

    // SETUP ROUND GENRES
    if (vars.params.genres.has("random")) {
        vars.ingame.availableTracks = vars.tracks;
    } else {
        vars.ingame.availableTracks = vars.tracks.filter((track) => {
            return (track.genres.some(genre => vars.params.genres.has(genre)));
        });
    }
}

function gameloop() {
    const round = vars.ingame.round;

    // RETRIVE VALIDATE TRACK
    const availableTracks = vars.ingame.availableTracks;
    const validateTrackIndex = Math.floor(Math.random() * availableTracks.length);
    const validateTrack = availableTracks[validateTrackIndex];

    // RETRIVE INVALIDATE TRACK
    const similarTracks = vars.tracks.filter((track) => {
        return (track.title !== validateTrack.title
            && track.genres.some(genre => validateTrack.genres.includes(genre)));
    });
    const invalidateTrackIndex = Math.floor(Math.random() * similarTracks.length);
    const invalidateTrack = similarTracks[invalidateTrackIndex];

    // STORAGE ROUND TRACK
    round.validateTrack = validateTrack;
    round.invalidateTrack = invalidateTrack;

    console.log(round);

    // SET SELECTABLE TITLE
    const validatePosition = Math.floor(Math.random() * 2);
    round.validateTrackPosition = validatePosition;
    if (validatePosition === 0) {
        setPlayerBoxSelectValue(1, round.validateTrack.title, round.invalidateTrack.title);
        setPlayerBoxSelectValue(2, round.validateTrack.title, round.invalidateTrack.title);
    } else {
        setPlayerBoxSelectValue(1, round.invalidateTrack.title, round.validateTrack.title);
        setPlayerBoxSelectValue(2, round.invalidateTrack.title, round.validateTrack.title);
    }

    loadMP3("../../assets/tracks/" + validateTrack.file.track);
}

// PLAYER MANAGEMENT READY

/**
 * @param {1 | 2} playerIndex 
 * @param {HTMLElement} buttonTarget
 */
function playerReady(playerIndex) {
    const round = vars.ingame.round;

    if (round.players[playerIndex].isReady) return ;

    round.players[playerIndex].isReady = true;
    setPlayerBoxReadyButton(playerIndex, "disable");

    // CHECK ALL READY
    if (vars.params.players.totalPlayers === 2 &&
        (!round.players[1].isReady || !round.players[2].isReady)) return ;

    playerbox_1_readybox.style.display = "none";
    playerbox_2_readybox.style.display = "none";

    playerbox_1_selectbox.style.removeProperty("display");
    if (vars.params.players.totalPlayers === 2) {
        playerbox_2_selectbox.style.removeProperty("display");
    }

    state = "WAIT_SELECT";
    gameloop();
}

playerbox_1_readybox.addEventListener("click", (e) => {
    const buttonTarget = e.target.closest("button");
    if (!buttonTarget) return;

    playerReady(1);
})

playerbox_2_readybox.addEventListener("click", (e) => {
    const buttonTarget = e.target.closest("button");
    if (!buttonTarget) return;

    playerReady(2);
})

// PLAYER MANAGEMENT SELECT

function setPlayerBoxPseudo(playerIndex, pseudo) {
    if (playerIndex === 1) {
        const playerbox_1_readybox_pseudo = playerbox_1_readybox.querySelector("[name='pseudo']");
        const playerbox_1_selectbox_pseudo = playerbox_1_selectbox.querySelector("[name='pseudo']");

        playerbox_1_readybox_pseudo.textContent = pseudo;
        playerbox_1_selectbox_pseudo.textContent = pseudo;
    } else if (playerIndex === 2) {
        const playerbox_2_readybox_pseudo = playerbox_2_readybox.querySelector("[name='pseudo']");
        const playerbox_2_selectbox_pseudo = playerbox_2_selectbox.querySelector("[name='pseudo']");

        playerbox_2_readybox_pseudo.textContent = pseudo;
        playerbox_2_selectbox_pseudo.textContent = pseudo;
    }
}

/**
 * @param {1 | 2} playerIndex 
 * @param {"enable" | "disable"} state
 */
function setPlayerBoxReadyButton(playerIndex, state) {
    const playerbox_1_readybox_button = playerbox_1_readybox.querySelector("[name='ready']");
    const playerbox_2_readybox_button = playerbox_2_readybox.querySelector("[name='ready']");
   
    const buttonTarget = playerIndex === 1 ? playerbox_1_readybox_button : playerbox_2_readybox_button;
    if (state === 1) {
        buttonTarget.style.opacity = "1";
        buttonTarget.style.removeProperty("pointer-events");
    } else if (state === 2) {
        buttonTarget.style.opacity = "0.7";
        buttonTarget.style.pointerEvents = "none";
    }
}

function setPlayerBoxSelectValue(playerIndex, value_1, value_2) {
    if (playerIndex === 1) {
        const playerbox_1_selectbox_1_span = playerbox_1_selectbox_1.querySelector("span");
        const playerbox_1_selectbox_2_span = playerbox_1_selectbox_2.querySelector("span");

        playerbox_1_selectbox_1_span.textContent = value_1;
        playerbox_1_selectbox_2_span.textContent = value_2;
    } else if (playerIndex === 2) {
        const playerbox_2_selectbox_1_span = playerbox_2_selectbox_1.querySelector("span");
        const playerbox_2_selectbox_2_span = playerbox_2_selectbox_2.querySelector("span");

        playerbox_2_selectbox_1_span.textContent = value_1;
        playerbox_2_selectbox_2_span.textContent = value_2;
    }
}

/**
 * @param {1 | 2} playerIndex
 * @param {"select_1" | "select_2"} selectPosition 
 */
function playerSelect(playerIndex, selectPosition) {

}

playerbox_1_selectbox.addEventListener("click", (e) => {
    const buttonTarget = e.target.closest("button");
    if (!buttonTarget) return;

    playerSelect(1, buttonTarget.name);
})

playerbox_2_selectbox.addEventListener("click", (e) => {
    const buttonTarget = e.target.closest("button");
    if (!buttonTarget) return;
    
    playerSelect(2, buttonTarget.name);
})

// PLAYER MANAGEMENT KEYS

// ...Daph

export default { handleDisplay };