const CONTAINER_ID = 'jk-print-area'
let activePrint = null
let printRequest = 0

function getContainer() {
  let element = document.getElementById(CONTAINER_ID)
  if (!element) {
    element = document.createElement('div')
    element.id = CONTAINER_ID
    document.body.appendChild(element)
  }
  return element
}

function clearContainer(element) {
  element.classList.remove('active')
  element.innerHTML = ''
}

/** Resolve once every image in `root` has loaded, so the logo is never missing from the printout. */
const imagesReady = (root) =>
  Promise.all([...root.querySelectorAll('img')].map((image) => {
    if (image.complete) return null
    if (typeof image.decode === 'function') return image.decode().catch(() => {})

    return new Promise((resolve) => {
      image.addEventListener('load', resolve, { once: true })
      image.addEventListener('error', resolve, { once: true })
    })
  }))

/**
 * Render escaped document HTML into the print container and open the browser print dialog.
 * Screen visibility is handled by print.css (#jk-print-area only shows under @media print).
 */
export async function printDocument(content) {
  if (activePrint) activePrint.cleanup()

  const request = ++printRequest
  const element = getContainer()
  element.innerHTML = String(content)
  element.classList.add('active')

  const cleanup = () => {
    window.removeEventListener('afterprint', cleanup)
    clearContainer(element)
    if (activePrint?.cleanup === cleanup) activePrint = null
  }

  activePrint = { element, cleanup }
  window.addEventListener('afterprint', cleanup, { once: true })

  await imagesReady(element)
  // A newer request may have replaced this document while its logo was loading.
  // Do not open a stale print dialog for the superseded document.
  if (request !== printRequest) return

  try {
    window.print()
  } catch (error) {
    cleanup()
    throw error
  }
}
