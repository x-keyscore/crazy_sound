import { vars } from "./main.js";

const gameplay = document.getElementById("gameplay");
const cover_blur = document.getElementById("cover_blur");
const cover_picture = document.getElementById("cover_picture");
const timer = document.getElementById("timer");
const timer_value = document.getElementById("timer_value");
const timer_ring_progress = document.getElementById("timer_ring_progress");
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
const playerbox_1_resultbox = document.getElementById("playerbox_1_resultbox");
const playerbox_2_resultbox = document.getElementById("playerbox_2_resultbox");

fetch("/crazy_sound" + "/assets/tracks/registry.json")
        .then(response => {
            console.log(response);
            return (response.json());
        })
        .then(data => vars.tracks = data)
        .catch(error => console.error('Unable to retrieve tracks registry :', error));

function handleDisplay() {
    if (!vars.tracks.length) throw new Error("Tracks is not initialized");
    const sessionRound = vars.ingame.sessionRound;
    const currentRound = vars.ingame.currentRound;

    // RESET INGAME STATE
    vars.ingame.currentState = "WAIT_READY";

    // SETUP TIMER VALUE
    timer_value.textContent = "Tour 1";

    // SETUP GAMEPLAY ELEMENT
    gameplay.dataset.playersNumber = vars.params.players.number;

    // RESET PREVIOUS TRACKS
    vars.ingame.previousTracks = new Set();

    // RESET PLAYER "isReady"
    sessionRound.players[1].isReady = false;
    sessionRound.players[2].isReady = false;

    // RESET PLAYER "totalScore"
    sessionRound.players[1].totalScore = 0;
    sessionRound.players[2].totalScore = 0;

    // RESET PLAYER "hasSelect"
    currentRound.players[1].hasSelect = false;
    currentRound.players[2].hasSelect = false;

    // RESET PLAYER "score"
    currentRound.players[1].score = 0;
    currentRound.players[2].score = 0;

    // RESET TIMER FADE
    timer.style.removeProperty("animation");
    void timer.offsetWidth;

    // RESET RING PROGRESS
    timer_ring_progress.style.removeProperty("animation");
    void timer_ring_progress.offsetWidth;

    // SETUP PLAYERBOX
    playerbox_1.style.removeProperty("display");
    if (vars.params.players.number === 2) {
        playerbox_2.style.removeProperty("display");
    } else {
        playerbox_2.style.display = "none";
    }

    // SETUP PLAYERBOX PSEUDO
    setPlayerBoxPseudo(1, vars.params.players[1].pseudo);
    setPlayerBoxPseudo(2, vars.params.players[2].pseudo);

    // SETUP PLAYERBOX READYBOX
    setPlayerBoxReadyBox(1, "view");
    setPlayerBoxReadyBox(2, "view");

    // SETUP PLAYERBOX READYBOX BUTTON
    setPlayerBoxReadyButton(1, "enable");
    setPlayerBoxReadyButton(2, "enable");

    // SETUP PLAYERBOX SELECTBOX
    setPlayerBoxSelectBox(1, "mask");
    setPlayerBoxSelectBox(2, "mask");

    // SETUP PLAYERBOX RESULTBOX
    setPlayerBoxResultBox(1, "mask");
    setPlayerBoxResultBox(2, "mask");
}

export default { handleDisplay };

// AUDIO MANAGEMENT TRACK

async function loadTrack(audioContext, url) {
    console.log("Load track");
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    return await audioContext.decodeAudioData(arrayBuffer);
}

