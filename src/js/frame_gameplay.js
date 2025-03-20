import { vars } from "./main.js";

const gameplay = document.getElementById("gameplay");
const timer_ring = document.getElementById("timer_ring");
const timer_value = document.getElementById("timer_value");
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

fetch('../../assets/tracks/registry.json')
    .then(response => response.json())
    .then(data => {
        console.log(data);
        vars.tracks = data;
    })
    .catch(error => console.error('Unable to retrieve tracks registry :', error));

/*
async function playTrack(audioContext, url) {
    console.log('Load track: ' + url);
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    return await audioContext.decodeAudioData(arrayBuffer);
}

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
}*/

// AUDIO MANAGEMENT TRACK

function handleDisplay() {
    if (!vars.tracks.length) throw new Error("Tracks is not initialized");
    const currentRound = vars.ingame.currentRound;

     // SETUP GAMEPLAY ELEMENT
     gameplay.dataset.playersNumber = vars.params.players.number;

    // SETUP TIMER
    timer_value.textContent = String(vars.params.rounds.duration) + "s";
 
    // RESET PLAYER SCORES
    currentRound.players[1].score = 0;
    currentRound.players[2].score = 0;

    // RESET PLAYER READY
    currentRound.players[1].isReady = false;
    currentRound.players[2].isReady = false;

    // SETUP PLAYERBOX
    playerbox_1.style.removeProperty("display");
    if (vars.params.players.number=== 2) {
        playerbox_2.style.removeProperty("display");
    }

    // SETUP PLAYERBOX READYBOX
    playerbox_1_readybox.style.removeProperty("display");
    playerbox_2_readybox.style.removeProperty("display");

    // SETUP PLAYERBOX PSEUDO
    setPlayerBoxPseudo(1, vars.params.players[1].pseudo);
    setPlayerBoxPseudo(2, vars.params.players[2].pseudo);
}

export default { handleDisplay };

async function loadTrack(audioContext, url) {
    console.log("Load track: " + url);
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    return await audioContext.decodeAudioData(arrayBuffer);
}

function playTrack(audioContext, buffer, fadeInTime = 1) {
    console.log("Play track");
    const source = audioContext.createBufferSource();
    source.buffer = buffer;

    const gainNode = audioContext.createGain();
    gainNode.gain.setValueAtTime(0, audioContext.currentTime); // Commence à 0 (silence)

    gainNode.gain.linearRampToValueAtTime(1, audioContext.currentTime + fadeInTime);

    source.connect(gainNode);
    gainNode.connect(audioContext.destination);

    source.start();
    return { source, gainNode };
}

function stopTrack(audioContext, source, gainNode, fadeOutTime = 1) {
    console.log("Stop track");
    const now = audioContext.currentTime;
    gainNode.gain.setValueAtTime(gainNode.gain.value, now);
    gainNode.gain.linearRampToValueAtTime(0, now + fadeOutTime);

    setTimeout(() => source.stop(), fadeOutTime * 1000);
}

// GAMELOOP

