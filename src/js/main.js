import frameConfig from "./frame_config.js";
import frameGameplay from "./frame_gameplay.js";
import frameScores from "./frame_scores.js";

const vars = {
    params: {
        players: {
            1: {
                pseudo: "",
                totalScore: 0
            },
            2: {
                pseudo: "",
                totalScore: 0
            },
            totalPlayers: 1
        },
        genres: new Set(["random"]),
        rounds: {
            timeRounds: 15,
            totalRounds: 3
        },
    },
    ingame: {
        availableTracks: [],
        round: {
            validateTrackPosition: 0,
            validateTrack: null,
            invalidateTrack: null,
            players: {
                1: {
                    isReady: false,
                    score: 0
                },
                2: {
                    isReady: false,
                    score: 0
                }
            }
        }
    },
    tracks: [],
    frames: {
        "menu": {
            allowTransition: null,
            setupDisplay: null
        },
        "config": {
            allowTransition: null,
            setupDisplay: frameConfig.setup
        },
        "gameplay": {
            allowTransition: null,
            setupDisplay: frameGameplay.setup
        },
        "scores": {
            allowTransition: null,
            setupDisplay: frameScores.setup
        }
    }
}

/**
 * @param {HTMLElement} frameFrom 
 * @param {HTMLElement} frameTo 
 * @param {"left" | "right"} type 
 * @param {number} time
 */
function slideAnimation(frameFrom, frameTo, type, time) {
    let translateOut, translateIn;
    if (type === "left") {
        translateOut = [0, -(frameFrom.offsetWidth + 16)];
        translateIn = [frameFrom.offsetWidth + 16, 0];
    } else if (type === "right") {
        translateOut = [0, frameFrom.offsetWidth + 16];
        translateIn = [-(frameFrom.offsetWidth + 16), 0];
    } else {
        throw new Error(`The type '${type}' is unknown`);
    }

    const styleSheet = document.createElement('style');
    document.head.appendChild(styleSheet);

    const keyframeSlideOut = `
        @keyframes transition-slide-out {
            from {
                opacity: 1;
                transform: translateX(${translateOut[0]}px);
            }
            to {
                opacity: 0;
                transform: translateX(${translateOut[1]}px);
            }
        }
    `;
    const keyframeSlideIn = `
        @keyframes transition-slide-in {
            from {
                opacity: 0;
                transform: translateX(${translateIn[0]}px);
            }
            to {
                opacity: 1;
                transform: translateX(${translateIn[1]}px);
            }
        }
    `;

    styleSheet.sheet.insertRule(keyframeSlideOut, styleSheet.sheet.cssRules.length);
    styleSheet.sheet.insertRule(keyframeSlideIn, styleSheet.sheet.cssRules.length);
    frameFrom.style.animation = `transition-slide-out ${time}ms ease forwards`;
    frameTo.style.animation = `transition-slide-in ${time}ms ease forwards`;
    frameTo.style.removeProperty('display');

    return (() => {
        document.head.removeChild(styleSheet);

        frameFrom.style.display = "none";
        frameFrom.style.removeProperty('animation');
        frameTo.style.removeProperty('animation');
    });
}

/**
 * @param {HTMLElement} frameFrom 
 * @param {HTMLElement} frameTo 
 * @param {"front" | "back"} type 
 * @param {number} time
 */
function fadeAnimation(frameFrom, frameTo, type, time) {
    if (type === "front") {
        frameFrom.style.zIndex = 2;
        frameTo.style.zIndex = 1;
    } else if (type === "back") {
        frameFrom.style.zIndex = 1;
        frameTo.style.zIndex = 2;
    } else {
        throw new Error(`The type '${type}' is unknown`);
    }

    frameFrom.style.animation = `keyframe-transition-fade-out ${time}ms ease-out forwards`;
    frameTo.style.animation = `keyframe-transition-fade-in ${time}ms ease-in forwards`;
    frameTo.style.removeProperty('display');

    return (() => {
        frameFrom.style.display = "none";
        frameFrom.style.removeProperty('animation');
        frameTo.style.removeProperty('animation');
        frameFrom.style.removeProperty('zIndex');
        frameTo.style.removeProperty('zIndex');
    });
}

/**
 * @param {string} idFrom 
 * @param {string} idTo 
 * @param {"slide" | "fade"} mode 
 * @param {"left" | "right" | "front" | "back"} type
 * @param {number} time ms
 */
function frameTransition(idFrom, idTo, mode, type, time) {
    const frameFrom = document.getElementById(idFrom);
    const frameTo = document.getElementById(idTo);

    // EXEC FUNCTION ALLOW TRANSITION
    if (vars.frames[idTo]?.allowTransition) {
        if (!vars.frames[idTo].allowTransition()) return ;
    }

    // EXEC ANIMATION
    let callbackAnimation = null;
    if (mode === "fade") {
        callbackAnimation = fadeAnimation(frameFrom, frameTo, type, time);
    } else if (mode === "slide") {
        callbackAnimation = slideAnimation(frameFrom, frameTo, type, time);
    } else {
        throw new Error(`The mode '${mode}' is unknown`);
    }

    // EXEC FUNCTION SETUP DISPLAY
    let callbackSetupDisplay = null;
    if (vars.frames[idTo]?.setupDisplay) {
        callbackSetupDisplay = vars.frames[idTo].setupDisplay();
    }

    // CLEAR ANIMATION AND EXEC SETUP DISPLAY CALLBACK
    setTimeout(() => {
        callbackAnimation();
        if (callbackSetupDisplay) callbackSetupDisplay();
    }, time);
}
globalThis.frameTransition = frameTransition;

export { vars };