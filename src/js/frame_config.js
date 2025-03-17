import { vars } from './main.js'

const rangeTurnTime = document.getElementById("range_turn_time")
rangeTurnTime.addEventListener("click", (e) => {
    e.preventDefault();

    const valueElement = rangeTurnTime.querySelector("[name='value']");
    const buttonElement = e.target.closest('button');
    if (!buttonElement) return ;

    if (buttonElement.name === "less") {
        if (vars.config.turnTime > 10000) vars.config.turnTime -= 5000;
    } else if (buttonElement.name === "more") {
        if (vars.config.turnTime < 60000) vars.config.turnTime += 5000;
    }

    valueElement.textContent = String(vars.config.turnTime).slice(0, 2) + "s";
})