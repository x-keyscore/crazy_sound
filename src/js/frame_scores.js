import { vars } from "./main.js";

const jsConfetti = new JSConfetti();

const scores_message = document.getElementById("scores_message");
const scores_winner = document.getElementById("scores_winner");
const scores_losser = document.getElementById("scores_losser");

function launchConfetti() {
    jsConfetti.addConfetti({
        emojis: ['🐸', '🎵', '✨', '✨', '🎉'],
        emojiSize: 30,
        confettiNumber: 150
    });
}

/**
 * @param {"winner" | "losser"} playerIndex
 * @param {"view" | "mask"} state
 */
function setScoresPlayer(playerIndex, state) {
    const elementTarget = playerIndex === "winner" ? scores_winner : scores_losser;

    if (state === "view") {
        elementTarget.style.removeProperty("display");
    } else if (state === "mask") {
        elementTarget.style.display = "none";
    }
}

function handleDisplay() {
    const scores_winner_score = scores_winner.querySelector("[name='score']");
    const scores_winner_pseudo = scores_winner.querySelector("[name='pseudo']");
    const scores_losser_score = scores_losser.querySelector("[name='score']");
    const scores_losser_pseudo = scores_losser.querySelector("[name='pseudo']");

    if (vars.params.players.number === 1) {
        const totalScorePlayer_1 = vars.ingame.sessionRound.players[1].totalScore;

        if (totalScorePlayer_1 === 0) {
            scores_message.innerHTML = "0+0 la tête à Toto 🤭";
        } else if (totalScorePlayer_1 > 0) {
            scores_message.innerHTML = `Bravo <span class='bold'>${vars.params.players[1].pseudo}</span> ✨`;
        } else if (totalScorePlayer_1 < 0) {
            scores_message.innerHTML = "Oops... tu feras mieux la prochaine fois 🎵";
        }

        if (totalScorePlayer_1 > 0) {
            setScoresPlayer("winner", "view");
            setScoresPlayer("losser", "mask");
            scores_winner_pseudo.textContent = vars.params.players[1].pseudo;
            scores_winner_score.textContent = vars.ingame.sessionRound.players[1].totalScore;
        } else {
            setScoresPlayer("winner", "mask");
            setScoresPlayer("losser", "view");
            scores_losser_pseudo.textContent = vars.params.players[1].pseudo;
            scores_losser_score.textContent = vars.ingame.sessionRound.players[1].totalScore;
        }
    } else {

        const totalScorePlayer_1 = vars.ingame.sessionRound.players[1].totalScore;
        const totalScoreplayer_2 = vars.ingame.sessionRound.players[2].totalScore;

        const winnerIndex = totalScorePlayer_1 > totalScoreplayer_2 ? 1 : 2;
        const losserIndex = winnerIndex === 2 ? 1 : 2;

        setScoresPlayer("winner", "view");
        setScoresPlayer("losser", "view");

        scores_message.innerHTML = `Et le gagnant est… <span class='bold'>${vars.params.players[winnerIndex].pseudo}</span> 🎉`;

        scores_winner_pseudo.textContent = vars.params.players[winnerIndex].pseudo;
        scores_winner_score.textContent = vars.ingame.sessionRound.players[winnerIndex].totalScore;
        scores_losser_pseudo.textContent = vars.params.players[losserIndex].pseudo;
        scores_losser_score.textContent = vars.ingame.sessionRound.players[losserIndex].totalScore;
    }

    return (() => {
        launchConfetti();
    })
}

export default { handleDisplay };