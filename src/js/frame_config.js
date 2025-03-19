import { vars } from './main.js'

const inputPlayers = document.getElementById("input_players");
const selectGenres = document.getElementById("select_genres");
const rangeRoundTime = document.getElementById("range_round_time");
const rangeRoundCount = document.getElementById("range_round_count");

function setup() {
    // SETUP PSEUDO INPUT
    inputPlayers.querySelector("[name='player_1']").value = vars.data.players[1].pseudo;
    inputPlayers.querySelector("[name='player_2']").value = vars.data.players[2].pseudo;

    // SETUP GENRES SELECT
    const buttons = selectGenres.querySelectorAll("button");
    for (const button of buttons) {
        if (vars.data.genres.has(button.dataset.genre)) {
            button.setAttribute("aria-pressed", "true");
        }
    }
}

inputPlayers.addEventListener('input', (event) => {
    if (event.target.name === 'player_1') {
        vars.data.players[1].pseudo = event.target.value;
    } else if (event.target.name === 'player_2') {
        vars.data.players[2].pseudo = event.target.value;
    }

    if (vars.data.players[1].pseudo && vars.data.players[2].pseudo) {
        vars.data.playersCount = 2;
    } else {
        vars.data.playersCount = 1;
    }
});

selectGenres.addEventListener("click", (e) => {
    const buttonTarget = e.target.closest("button");
    if (!buttonTarget) return;

    const ariaPressedValue = buttonTarget.getAttribute("aria-pressed");
    const dataGenreValue = buttonTarget.dataset.genre;

    if (ariaPressedValue === "true") {
        if (vars.data.genres.size === 1) return;
        vars.data.genres.delete(dataGenreValue);
        buttonTarget.setAttribute("aria-pressed", "false");
    }
    else if (ariaPressedValue === "false") {
        if (dataGenreValue === "random") {
            const buttonElements = selectGenres.querySelectorAll("button");
            for (const buttonElement of buttonElements) {
                vars.data.genres.delete(buttonElement.dataset.genre);
                buttonElement.setAttribute("aria-pressed", "false");
            }
        }
        else if (vars.data.genres.has("random")) {
            const buttonRandom = selectGenres.querySelector("button[data-genre='random']");
            vars.data.genres.delete("random");
            buttonRandom.setAttribute("aria-pressed", "false");
        }

        vars.data.genres.add(dataGenreValue);
        buttonTarget.setAttribute("aria-pressed", "true");
    }
})

rangeRoundTime.addEventListener("click", (e) => {
    const valueElement = rangeRoundTime.querySelector("[name='value']");
    const buttonTarget = e.target.closest("button");
    if (!buttonTarget) return;

    if (buttonTarget.name === "less") {
        if (vars.data.round.time > 10) vars.data.round.time -= 5;
    } else if (buttonTarget.name === "more") {
        if (vars.data.round.time < 60) vars.data.round.time += 5;
    }

    valueElement.textContent = String(vars.data.round.time) + "s";
})

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
});


export default { setup };