function playTrack(audioContext, buffer, fadeInTime = 1) {
    console.log("Play track");
    const source = audioContext.createBufferSource();
    source.buffer = buffer;

    const gainNode = audioContext.createGain();
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);

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
    const sessionRound = vars.ingame.sessionRound;
    const currentRound = vars.ingame.currentRound;
    const previousTracks = vars.ingame.previousTracks;
    const displayResultDuration = 10000;

    for (let i = 1; i <= vars.params.rounds.number; i++) {
        // RESET SCORE DECREASE
        currentRound.scoreDecrease = 0;

        // RESET PLAYER "hasSelect"
        currentRound.players[1].hasSelect = false;
        currentRound.players[2].hasSelect = false;

        // RESET PLAYER "score"
        currentRound.players[1].score = 0;
        currentRound.players[2].score = 0;

        // HIDDEN PLAYER BOX RESULT
        setPlayerBoxResultBox(1, "mask");
        setPlayerBoxResultBox(2, "mask");

        // DISPLAY PLAYER BOX RESULT
        setPlayerBoxSelectBox(1, "view");
        setPlayerBoxSelectBox(2, "view");

        // ENABLE PLAYER BOX SELECT BUTTONS
        setPlayerBoxSelectButtons(1, "enable");
        setPlayerBoxSelectButtons(2, "enable");

        // GET VALIDATE TRACK
        const availableTracks = vars.tracks.filter((track) => {
            if (previousTracks.has(track.title)) return (false);
            if (vars.params.genres.has("random")) return (true);

            return (track.genres.some(genre => vars.params.genres.has(genre)));
        });

        const validateTrackIndex = Math.floor(Math.random() * availableTracks.length);
        const validateTrack = availableTracks[validateTrackIndex];

        // GET INVALIDATE TRACK
        const similarTracks = vars.tracks.filter((track) => {
            if (track.title === validateTrack.title) return (false);

            return (track.genres.some(genre => validateTrack.genres.includes(genre)));
        });
        const invalidateTrackIndex = Math.floor(Math.random() * similarTracks.length);
        const invalidateTrack = similarTracks[invalidateTrackIndex];

        // SET COVER
        cover_blur.src = "../../assets/tracks/" + validateTrack.file.cover;
        cover_picture.src = "../../assets/tracks/" + validateTrack.file.cover;

        // SET ROUND TRACKS
        currentRound.validateTrack = validateTrack;
        currentRound.invalidateTrack = invalidateTrack;

        // SET PREVIOUS TRACKS
        previousTracks.add(validateTrack.title);

        // SET SELECTABLE TITLE
        const validatePosition = Math.floor(Math.random() * 2);
        currentRound.validateTrackPosition = validatePosition + 1;
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

        // START RING PROGRESS
        timer_ring_progress.style.animation = `keyframe-timer-ring-progress ${vars.params.rounds.duration * 1000}ms linear forwards`;

        // SET CURRENT STATE
        vars.ingame.currentState = "WAIT_SELECT";

        await wait(vars.params.rounds.duration * 1000);

        // SET CURRENT STATE
        vars.ingame.currentState = "VIEW_RESULT";

        // SET PLAYER SCORE
        if (!currentRound.players[1].hasSelect) {
            currentRound.players[1].score +=  vars.params.scoreDecrease;
            sessionRound.players[1].totalScore += vars.params.scoreDecrease;
        }
        if (!currentRound.players[2].hasSelect) {
            currentRound.players[2].score +=  vars.params.scoreDecrease;
            sessionRound.players[2].totalScore += vars.params.scoreDecrease;
        }

        // SET PLAYER BOX RESULT SCORE AND TRACK
        setPlayerBoxResultBoxScoreAndTrack(1, currentRound.players[1].score, currentRound.validateTrack);
        if (vars.params.players.number === 2) {
            setPlayerBoxResultBoxScoreAndTrack(2, currentRound.players[2].score, currentRound.validateTrack);
        }

        // HIDDEN PLAYER BOX RESULT
        setPlayerBoxSelectBox(1, "mask");
        setPlayerBoxSelectBox(2, "mask");

        // DISPLAY PLAYER BOX RESULT
        setPlayerBoxResultBox(1, "view");
        if (vars.params.players.number === 2) {
            setPlayerBoxResultBox(2, "view");
        }

        if (previousTracks.size !== vars.params.rounds.number) {
            // START TIMER FADE
            timer.style.animation = `keyframe-timer-fade-loop ${displayResultDuration}ms ease-in-out forwards`;

            await wait(displayResultDuration / 2);

            // SETUP TIMER VALUE
            timer_value.textContent = "Tour " + (i + 1);

            // RESET RING PROGRESS
            timer_ring_progress.style.removeProperty("animation");
            void timer_ring_progress.offsetWidth;

            await wait(displayResultDuration / 2);

            // RESET TIMER FADE
            timer.style.removeProperty("animation");
            void timer.offsetWidth;

            stopTrack(audioContext, currentTrackSource, currentTrackGain, 2);
        } else {
            // START TIMER FADE FULL (The animation duration is in line with the css animation)
            timer.style.animation = `keyframe-timer-fade-simple ${displayResultDuration / 10}ms ease-in-out forwards`;

            await wait(displayResultDuration / 2);

            stopTrack(audioContext, currentTrackSource, currentTrackGain, 2);

            await wait(displayResultDuration / 4);
        }
    }

    // SET CURRENT STATE
    vars.ingame.currentState = "WAIT_CONFIG";

    frameTransition("gameplay", "scores", "fade", "back", 250);
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
 * @param {"view" | "mask"} state
 */
