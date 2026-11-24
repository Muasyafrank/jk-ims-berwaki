import fs from 'node:fs'

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
const targets = await fetch('http://127.0.0.1:9222/json/list').then((response) => response.json())
const target = targets.find((item) => item.type === 'page')
if (!target) throw new Error('No Chromium page target found')

const socket = new WebSocket(target.webSocketDebuggerUrl)
await new Promise((resolve, reject) => {
  socket.addEventListener('open', resolve, { once: true })
  socket.addEventListener('error', reject, { once: true })
})

let requestId = 0
const pending = new Map()
socket.addEventListener('message', async (event) => {
  const raw = typeof event.data === 'string' ? event.data : await event.data.text()
  const message = JSON.parse(raw)
  if (!message.id || !pending.has(message.id)) return
  const { resolve, reject } = pending.get(message.id)
  pending.delete(message.id)
  if (message.error) reject(new Error(message.error.message))
  else resolve(message.result)
})

const send = (method, params = {}) => new Promise((resolve, reject) => {
  const id = ++requestId
  pending.set(id, { resolve, reject })
  socket.send(JSON.stringify({ id, method, params }))
})

const evaluate = (expression) => send('Runtime.evaluate', { expression })
const capture = async (path) => {
  const result = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false })
  fs.writeFileSync(path, Buffer.from(result.data, 'base64'))
}

await send('Page.enable')
await sleep(1800)
await evaluate(`(() => {
  const button = [...document.querySelectorAll('button')].find((item) => item.textContent.trim() === 'Continue');
  if (button) button.click();
})()`)
await sleep(700)
await capture('.visual-check/onboarding-references.png')
await evaluate(`(() => {
  const button = [...document.querySelectorAll('button')].find((item) => item.textContent.trim() === 'Continue');
  if (button) button.click();
})()`)
await sleep(700)
await capture('.visual-check/onboarding-review.png')
socket.close()
