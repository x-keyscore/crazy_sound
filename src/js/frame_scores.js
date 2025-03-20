const jsConfetti = new JSConfetti();

function launchConfetti() {
    jsConfetti.addConfetti({
        emojis: ['🐸', '🎵', '✨', '✨', '🎉'],
        emojiSize: 30,
        confettiNumber: 150
    });
}

function setup() {
    return (() => {
        launchConfetti();
    })
}

export default { setup };