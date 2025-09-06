import { Application, Container, Graphics, Sprite, Texture, Ticker, RenderTexture } from 'pixi.js'

function easeInOutQuad(t: number){ return t < .5 ? 2*t*t : -1 + (4 - 2*t)*t }

export class AceOfShadows extends Container {
  private app: Application
  private stacks: Container[] = []
  private deckTextures: Texture[] = []
  private timer = 0

  constructor(app: Application) { super(); this.app = app; this.build() }

  private buildCardTexture(color: number): Texture {
    const g = new Graphics()
    
    g.beginFill(color)
    g.drawRoundedRect(0, 0, 64, 96, 8)
    g.endFill()
    
    g.lineStyle(2, 0x000000, 0.35)
    g.drawRoundedRect(0, 0, 64, 96, 8)
    
    g.beginFill(0xffffff)
    g.drawCircle(16, 16, 4)
    g.drawCircle(64 - 16, 96 - 16, 4)
    g.endFill()
    this.app.stage.addChild(g)
    const tex: RenderTexture = this.app.renderer.generateTexture(g)
    this.app.stage.removeChild(g)
    g.destroy(true)
    return tex
  }

  private build() {
    const cols = 4, margin = 40
    const totalW = this.app.screen.width
    const y = this.app.screen.height * 0.5 - 48

    for (let i=0;i<cols;i++){
      const c = new Container()
      c.x = margin + i * ((totalW - margin*2)/(cols-1))
      c.y = y
      c.sortableChildren = true
      this.stacks.push(c); this.addChild(c)
    }

    const colors = [0xff7675,0x74b9ff,0x55efc4,0xfeca57]
    this.deckTextures = colors.map(c=>this.buildCardTexture(c))

    // 144 cards = 4 stacks × 36
    for (let s=0;s<4;s++){
      for (let i=0;i<36;i++){
        const spr = new Sprite(this.deckTextures[i%this.deckTextures.length])
        spr.anchor.set(0.5)
        spr.zIndex = i
        spr.rotation = (Math.random()-0.5)*0.1
        spr.position.set(i*0.4, -i*0.8)
        this.stacks[s].addChild(spr)
      }
    }

    Ticker.shared.add(this.update, this)
  }

  public start() {}

  private update(_delta: number) {
    this.timer += Ticker.shared.deltaMS
    if (this.timer < 1000) return
    this.timer = 0

    const srcIdx = Math.floor(Math.random()*this.stacks.length)
    let dstIdx = Math.floor(Math.random()*this.stacks.length)
    if (dstIdx === srcIdx) dstIdx = (dstIdx+1)%this.stacks.length

    const src = this.stacks[srcIdx], dst = this.stacks[dstIdx]
    const card = src.children[src.children.length-1] as Sprite
    if (!card) return

    const start = { x: src.x + card.x, y: src.y + card.y, r: card.rotation }
    const end   = { x: dst.x + dst.children.length*0.4, y: dst.y - dst.children.length*0.8, r: (Math.random()-0.5)*0.2 }
    const dur = 2000; let t = 0

    const step = (_d: number) => {
      t += Ticker.shared.deltaMS
      const r = Math.min(1, t/dur)
      const e = easeInOutQuad(r)
      const gx = start.x + (end.x - start.x)*e
      const gy = start.y + (end.y - start.y)*e
      card.rotation = start.r + (end.r - start.r)*e
      card.position.set(gx - src.x, gy - src.y)
      if (r >= 1){
        Ticker.shared.remove(step)
        card.position.set(end.x - dst.x, end.y - dst.y)
        dst.addChild(card)
      }
    }
    Ticker.shared.add(step)
  }
}
