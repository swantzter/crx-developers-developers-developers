// Content script to find and wrap "developer" or "developers" words
const WRAPPER_CLASS = 'ballmer'
const EXCLUDED_TAGS = ['SCRIPT', 'STYLE', 'IFRAME', 'CANVAS']
const DEVELOPER_REGEX = /developers?/gi

// Determine if we're in Firefox or Chrome
const browserAPI = typeof browser !== 'undefined' ? browser : chrome

/**
 * Generate a random hex color
 */
function getRandomColor () {
  const letters = '0123456789ABCDEF'
  let color = '#'
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)]
  }
  return color
}

/**
 * Check if an element should be excluded from processing
 */
function shouldExclude (element) {
  if (!element || !element.tagName) return true
  if (EXCLUDED_TAGS.includes(element.tagName)) return true
  if (element.classList && element.classList.contains(WRAPPER_CLASS)) return true
  return false
}

/**
 * Wrap text nodes containing "developer(s)" with span elements
 */
function wrapDeveloperText (node) {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent
    if (!DEVELOPER_REGEX.test(text)) return

    // Reset regex lastIndex since we're using global flag
    DEVELOPER_REGEX.lastIndex = 0

    const parent = node.parentNode
    if (!parent || shouldExclude(parent)) return

    // Check if parent is already our wrapper
    if (parent.classList && parent.classList.contains(WRAPPER_CLASS)) return

    const fragment = document.createDocumentFragment()
    let lastIndex = 0
    let match

    while ((match = DEVELOPER_REGEX.exec(text)) !== null) {
      // Add text before the match
      if (match.index > lastIndex) {
        fragment.appendChild(document.createTextNode(text.slice(lastIndex, match.index)))
      }

      // Create wrapper span for the match
      const span = document.createElement('span')
      span.className = WRAPPER_CLASS
      span.textContent = match[0]
      attachHoverListeners(span)
      fragment.appendChild(span)

      lastIndex = DEVELOPER_REGEX.lastIndex
    }

    // Add remaining text after the last match
    if (lastIndex < text.length) {
      fragment.appendChild(document.createTextNode(text.slice(lastIndex)))
    }

    // Replace the original text node with our fragment
    if (fragment.childNodes.length > 0) {
      parent.replaceChild(fragment, node)
    }
  } else if (node.nodeType === Node.ELEMENT_NODE && !shouldExclude(node)) {
    // Process child nodes (make a copy since we'll be modifying the DOM)
    const children = Array.from(node.childNodes)
    for (const child of children) {
      wrapDeveloperText(child)
    }
  }
}

/**
 * Attach mouseenter and mouseleave event listeners to a span
 */
function attachHoverListeners (span) {
  span.addEventListener('mouseenter', function () {
    this.style.color = getRandomColor()
    this.style.fontWeight = 'bold'

    // Send message to background script to play sound
    browserAPI.runtime.sendMessage(undefined, { type: 'play-developers-sound' })
  })

  span.addEventListener('mouseleave', function () {
    this.style.color = ''
    this.style.fontWeight = ''
  })
}

/**
 * Process the entire document to wrap developer text
 */
function processDocument () {
  wrapDeveloperText(document.body)
}

// Run on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', processDocument)
} else {
  processDocument()
}

// Run periodically to catch dynamically added content
setInterval(processDocument, 4000)
