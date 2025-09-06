import { Application } from 'pixi.js'
export function setupResize(app: Application) {
  const onResize = () => app.renderer.resize(window.innerWidth, window.innerHeight)
  window.addEventListener('resize', onResize)
  onResize()
}
