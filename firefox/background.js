const NUM_SOUNDS = 13

// Apparently, I've learned, firefox creates a separate PulseAudio connection
// for each separate audio element, which can lead to crashes.
// Therefore we just create a fixed number of them and loop through them,
// in the hopes that by the time we wrap around it'll have completed its
// previous play-through and be ready to start again
const sounds = {
  audios: new Array(NUM_SOUNDS)
    .fill(undefined)
    .map((_, idx) => new Audio(`audios/developers-${`${idx + 1}`.padStart(2, '0')}.ogg`)),
  idx: 0,
}

function shuffleArray(array) {
  for (let idx1 = array.length - 1; idx1 > 0; idx1--) {
    const idx2 = Math.floor(Math.random() * (idx1 + 1))
      ;[array[idx1], array[idx2]] = [array[idx2], array[idx1]]
  }
}

async function playSound () {
  // Shuffle the sounds when starting a new cycle
  if (sounds.idx === 0) {
    shuffleArray(sounds.audios)
  }

  const developer = sounds.audios[sounds.idx]
  sounds.idx = sounds.idx >= sounds.audios.length - 1 ? 0 : sounds.idx + 1
  if (!developer.paused) {
    developer.pause()
    developer.fastSeek(0)
  }
  await developer.play()
}

// Listen for messages from the content script
browser.runtime.onMessage.addListener((message) => {
  if (message.type === 'play-developers-sound') {
    playSound()
  }
})
