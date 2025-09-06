import { Ticker } from 'pixi.js'

export function setupFps() {
  const label = document.getElementById('fps')!
  let last = performance.now(), frames = 0
  Ticker.shared.add((delta: number) => {
    frames++
    const now = performance.now()
    if (now - last >= 1000) {
      label.textContent = `${frames.toFixed(0)} fps`
      frames = 0; last = now
    }
  })
}
