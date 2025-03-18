import { vars } from './main.js'

const inputPlayer = document.getElementById("input_player");
const selectGenre = document.getElementById("select_genre");
const rangeTurnTime = document.getElementById("range_turn_time");

function setup() {
    const buttons = selectGenre.querySelectorAll("button");
    for (const button of buttons) {
        if (vars.data.genres.has(button.dataset.genre)) {
            button.setAttribute("aria-pressed", "true");
        }
    }
}

inputPlayer.addEventListener('input', (event) => {
  if (event.target.name === 'player_1') {
    vars.data.players[1].pseudo = event.target.value;
  } else if (event.target.name === 'player_2') {
    vars.data.players[2].pseudo = event.target.value;
  }
});

selectGenre.addEventListener("click", (e) => {
    const buttonTarget = e.target.closest("button");
    if (!buttonTarget) return ;

    const ariaPressedValue = buttonTarget.getAttribute("aria-pressed");
    const dataGenreValue = buttonTarget.dataset.genre;

    if (ariaPressedValue === "true") {
        if (vars.data.genres.size === 1) return ;
        vars.data.genres.delete(dataGenreValue);
        buttonTarget.setAttribute("aria-pressed", "false");
    }
    else if (ariaPressedValue === "false") {
        if (dataGenreValue === "random") {
            const buttonElements = selectGenre.querySelectorAll("button");
            for (const buttonElement of buttonElements) {
                vars.data.genres.delete(buttonElement.dataset.genre);
                buttonElement.setAttribute("aria-pressed", "false");
            }
        }
        else if (vars.data.genres.has("random")) {
            const buttonRandom = selectGenre.querySelector("button[data-genre='random']");
            vars.data.genres.delete("random");
            buttonRandom.setAttribute("aria-pressed", "false");
        }

        vars.data.genres.add(dataGenreValue);
        buttonTarget.setAttribute("aria-pressed", "true");
    }
})

rangeTurnTime.addEventListener("click", (e) => {
    const valueElement = rangeTurnTime.querySelector("[name='value']");
    const buttonElement = e.target.closest("button");
    if (!buttonElement) return ;

    if (buttonElement.name === "less") {
        if (vars.data.turnTime > 10000) vars.data.turnTime -= 5000;
    } else if (buttonElement.name === "more") {
        if (vars.data.turnTime < 60000) vars.data.turnTime += 5000;
    }

    valueElement.textContent = String(vars.data.turnTime).slice(0, 2) + "s";
})

 export default { setup };