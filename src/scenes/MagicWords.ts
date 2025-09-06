import { Application, Container, Graphics, Sprite, Text, Texture, Ticker } from "pixi.js"

type DialogueLine = { name: string; text: string }
type Emoji       = { name: string; url: string }
type Avatar      = { name: string; url: string; position: "left" | "right" }
type DialogueData = { dialogue: DialogueLine[]; emojies: Emoji[]; avatars: Avatar[] }

// ---------- Config ----------
const ENDPOINT = "https://private-624120-softgamesassignment.apiary-mock.com/v2/magicwords"

// If your network blocks cross-origin image loads, set this to true.
const USE_PROXY_FOR_IMAGES = false

function corsProxy(url: string): string {
  if (!USE_PROXY_FOR_IMAGES) return url
  if (url.startsWith("data:") || url.startsWith("/")) return url
  return `https://images.weserv.nl/?url=${encodeURIComponent(url)}&output=png&filename=file.png`
}

async function loadDialogueData(): Promise<DialogueData> {
  try {
    const r = await fetch(ENDPOINT, { mode: "cors" })
    if (!r.ok) throw new Error("HTTP " + r.status)
    return await r.json()
  } catch {
    const r2 = await fetch("/src/data/magicwords.json")
    return await r2.json()
  }
}

function loadImageTexture(url: string): Promise<Texture> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => resolve(Texture.from(img))
    img.onerror = () => reject(new Error("Image load failed: " + url))
    img.src = url
  })
}

function makeTransparentTex(app: Application): Texture {
  const g = new Graphics()
  g.beginFill(0xffffff, 0.0001).drawRect(0, 0, 1, 1).endFill()
  const tex = app.renderer.generateTexture(g)
  g.destroy(true)
  return tex
}

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)
function animateIn(row: Container, fromX: number, toX: number, delayMs: number, durationMs = 450) {
  let t = -delayMs
  row.x = fromX
  row.alpha = 0
  const step = () => {
    t += Ticker.shared.deltaMS
    if (t < 0) return
    const r = Math.min(1, t / durationMs)
    const e = easeOutCubic(r)
    row.x = fromX + (toX - fromX) * e
    row.alpha = e
    if (r >= 1) Ticker.shared.remove(step)
  }
  Ticker.shared.add(step)
}

export class MagicWords extends Container {
  private app: Application
  constructor(app: Application) { super(); this.app = app }

  public async start() {
    const data = await loadDialogueData()
 
    const transparent = makeTransparentTex(this.app)
    const emojiAtlas: Record<string, Texture> = {}
    const avatarAtlas: Record<string, { tex: Texture; pos: "left" | "right" }> = {}

    await Promise.all(
      (data.emojies || []).map(async e => {
        try { emojiAtlas[e.name] = await loadImageTexture(corsProxy(e.url)) }
        catch { emojiAtlas[e.name] = transparent }
      })
    )
    await Promise.all(
      (data.avatars || []).map(async a => {
        try {
          const tex = await loadImageTexture(corsProxy(a.url))
          avatarAtlas[a.name] = { tex, pos: a.position }
        } catch { /* no avatar if it fails */ }
      })
    )

    const content = new Container()
    this.addChild(content)

    const margin = 20
    const bubbleMaxW = Math.min(520, Math.max(320, Math.floor(this.app.screen.width * 0.48)))
    const padX = 14, padY = 10
    const rowGap = 22
    const fontSize = 16
    const avatarSize = 44
    const gap = 10

    let y = margin
    let rowIndex = 0

    for (const line of data.dialogue || []) {
      const row = new Container()
      const avatarInfo = avatarAtlas[line.name]
      const rightSide = (avatarInfo?.pos ?? "left") === "right"

      let avatar: Sprite | null = null
      if (avatarInfo) {
        avatar = new Sprite(avatarInfo.tex)
        avatar.width = avatar.height = avatarSize
        avatar.anchor.set(0.5, 0)
        row.addChild(avatar)
      }

      const bubble = new Container()
      const bg = new Graphics()
      bubble.addChild(bg)

      const runs = (line.text || "").split(/(\{.*?\})/g).filter(Boolean)
      let bx = padX, by = padY, lineH = 0, maxX = padX

      const newLine = () => {
        maxX = Math.max(maxX, bx)
        bx = padX
        by += lineH + 6
        lineH = 0
      }

      const pushWord = (txt: string) => {
        const t = new Text(txt, { fill: 0xffffff, fontSize, fontFamily: "Arial" })
        if (bx + t.width + padX > bubbleMaxW) newLine()
        t.x = bx; t.y = by
        bubble.addChild(t)
        bx += t.width
        lineH = Math.max(lineH, t.height)
        maxX = Math.max(maxX, bx)
      }

      for (const r of runs) {
        if (r.startsWith("{") && r.endsWith("}")) {
          const key = r.slice(1, -1)
          const tex = emojiAtlas[key] ?? transparent
          const spr = new Sprite(tex)
          spr.width = spr.height = Math.round(fontSize + 6)
          if (bx + spr.width + padX > bubbleMaxW) newLine()
          spr.x = bx; spr.y = by + (lineH ? (lineH - spr.height) * 0.5 : 2)
          bubble.addChild(spr)
          bx += spr.width + 6
          lineH = Math.max(lineH, spr.height)
          maxX = Math.max(maxX, bx)
        } else {
          for (const w of r.split(/(\s+)/)) if (w) pushWord(w)
        }
      }

      const bW = Math.min(bubbleMaxW, Math.max(maxX + padX, 120))
      const bH = by + lineH + padY
      bg.beginFill(0x2a2e4e)
      bg.drawRoundedRect(0, 0, bW, bH, 12)
      bg.endFill()

      let targetX = 0
      if (rightSide) {
        const colRight = this.app.screen.width - margin
        if (avatar) { avatar.x = colRight - (bW + gap) + bW + gap + avatarSize * 0.5; avatar.y = 0 }
        targetX = colRight - bW - (avatar ? (gap + avatarSize) : 0)
        bubble.x = targetX
      } else {
        const colLeft = margin
        if (avatar) { avatar.x = colLeft + avatarSize * 0.5; avatar.y = 0 }
        targetX = colLeft + (avatar ? (avatarSize + gap) : 0)
        bubble.x = targetX
      }

      row.addChild(bubble)
      row.y = y
      content.addChild(row)

      const offset = Math.min(220, Math.max(120, Math.floor(this.app.screen.width * 0.15)))
      const fromX = rightSide ? targetX + offset : targetX - offset
      const delay = rowIndex * 90 
      animateIn(row, fromX, row.x, delay, 450)

      y += Math.max(avatarSize, bH) + rowGap
      rowIndex++
    }

    const bounds = content.getBounds()
    const availW = this.app.screen.width - margin * 2
    const availH = this.app.screen.height - margin * 2
    const scale = Math.min(1, availW / bounds.width, availH / bounds.height) 
    content.scale.set(scale)

    const b2 = content.getBounds()
    content.x = Math.round((this.app.screen.width - b2.width) / 2 - b2.x)
    content.y = Math.round((this.app.screen.height - b2.height) / 2 - b2.y)
  }
}
