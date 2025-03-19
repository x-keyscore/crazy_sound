const jsConfetti = new JSConfetti();

function setup() {
    return (() => {
        jsConfetti.addConfetti({
            emojis: ['🐸', '🎵', '✨', '✨', '🎉'],
            emojiSize: 30,
            confettiNumber: 150
        });
    })
}

export default { setup };