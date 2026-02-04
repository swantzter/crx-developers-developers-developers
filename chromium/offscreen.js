chrome.runtime.onMessage.addListener(async (message) => {
  if (message.target !== 'offscreen-doc') {
    return
  }

  switch (message.type) {
    case 'play-developers-sound':
      await playSound()
      break
    default:
      console.warn(`Unexpected message type received: '${message.type}'.`)
  }
})

const NUM_SOUNDS = 13

// Since chrome's offscreen thingie is short-lived we only create the array
// with the number of sounds we have and then fill it with audios on-demand
// to avoid loading all of them when it starts, in case we don't use them
const sounds = {
  audios: new Array(NUM_SOUNDS)
    .fill(undefined)
    .map((_, idx) => idx + 1),
  idx: 0,
}

function shuffleArray (array) {
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

  if (typeof sounds.audios[sounds.idx] === 'number') {
    sounds.audios[sounds.idx] = new Audio(chrome.runtime.getURL(`audios/developers-${`${sounds.audios[sounds.idx]}`.padStart(2, '0')}.ogg`))
  }

  const developer = sounds.audios[sounds.idx]
  sounds.idx = sounds.idx >= sounds.audios.length - 1 ? 0 : sounds.idx + 1
  if (!developer.paused) {
    developer.pause()
    developer.fastSeek(0)
  }
  await developer.play()
}
