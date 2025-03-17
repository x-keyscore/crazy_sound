import "./frame_config.js";

let vars = {
    config: {
        players: [""],
        genres: ["random"],
        turnCount: 10,
        turnTime: 15000
    },
    gameplay: {
        
    }
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

    if (mode === "fade") {
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

        setTimeout(() => {
            frameFrom.style.display = "none";
            frameFrom.style.removeProperty('animation');
            frameTo.style.removeProperty('animation');
            frameFrom.style.removeProperty('zIndex');
            frameTo.style.removeProperty('zIndex');
        }, time);
    } else if (mode === "slide") {
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

        setTimeout(() => {
            document.head.removeChild(styleSheet);

            frameFrom.style.display = "none";
            frameFrom.style.removeProperty('animation');
            frameTo.style.removeProperty('animation');
        }, time);
    } else {
        throw new Error(`The mode '${mode}' is unknown`);
    }
}
globalThis.frameTransition = frameTransition;

export { vars };