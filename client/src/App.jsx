import { useState, useEffect, useRef } from 'react'
import './App.css'
import Input from './components/Input.jsx'
import ModelSelect from './components/ModelSelect.jsx'
import Instructions from './components/Instructions.jsx'

/* ── Animated dot-grid background (canvas) ───────────────────────────────── */
function DotGrid() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let animId
    let mouse = { x: -999, y: -999 }

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)
    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX
      mouse.y = e.clientY
    })

    const GAP = 34
    const RADIUS = 1.5
    const COLOR = '99,102,241'

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const cols = Math.ceil(canvas.width / GAP)
      const rows = Math.ceil(canvas.height / GAP)

      for (let r = 0; r <= rows; r++) {
        for (let c = 0; c <= cols; c++) {
          const x = c * GAP
          const y = r * GAP
          const dist = Math.hypot(x - mouse.x, y - mouse.y)
          const glow = Math.max(0, 1 - dist / 160)
          const opacity = 0.12 + glow * 0.72
          const radius = RADIUS + glow * 2.5

          ctx.beginPath()
          ctx.arc(x, y, radius, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(${COLOR}, ${opacity})`
          ctx.fill()
        }
      }
      animId = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        opacity: 0.9,
      }}
    />
  )
}

/* ── Navbar ──────────────────────────────────────────────────────────────── */
function Navbar({ onHowToUse }) {
  return (
    <nav style={styles.navbar}>
      <div style={styles.navInner}>
        <div style={styles.logo}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2.2">
            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          <span style={styles.logoText}>Market<span style={styles.logoBold}>Sentinel</span></span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={styles.navTag}>Multi-Agentic Research</span>
          <button style={styles.howToBtn} onClick={onHowToUse}>
            <svg width="13" height="13" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
            How to Use
          </button>
        </div>
      </div>
    </nav>
  )
}

/* ── App ─────────────────────────────────────────────────────────────────── */
function App() {
  const [selectedModel, setSelectedModel] = useState('')
  const [instructionsOpen, setInstructionsOpen] = useState(false)

  return (
    <div style={styles.root}>
      <DotGrid />
      <Navbar onHowToUse={() => setInstructionsOpen(true)} />
      <Instructions isOpen={instructionsOpen} onClose={() => setInstructionsOpen(false)} />

      <main style={styles.main}>
        {/* Hero */}
        <section style={styles.hero} className="fade-in">
          <div style={styles.badge}>AI-Powered · Market Intelligence</div>
          <h1 style={styles.h1}>
            Research markets<br />
            <span style={styles.h1Accent}>at the speed of thought</span>
          </h1>
          <p style={styles.subtitle}>
            A 4-agent autonomous system that scouts the web, analyzes competitor moves, critiques its own findings, and delivers a strategic executive briefing.
          </p>
        </section>

        {/* Card */}
        <section style={styles.card} className="slide-up">
          <div style={styles.cardRow}>
            <label style={styles.label}>Model</label>
            <ModelSelect selectedModel={selectedModel} onModelChange={setSelectedModel} />
          </div>
          <div style={styles.divider} />
          <Input selectedModel={selectedModel} />
        </section>
      </main>
    </div>
  )
}

/* ── Inline styles ───────────────────────────────────────────────────────── */
const styles = {
  root: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
  },
  navbar: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    backdropFilter: 'blur(16px)',
    backgroundColor: 'rgba(6,6,15,0.7)',
  },
  navInner: {
    maxWidth: 960,
    margin: '0 auto',
    padding: '14px 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  howToBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '6px 13px',
    background: 'rgba(99,102,241,0.1)',
    border: '1px solid rgba(99,102,241,0.25)',
    borderRadius: 8,
    color: '#818cf8',
    fontSize: '0.75rem',
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'Inter, sans-serif',
    letterSpacing: '0.01em',
    transition: 'background 0.2s ease',
  },
  logoText: {
    fontSize: '1.05rem',
    fontWeight: 400,
    color: '#f1f5f9',
    letterSpacing: '-0.01em',
  },
  logoBold: {
    fontWeight: 700,
    color: '#818cf8',
  },
  navTag: {
    fontSize: '0.72rem',
    fontWeight: 500,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: '#475569',
  },
  main: {
    flex: 1,
    zIndex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '120px 24px 60px',
    maxWidth: 760,
    margin: '0 auto',
    width: '100%',
  },
  hero: {
    textAlign: 'center',
    marginBottom: 40,
  },
  badge: {
    display: 'inline-block',
    marginBottom: 20,
    padding: '5px 14px',
    borderRadius: 999,
    border: '1px solid rgba(99,102,241,0.4)',
    background: 'rgba(99,102,241,0.08)',
    color: '#818cf8',
    fontSize: '0.72rem',
    fontWeight: 600,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  },
  h1: {
    fontSize: 'clamp(2rem, 5vw, 3.2rem)',
    fontWeight: 800,
    lineHeight: 1.15,
    letterSpacing: '-0.03em',
    color: '#f1f5f9',
    marginBottom: 18,
  },
  h1Accent: {
    background: 'linear-gradient(135deg, #6366f1, #a78bfa)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: '1rem',
    lineHeight: 1.7,
    maxWidth: 480,
    margin: '0 auto',
  },
  card: {
    width: '100%',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 20,
    padding: '28px 32px',
    backdropFilter: 'blur(20px)',
    boxShadow: '0 8px 40px rgba(0,0,0,0.4)',
    animationDelay: '0.15s',
  },
  cardRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  label: {
    fontSize: '0.78rem',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: '#475569',
  },
  divider: {
    height: 1,
    background: 'rgba(255,255,255,0.06)',
    marginBottom: 20,
  },
}

export default App
