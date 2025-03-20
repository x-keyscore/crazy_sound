import { vars } from './main.js'

const inputPlayers = document.getElementById("input_players");
const selectGenres = document.getElementById("select_genres");
const rangeRoundTime = document.getElementById("range_round_time");
const rangeRoundCount = document.getElementById("range_round_count");

function setup() {
    // SETUP PSEUDO INPUT
    inputPlayers.querySelector("[name='player_1']").value = vars.params.players[1].pseudo;
    inputPlayers.querySelector("[name='player_2']").value = vars.params.players[2].pseudo;

    // SETUP GENRES SELECT
    const buttons = selectGenres.querySelectorAll("button");
    for (const button of buttons) {
        if (vars.params.genres.has(button.dataset.genre)) {
            button.setAttribute("aria-pressed", "true");
        }
    }
}

inputPlayers.addEventListener('input', (event) => {
    if (event.target.name === 'player_1') {
        vars.params.players[1].pseudo = event.target.value;
    } else if (event.target.name === 'player_2') {
        vars.params.players[2].pseudo = event.target.value;
    }

    if (vars.params.players[1].pseudo && vars.params.players[2].pseudo) {
        vars.params.players.totalPlayers = 2;
    } else {
        vars.params.players.totalPlayers = 1;
    }
});

selectGenres.addEventListener("click", (e) => {
    const buttonTarget = e.target.closest("button");
    if (!buttonTarget) return;

    const ariaPressedValue = buttonTarget.getAttribute("aria-pressed");
    const dataGenreValue = buttonTarget.dataset.genre;

    if (ariaPressedValue === "true") {
        if (vars.params.genres.size === 1) return;
        vars.params.genres.delete(dataGenreValue);
        buttonTarget.setAttribute("aria-pressed", "false");
    }
    else if (ariaPressedValue === "false") {
        if (dataGenreValue === "random") {
            const buttonElements = selectGenres.querySelectorAll("button");
            for (const buttonElement of buttonElements) {
                vars.params.genres.delete(buttonElement.dataset.genre);
                buttonElement.setAttribute("aria-pressed", "false");
            }
        }
        else if (vars.params.genres.has("random")) {
            const buttonRandom = selectGenres.querySelector("button[data-genre='random']");
            vars.params.genres.delete("random");
            buttonRandom.setAttribute("aria-pressed", "false");
        }

        vars.params.genres.add(dataGenreValue);
        buttonTarget.setAttribute("aria-pressed", "true");
    }
})

rangeRoundTime.addEventListener("click", (e) => {
    const valueElement = rangeRoundTime.querySelector("[name='value']");
    const buttonTarget = e.target.closest("button");
    if (!buttonTarget) return;

    const rounds = vars.params.rounds;
    if (buttonTarget.name === "less") {
        if (rounds.timeRounds > 10) rounds.timeRounds -= 5;
    }
    else if (buttonTarget.name === "more") {
        if (rounds.timeRounds < 60) rounds.timeRounds += 5;
    }

    valueElement.textContent = String(rounds.timeRounds) + "s";
})

rangeRoundCount.addEventListener("click", (e) => {
    const valueElement = rangeRoundCount.querySelector("[name='value']");
    const buttonTarget = e.target.closest("button");
    if (!buttonTarget) return;

    const rounds = vars.params.rounds;
    if (buttonTarget.name === "less") {
        if (rounds.totalRounds > 3) rounds.totalRounds -= 2;
    }
    else if (buttonTarget.name === "more") {
        if (rounds.totalRounds < 7) rounds.totalRounds += 2;
    }

    valueElement.textContent = String(rounds.totalRounds);
})

/*
const lessButton = rangeRoundCount.querySelector("[name='less']");
const moreButton = rangeRoundCount.querySelector("[name='more']");
const rangeValue = rangeRoundCount.querySelector("[name='value']");

lessButton.addEventListener("click", function () {
    if (vars.data.round.totalCount > 3) vars.data.round.totalCount -= 2;
    rangeValue.textContent = String(vars.data.round.totalCount);
});

moreButton.addEventListener("click", function () {
    if (vars.data.round.totalCount < 7) vars.data.round.totalCount += 2;
    rangeValue.textContent = String(vars.data.round.totalCount);
});*/

export default { setup };