import { Application, Container, Graphics, Point, Sprite, Texture, Ticker, BLEND_MODES, RenderTexture } from "pixi.js"

export class PhoenixFlame extends Container {
  private app: Application
  private blobs: Sprite[] = []
  private center = new Point()
  private base?: Graphics

  constructor(app: Application) { super(); this.app = app; this.build() }

  private makeBlobTexture(): Texture {
    const g = new Graphics()
    g.beginFill(0xff6a00); g.drawCircle(64, 64, 60); g.endFill()
    g.beginFill(0xff9a00, 0.9); g.drawCircle(64, 64, 42); g.endFill()
    g.beginFill(0xffd040, 0.8); g.drawCircle(64, 64, 26); g.endFill()

    this.app.stage.addChild(g)
    const tex: RenderTexture = this.app.renderer.generateTexture(g)
    this.app.stage.removeChild(g)
    g.destroy(true)
    return tex
  }

  private build() {
    this.center.set(this.app.screen.width/2, this.app.screen.height*0.68)
    const tex = this.makeBlobTexture()

    const MAX = 10
    for (let i=0;i<MAX;i++){
      const s = new Sprite(tex)
      s.anchor.set(0.5)
      s.blendMode = BLEND_MODES.ADD
      this.resetBlob(s, Math.random()*1200)
      this.addChild(s)
      this.blobs.push(s)
    }
    Ticker.shared.add(this.update, this)
  }

  public start() {}

  private resetBlob(s: Sprite, jitter=0) {
    s.position.copyFrom(this.center)
    s.scale.set(0.35 + Math.random()*0.25)
    s.alpha = 0.0
    ;(s as any).t = jitter
    ;(s as any).rise = 200 + Math.random()*200
    ;(s as any).side = (Math.random()-0.5)*90
    ;(s as any).life = 1600 + Math.random()*400
  }

  private update(_delta: number) {
    for (const s of this.blobs){
      ;(s as any).t += Ticker.shared.deltaMS
      const life = (s as any).life
      const r = ((s as any).t % life) / life
      const rise = (s as any).rise
      const side = (s as any).side

      s.x = this.center.x + side * (1 - r) * Math.sin(r * Math.PI * 2)
      s.y = this.center.y - rise * r
      s.alpha = Math.min(1, r*3) * (1 - r)
      s.scale.set(0.35 + r * 1.0)
      if (r >= 0.99) this.resetBlob(s)
    }
    this.drawBase()
  }

  private drawBase(){
    if (!this.base){ this.base = new Graphics(); this.addChildAt(this.base, 0) }
    const g = this.base; g.clear()
    const w = 140 + Math.random()*18
    const h = 30 + Math.random()*6
    g.beginFill(0x330c00, 0.45); g.drawEllipse(this.center.x, this.center.y+12, w, h); g.endFill()
    g.beginFill(0xff3300, 0.55); g.drawCircle(this.center.x, this.center.y, 44); g.endFill()
  }
}
