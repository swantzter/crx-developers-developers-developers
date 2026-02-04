// Listen for messages from the content script
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'play-developers-sound') {
    playSound()
  }
})

async function hasOffscreenDocument (offscreenUrl) {
  // Check all windows controlled by the service worker to see if one
  // of them is the offscreen document with the given path
  const matchedClients = await clients.matchAll()
  for (const client of matchedClients) {
    if (client.url === offscreenUrl) return true
  }
  return false
}

const offscreenUrl = chrome.runtime.getURL('offscreen.html')
async function createOffscreen () {
  if (!await hasOffscreenDocument(offscreenUrl)) {
    await chrome.offscreen.createDocument({
    url: offscreenUrl,
    reasons: [chrome.offscreen.Reason.AUDIO_PLAYBACK],
    justification: 'Play sound when word is hovered',
  })
  }
}

async function playSound (type) {
  await createOffscreen()
  chrome.runtime.sendMessage({
    type: 'play-developers-sound',
    target: 'offscreen-doc',
    value: type
  })
}