async function gameloop() {
    const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    const audioContext = new AudioContext();
    const currentRound = vars.ingame.currentRound;
    const previousTracks = vars.ingame.previousTracks;

    for (let i = 1; i <= vars.params.rounds.number; i++) {
        console.log(`Tour : ${i}`);

        // GET VALIDATE TRACK
        const availableTracks = vars.tracks.filter((track) => {
            if (vars.params.genres.has("random")) return (true);
            return (!previousTracks.has(track.title)
                && track.genres.some(genre => vars.params.genres.has(genre)));
        });
        const validateTrackIndex = Math.floor(Math.random() * availableTracks.length);
        const validateTrack = availableTracks[validateTrackIndex];

        // GET INVALIDATE TRACK
        const similarTracks = vars.tracks.filter((track) => {
            return (track.title !== validateTrack.title
                && track.genres.some(genre => validateTrack.genres.includes(genre)));
        });
        const invalidateTrackIndex = Math.floor(Math.random() * similarTracks.length);
        const invalidateTrack = similarTracks[invalidateTrackIndex];

        // SET PREVIOUS TRACKS
        previousTracks.add(validateTrack.title);

        // SET ROUND TRACKS
        currentRound.validateTrack = validateTrack;
        currentRound.invalidateTrack = invalidateTrack;

        console.log(currentRound);

        // SET SELECTABLE TITLE
        const validatePosition = Math.floor(Math.random() * 2);
        currentRound.validateTrackPosition = validatePosition;
        if (validatePosition === 0) {
            setPlayerBoxSelectValue(1, currentRound.validateTrack.title, currentRound.invalidateTrack.title);
            setPlayerBoxSelectValue(2, currentRound.validateTrack.title, currentRound.invalidateTrack.title);
        } else {
            setPlayerBoxSelectValue(1, currentRound.invalidateTrack.title, currentRound.validateTrack.title);
            setPlayerBoxSelectValue(2, currentRound.invalidateTrack.title, currentRound.validateTrack.title);
        }

        // PLAY VALIDATE TRACK
        const currentTrackBuffer = await loadTrack(audioContext, "../../assets/tracks/" + validateTrack.file.track);
        const { source: currentTrackSource, gainNode: currentTrackGain } = playTrack(audioContext, currentTrackBuffer, 2);

        vars.ingame.currentState = "WAIT_SELECT";
        await wait(vars.params.rounds.duration * 1000);
        vars.ingame.currentState = "DISPLAY_RESULT";

        stopTrack(audioContext, currentTrackSource, currentTrackGain, 2);
    }
}

// PLAYER MANAGEMENT GLOBAL

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

// PLAYER MANAGEMENT READY

/**
 * @param {1 | 2} playerIndex 
 * @param {"enable" | "disable"} state
 */
function setPlayerBoxReadyButton(playerIndex, state) {
    const playerbox_1_readybox_button = playerbox_1_readybox.querySelector("[name='ready']");
    const playerbox_2_readybox_button = playerbox_2_readybox.querySelector("[name='ready']");
   
    const buttonTarget = playerIndex === 1 ? playerbox_1_readybox_button : playerbox_2_readybox_button;
    if (state === "enable") {
        buttonTarget.style.opacity = "1";
        buttonTarget.style.removeProperty("pointer-events");
    } else if (state === "disable") {
        buttonTarget.style.opacity = "0.7";
        buttonTarget.style.pointerEvents = "none";
    }
}

/**
 * @param {1 | 2} playerIndex 
 * @param {HTMLElement} buttonTarget
 */
function playerReady(playerIndex) {
    const currentRound = vars.ingame.currentRound;

    if (currentRound.players[playerIndex].isReady) return ;

    currentRound.players[playerIndex].isReady = true;
    setPlayerBoxReadyButton(playerIndex, "disable");

    // CHECK ALL READY
    if (vars.params.players.number === 2 &&
        (!currentRound.players[1].isReady || !currentRound.players[2].isReady)) return ;

    playerbox_1_readybox.style.display = "none";
    playerbox_2_readybox.style.display = "none";

    playerbox_1_selectbox.style.removeProperty("display");
    if (vars.params.players.number === 2) {
        playerbox_2_selectbox.style.removeProperty("display");
    }

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
 * @param {"enable" | "disable"} state
 */
function setPlayerBoxSelectButton(playerIndex, state) {
    const playerbox_1_selectbox_button_1 = playerbox_1_selectbox.querySelector("[name='select_1']");
    const playerbox_1_selectbox_button_2 = playerbox_1_selectbox.querySelector("[name='select_1']");
    const playerbox_2_selectbox_button_1 = playerbox_2_selectbox.querySelector("[name='select_2']");
    const playerbox_2_selectbox_button_2 = playerbox_2_selectbox.querySelector("[name='select_2']");
   
    const button_1_target = playerIndex === 1 ? playerbox_1_selectbox_button_1 : playerbox_2_selectbox_button_1;
    const button_2_target = playerIndex === 1 ? playerbox_1_selectbox_button_2 : playerbox_2_selectbox_button_2;
    if (state === 1) {
        button_1_target.style.opacity = "1";
        button_1_target.style.removeProperty("pointer-events");
        button_2_target.style.opacity = "1";
        button_2_target.style.removeProperty("pointer-events");
    } else if (state === 2) {
        button_1_target.style.opacity = "0.7";
        button_1_target.style.pointerEvents = "none";
        button_2_target.style.opacity = "0.7";
        button_2_target.style.pointerEvents = "none";
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