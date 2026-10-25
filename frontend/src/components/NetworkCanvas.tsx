import { useEffect, useRef } from 'react'

// Animated network: drifting nodes link up, packets travel between them, and each arrival
// briefly shows the IP that just "found its place". Colours come from the logo.

interface NetNode {
  x: number
  y: number
  vx: number
  vy: number
  r: number
  hub: boolean
  pulse: number
}

interface Packet {
  from: NetNode
  to: NetNode
  t: number
  speed: number
}

interface IpLabel {
  x: number
  y: number
  text: string
  age: number
}

const LIME = '106, 176, 59'
const LIME_SOFT = '180, 224, 141'
const LINK_DISTANCE = 150
const POINTER_DISTANCE = 190
const LABEL_LIFETIME = 2.6
const MAX_PACKETS = 14
const MAX_LABELS = 4

const rand = (min: number, max: number) => min + Math.random() * (max - min)
const randomIp = () =>
  `10.${Math.floor(rand(0, 256))}.${Math.floor(rand(0, 256))}.${Math.floor(rand(1, 255))}`

export default function NetworkCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const host = canvas?.parentElement
    const ctx = canvas?.getContext('2d')
    if (!canvas || !host || !ctx) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const pointer = { x: -1e4, y: -1e4 }
    let width = 0
    let height = 0
    let nodes: NetNode[] = []
    let packets: Packet[] = []
    let labels: IpLabel[] = []
    let spawnIn = 0
    let lastTime = performance.now()
    let frameId = 0

    function seed() {
      const count = Math.round(Math.min(72, Math.max(26, (width * height) / 13000)))
      nodes = Array.from({ length: count }, () => {
        const hub = Math.random() < 0.14
        return {
          x: rand(0, width),
          y: rand(0, height),
          vx: rand(-14, 14),
          vy: rand(-14, 14),
          r: hub ? rand(3.6, 4.6) : rand(1.2, 2.2),
          hub,
          pulse: 0,
        }
      })
      packets = []
      labels = []
    }

    function resize() {
      const rect = canvas!.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = rect.width
      height = rect.height
      canvas!.width = Math.round(width * dpr)
      canvas!.height = Math.round(height * dpr)
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
      seed()
      draw()
    }

    function spawnPacket() {
      if (packets.length >= MAX_PACKETS) return
      const from = nodes[Math.floor(Math.random() * nodes.length)]
      const neighbours = nodes.filter(
        (n) => n !== from && Math.hypot(n.x - from.x, n.y - from.y) < LINK_DISTANCE,
      )
      if (neighbours.length === 0) return
      const to = neighbours[Math.floor(Math.random() * neighbours.length)]
      packets.push({ from, to, t: 0, speed: rand(0.45, 0.9) })
    }

    function update(dt: number) {
      for (const n of nodes) {
        n.x += n.vx * dt
        n.y += n.vy * dt
        if (n.x < 0 || n.x > width) n.vx *= -1
        if (n.y < 0 || n.y > height) n.vy *= -1
        n.x = Math.min(Math.max(n.x, 0), width)
        n.y = Math.min(Math.max(n.y, 0), height)
        n.pulse = Math.max(0, n.pulse - dt * 1.1)
      }

      spawnIn -= dt
      if (spawnIn <= 0) {
        spawnPacket()
        spawnIn = rand(0.18, 0.45)
      }

      packets = packets.filter((p) => {
        p.t += p.speed * dt
        if (p.t < 1) return true
        p.to.pulse = 1
        if ((p.to.hub || Math.random() < 0.3) && labels.length < MAX_LABELS) {
          labels.push({ x: p.to.x, y: p.to.y, text: randomIp(), age: 0 })
        }
        return false
      })

      labels = labels.filter((l) => {
        l.age += dt
        return l.age < LABEL_LIFETIME
      })
    }

    function draw() {
      ctx!.clearRect(0, 0, width, height)

      // Links between nearby nodes.
      ctx!.lineWidth = 1
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i]
          const b = nodes[j]
          const d = Math.hypot(a.x - b.x, a.y - b.y)
          if (d >= LINK_DISTANCE) continue
          ctx!.strokeStyle = `rgba(${LIME}, ${(1 - d / LINK_DISTANCE) * 0.32})`
          ctx!.beginPath()
          ctx!.moveTo(a.x, a.y)
          ctx!.lineTo(b.x, b.y)
          ctx!.stroke()
        }
      }

      // The pointer joins the network as a temporary node.
      for (const n of nodes) {
        const d = Math.hypot(n.x - pointer.x, n.y - pointer.y)
        if (d >= POINTER_DISTANCE) continue
        ctx!.strokeStyle = `rgba(${LIME_SOFT}, ${(1 - d / POINTER_DISTANCE) * 0.55})`
        ctx!.beginPath()
        ctx!.moveTo(n.x, n.y)
        ctx!.lineTo(pointer.x, pointer.y)
        ctx!.stroke()
      }

      for (const n of nodes) {
        if (n.pulse > 0) {
          ctx!.strokeStyle = `rgba(${LIME_SOFT}, ${n.pulse * 0.8})`
          ctx!.lineWidth = 1.5
          ctx!.beginPath()
          ctx!.arc(n.x, n.y, n.r + (1 - n.pulse) * 26, 0, Math.PI * 2)
          ctx!.stroke()
        }
        if (n.hub) {
          // Mirrors the logo's nodes: lime core inside a white ring.
          const glow = ctx!.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r * 5)
          glow.addColorStop(0, `rgba(${LIME}, 0.45)`)
          glow.addColorStop(1, `rgba(${LIME}, 0)`)
          ctx!.fillStyle = glow
          ctx!.beginPath()
          ctx!.arc(n.x, n.y, n.r * 5, 0, Math.PI * 2)
          ctx!.fill()
          ctx!.fillStyle = `rgb(${LIME})`
          ctx!.strokeStyle = 'rgba(255, 255, 255, 0.95)'
          ctx!.lineWidth = 1.8
          ctx!.beginPath()
          ctx!.arc(n.x, n.y, n.r, 0, Math.PI * 2)
          ctx!.fill()
          ctx!.stroke()
        } else {
          ctx!.fillStyle = `rgba(${LIME_SOFT}, 0.75)`
          ctx!.beginPath()
          ctx!.arc(n.x, n.y, n.r, 0, Math.PI * 2)
          ctx!.fill()
        }
      }

      for (const p of packets) {
        const x = p.from.x + (p.to.x - p.from.x) * p.t
        const y = p.from.y + (p.to.y - p.from.y) * p.t
        const glow = ctx!.createRadialGradient(x, y, 0, x, y, 10)
        glow.addColorStop(0, 'rgba(255, 255, 255, 0.95)')
        glow.addColorStop(0.35, `rgba(${LIME_SOFT}, 0.6)`)
        glow.addColorStop(1, `rgba(${LIME}, 0)`)
        ctx!.fillStyle = glow
        ctx!.beginPath()
        ctx!.arc(x, y, 10, 0, Math.PI * 2)
        ctx!.fill()
      }

      ctx!.font = '600 11px "Plus Jakarta Sans", system-ui, sans-serif'
      ctx!.textBaseline = 'middle'
      for (const l of labels) {
        const progress = l.age / LABEL_LIFETIME
        const alpha = Math.min(1, progress * 5, (1 - progress) * 3)
        const y = l.y - 18 - progress * 14
        const textWidth = ctx!.measureText(l.text).width
        const boxX = l.x - textWidth / 2 - 8
        ctx!.globalAlpha = alpha
        ctx!.fillStyle = 'rgba(2, 42, 47, 0.78)'
        ctx!.strokeStyle = `rgba(${LIME}, 0.7)`
        ctx!.lineWidth = 1
        ctx!.beginPath()
        ctx!.roundRect(boxX, y - 10, textWidth + 16, 20, 10)
        ctx!.fill()
        ctx!.stroke()
        ctx!.fillStyle = '#ffffff'
        ctx!.fillText(l.text, boxX + 8, y + 0.5)
        ctx!.globalAlpha = 1
      }
    }

    function tick(now: number) {
      const dt = Math.min((now - lastTime) / 1000, 0.05)
      lastTime = now
      update(dt)
      draw()
      frameId = requestAnimationFrame(tick)
    }

    function onPointerMove(event: PointerEvent) {
      const rect = canvas!.getBoundingClientRect()
      pointer.x = event.clientX - rect.left
      pointer.y = event.clientY - rect.top
    }

    function onPointerLeave() {
      pointer.x = -1e4
      pointer.y = -1e4
    }

    const observer = new ResizeObserver(resize)
    observer.observe(host)
    host.addEventListener('pointermove', onPointerMove)
    host.addEventListener('pointerleave', onPointerLeave)
    if (!reduceMotion) frameId = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(frameId)
      observer.disconnect()
      host.removeEventListener('pointermove', onPointerMove)
      host.removeEventListener('pointerleave', onPointerLeave)
    }
  }, [])

  return <canvas ref={canvasRef} className="network-canvas" aria-hidden="true" />
}
