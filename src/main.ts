import { Application } from 'pixi.js'
import { AceOfShadows } from './scenes/AceofShadows'   
import { MagicWords }   from './scenes/MagicWords'
import { PhoenixFlame } from './scenes/PhoenixFlame'
import { setupResize }  from './utils/ResizeManager'
import { setupFps }     from './utils/FpsCounter'

const app = new Application({
  backgroundColor: 0x101225,
  resizeTo: window,
  antialias: true
})
document.getElementById('app')!.appendChild(app.view as HTMLCanvasElement)
setupResize(app)
setupFps()

type SceneFactory = () => Promise<void>
const scenes: Record<string, SceneFactory> = {
  'Ace of Shadows': async () => {
    app.stage.removeChildren()
    const s = new AceOfShadows(app)
    app.stage.addChild(s)
    s.start()
  },
  'Magic Words': async () => {
    app.stage.removeChildren()
    const s = new MagicWords(app)
    app.stage.addChild(s)
    await s.start()
  },
  'Phoenix Flame': async () => {
    app.stage.removeChildren()
    const s = new PhoenixFlame(app)
    app.stage.addChild(s)
    s.start()
  },
}

const menu = document.getElementById('menu')!
function setActive(btn: HTMLButtonElement) {
  Array.from(menu.querySelectorAll('button')).forEach(b => b.classList.remove('active'))
  btn.classList.add('active')
}
for (const k of Object.keys(scenes)) {
  const btn = document.createElement('button')
  btn.textContent = k
  btn.onclick = async () => { setActive(btn); await scenes[k]() }
  menu.appendChild(btn)
}
;(menu.querySelector('button') as HTMLButtonElement).click()
