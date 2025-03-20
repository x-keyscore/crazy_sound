const jsConfetti = new JSConfetti();

function launchConfetti() {
    jsConfetti.addConfetti({
        emojis: ['🐸', '🎵', '✨', '✨', '🎉'],
        emojiSize: 30,
        confettiNumber: 150
    });
}

function handleDisplay() {
    return (() => {
        launchConfetti();
    })
}

export default { handleDisplay };