function setPlayerBoxReadyBox(playerIndex, state) {
    const elementTarget = playerIndex === 1 ? playerbox_1_readybox : playerbox_2_readybox;

    if (state === "view") {
        elementTarget.style.removeProperty("display");
    } else if (state === "mask") {
        elementTarget.style.display = "none";
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
    const sessionRound = vars.ingame.sessionRound;

    if (sessionRound.players[playerIndex].isReady) return;

    sessionRound.players[playerIndex].isReady = true;
    setPlayerBoxReadyButton(playerIndex, "disable");

    // CHECK ALL READY
    const player_1_isReady = sessionRound.players[1].isReady;
    const player_2_isReady = sessionRound.players[2].isReady;
    if (vars.params.players.number === 1 || (player_1_isReady && player_2_isReady)) {
        setPlayerBoxReadyBox(1, "mask");
        setPlayerBoxReadyBox(2, "mask");

        setPlayerBoxSelectBox(1, "view");
        if (vars.params.players.number === 2) {
            setPlayerBoxSelectBox(2, "view");
        }

        gameloop();
    }
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
 * @param {"view" | "mask"} state
 */
function setPlayerBoxSelectBox(playerIndex, state) {
    const elementTarget = playerIndex === 1 ? playerbox_1_selectbox : playerbox_2_selectbox;

    if (state === "view") {
        elementTarget.style.removeProperty("display");
    } else if (state === "mask") {
        elementTarget.style.display = "none";
    }
}

/**
 * @param {1 | 2} playerIndex 
 * @param {"enable" | "disable"} state
 */
function setPlayerBoxSelectButtons(playerIndex, state) {
    const playerbox_1_selectbox_button_1 = playerbox_1_selectbox.querySelector("[name='select_1']");
    const playerbox_1_selectbox_button_2 = playerbox_1_selectbox.querySelector("[name='select_2']");
    const playerbox_2_selectbox_button_1 = playerbox_2_selectbox.querySelector("[name='select_1']");
    const playerbox_2_selectbox_button_2 = playerbox_2_selectbox.querySelector("[name='select_2']");

    const button_1_target = playerIndex === 1 ? playerbox_1_selectbox_button_1 : playerbox_2_selectbox_button_1;
    const button_2_target = playerIndex === 1 ? playerbox_1_selectbox_button_2 : playerbox_2_selectbox_button_2;
    if (state === "enable") {
        button_1_target.style.opacity = "1";
        button_1_target.style.removeProperty("pointer-events");
        button_2_target.style.opacity = "1";
        button_2_target.style.removeProperty("pointer-events");
    } else if (state === "disable") {
        button_1_target.style.opacity = "0.7";
        button_1_target.style.pointerEvents = "none";
        button_2_target.style.opacity = "0.7";
        button_2_target.style.pointerEvents = "none";
    }
}

/**
 * @param {1 | 2} playerIndex
 * @param {1 | 2} selectPosition 
 */
function playerSelect(playerIndex, selectPosition) {
    if (vars.ingame.currentState !== "WAIT_SELECT") return;
    const sessionRound = vars.ingame.sessionRound;
    const currentRound = vars.ingame.currentRound;

    if (currentRound.players[playerIndex].hasSelect) return;

    if (selectPosition === currentRound.validateTrackPosition) {
        const scoreOfRound = vars.params.scoreIncrease;
        currentRound.players[playerIndex].score += scoreOfRound;
        sessionRound.players[playerIndex].totalScore += scoreOfRound;
    } else {
        const scoreOfRound = vars.params.scoreDecrease;
        currentRound.players[playerIndex].score += scoreOfRound;
        sessionRound.players[playerIndex].totalScore += scoreOfRound;
    }

    currentRound.players[playerIndex].hasSelect = true;

    setPlayerBoxSelectButtons(playerIndex, "disable");
}

playerbox_1_selectbox.addEventListener("click", (e) => {
    const buttonTarget = e.target.closest("button");
    if (!buttonTarget) return;

    if (buttonTarget.name === "select_1") {
        playerSelect(1, 1);
    } else if (buttonTarget.name === "select_2") {
        playerSelect(1, 2);
    }
})

playerbox_2_selectbox.addEventListener("click", (e) => {
    const buttonTarget = e.target.closest("button");
    if (!buttonTarget) return;

    if (buttonTarget.name === "select_1") {
        playerSelect(2, 1);
    } else if (buttonTarget.name === "select_2") {
        playerSelect(2, 2);
    }
})

// PLAYER MANAGEMENT RESULT

/**
 * @param {1 | 2} playerIndex 
 * @param {"view" | "mask"} state
 */
function setPlayerBoxResultBox(playerIndex, state) {
    const buttonTarget = playerIndex === 1 ? playerbox_1_resultbox : playerbox_2_resultbox;

    if (state === "view") {
        buttonTarget.style.removeProperty("display");
    } else if (state === "mask") {
        buttonTarget.style.display = "none";
    }
}

function setPlayerBoxResultBoxScoreAndTrack(playerIndex, score, track) {
    const elementTarget = playerIndex === 1 ? playerbox_1_resultbox : playerbox_2_resultbox;
    const scoreElement = elementTarget.querySelector("[name='score']");
    const titleElement = elementTarget.querySelector("[name='title']");
    const albumElement = elementTarget.querySelector("[name='album']");
    const artistElement = elementTarget.querySelector("[name='artist']");

    scoreElement.textContent = score > 0 ? "+" + score : score;
    titleElement.textContent = track.title;
    albumElement.textContent = !track.album ? "Sans album" : track.album;
    artistElement.textContent = track.artist.join(", ");
}

// PLAYER MANAGEMENT KEYS

window.addEventListener("keydown", (event) => {
    if (playerKeys[event.key]) {
        if (vars.ingame.currentState === "WAIT_READY") {
            if (playerKeys[event.key].selectPosition === 1) {
                playerReady(playerKeys[event.key].playerIndex);
            }
        }
        else if (vars.ingame.currentState === "WAIT_SELECT") {
            playerSelect(playerKeys[event.key].playerIndex, playerKeys[event.key].selectPosition);
        }
    }
});

const playerKeys = {
    k: { playerIndex: 1, selectPosition: 1 },
    K: { playerIndex: 1, selectPosition: 1 },
    l: { playerIndex: 1, selectPosition: 2 },
    L: { playerIndex: 1, selectPosition: 2 },
    s: { playerIndex: 2, selectPosition: 1 },
    S: { playerIndex: 2, selectPosition: 1 },
    d: { playerIndex: 2, selectPosition: 2 },
    D: { playerIndex: 2, selectPosition: 2 }
};

// ...Daph