import { useState, useEffect, useRef, useCallback } from 'react'
import './App.css'
import Input from './components/Input.jsx'
import ModelSelect from './components/ModelSelect.jsx'
import Instructions from './components/Instructions.jsx'
import Settings from './components/Settings.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'

/* ── useScrollReveal — attaches IntersectionObserver to add .is-visible ── */
function useScrollReveal() {
  const observer = useRef(null)

  const observe = useCallback((el) => {
    if (!el) return
    if (!observer.current) {
      observer.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible')
              observer.current.unobserve(entry.target)
            }
          })
        },
        { threshold: 0.12 }
      )
    }
    observer.current.observe(el)
  }, [])

  useEffect(() => {
    return () => observer.current?.disconnect()
  }, [])

  return observe
}

/* ── Floating background orbs ─────────────────────────────────────────── */
function BackgroundOrbs() {
  return (
    <div style={orbStyles.container} aria-hidden="true">
      <div style={{ ...orbStyles.orb, ...orbStyles.orb1 }} />
      <div style={{ ...orbStyles.orb, ...orbStyles.orb2 }} />
      <div style={{ ...orbStyles.orb, ...orbStyles.orb3 }} />
    </div>
  )
}

const orbStyles = {
  container: { position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none' },
  orb: {
    position: 'absolute',
    borderRadius: '50%',
    filter: 'blur(80px)',
    opacity: 0.25,
  },
  orb1: {
    width: 500, height: 500,
    background: 'radial-gradient(circle, var(--accent) 0%, transparent 70%)',
    top: '-15%', left: '-10%',
    animation: 'orbFloat 18s ease-in-out infinite',
  },
  orb2: {
    width: 400, height: 400,
    background: 'radial-gradient(circle, var(--accent-2) 0%, transparent 70%)',
    bottom: '5%', right: '-8%',
    animation: 'orbFloat2 22s ease-in-out infinite',
  },
  orb3: {
    width: 280, height: 280,
    background: 'radial-gradient(circle, #14b8a6 0%, transparent 70%)',
    top: '40%', left: '60%',
    animation: 'orbFloat 28s ease-in-out infinite reverse',
    opacity: 0.12,
  },
}

/* ── Animated dot-grid background (canvas) ───────────────────────────── */
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

    const GAP = 36
    const RADIUS = 1.2

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const cols = Math.ceil(canvas.width / GAP)
      const rows = Math.ceil(canvas.height / GAP)
      const raw = getComputedStyle(document.documentElement)
        .getPropertyValue('--dot').trim()
      let r = 99, g = 102, b = 241
      if (raw.startsWith('#') && raw.length === 7) {
        r = parseInt(raw.slice(1, 3), 16)
        g = parseInt(raw.slice(3, 5), 16)
        b = parseInt(raw.slice(5, 7), 16)
      }
      for (let row = 0; row <= rows; row++) {
        for (let c = 0; c <= cols; c++) {
          const x = c * GAP
          const y = row * GAP
          const dist = Math.hypot(x - mouse.x, y - mouse.y)
          const glow = Math.max(0, 1 - dist / 150)
          const opacity = 0.08 + glow * 0.55
          const radius = RADIUS + glow * 2

          ctx.beginPath()
          ctx.arc(x, y, radius, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(${r},${g},${b}, ${opacity})`
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
        opacity: 0.8,
      }}
    />
  )
}

/* ── LangChain-inspired animated pipeline graphic ────────────────────── */
function PipelineGraphic() {
  const steps = [
    { label: 'Scout', color: '#6366f1', desc: 'Query Expansion' },
    { label: 'Search', color: '#14b8a6', desc: 'Real-time Web' },
    { label: 'Analyst', color: '#f59e0b', desc: 'SWOT Analysis' },
    { label: 'Director', color: '#a78bfa', desc: 'Strategy Report' },
  ]

  return (
    <div style={pipelineStyles.wrap} aria-label="4-agent pipeline overview">
      {steps.map((step, i) => (
        <div key={step.label} style={pipelineStyles.stepGroup}>
          <div
            style={{
              ...pipelineStyles.pill,
              borderColor: step.color + '60',
              background: step.color + '14',
              animationDelay: `${i * 0.15}s`,
            }}
          >
            <span style={{ ...pipelineStyles.dot, background: step.color }} />
            <div>
              <div style={{ ...pipelineStyles.pillLabel, color: step.color }}>{step.label}</div>
              <div style={pipelineStyles.pillDesc}>{step.desc}</div>
            </div>
          </div>
          {i < steps.length - 1 && (
            <div style={{ ...pipelineStyles.connector, animationDelay: `${i * 0.15 + 0.3}s` }}>
              <svg width="48" height="2" style={{ overflow: 'visible' }}>
                <line x1="0" y1="1" x2="48" y2="1"
                  stroke={step.color}
                  strokeWidth="1.5"
                  strokeDasharray="48"
                  strokeDashoffset="48"
                  style={{ animation: `lineGrow 0.6s ${i * 0.15 + 0.4}s ease forwards` }}
                />
              </svg>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

const pipelineStyles = {
  wrap: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 0,
    flexWrap: 'wrap',
    marginTop: 36,
    rowGap: 12,
  },
  stepGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: 0,
  },
  pill: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '8px 14px',
    border: '1px solid',
    borderRadius: 12,
    backdropFilter: 'blur(10px)',
    animation: 'stepPop 0.5s cubic-bezier(0.22,1,0.36,1) both',
    cursor: 'default',
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: '50%',
    flexShrink: 0,
  },
  pillLabel: {
    fontSize: '0.75rem',
    fontWeight: 700,
    fontFamily: 'Inter, sans-serif',
    letterSpacing: '0.02em',
  },
  pillDesc: {
    fontSize: '0.63rem',
    color: 'var(--text-dim)',
    fontFamily: 'Inter, sans-serif',
    marginTop: 1,
  },
  connector: {
    margin: '0 4px',
    animation: 'fadeIn 0.4s ease both',
  },
}

/* ── Glass Navbar ─────────────────────────────────────────────────────── */
function Navbar({ onHowToUse, onSettings }) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav style={{
      ...navStyles.navbar,
      boxShadow: scrolled ? '0 2px 24px rgba(0,0,0,0.1)' : 'none',
      borderBottomColor: scrolled ? 'var(--navbar-border-glow)' : 'var(--border)',
    }}>
      <div style={navStyles.navInner}>
        <div style={navStyles.logo}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.2">
            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          <span style={navStyles.logoText}>
            Market<span style={navStyles.logoBold}>Sentinel</span>
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={navStyles.navTag}>Multi-Agentic Research</span>
          <button style={navStyles.navBtn} onClick={onHowToUse}>
            <svg width="13" height="13" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
            Guide
          </button>
          <button style={navStyles.navBtn} onClick={onSettings}>
            <svg width="13" height="13" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
            </svg>
            Settings
          </button>
        </div>
      </div>
    </nav>
  )
}

const navStyles = {
  navbar: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    borderBottom: '1px solid var(--border)',
    backdropFilter: 'blur(24px) saturate(180%)',
    WebkitBackdropFilter: 'blur(24px) saturate(180%)',
    backgroundColor: 'var(--navbar-bg)',
    transition: 'box-shadow 0.3s ease, border-color 0.3s ease',
  },
  navInner: {
    maxWidth: 960,
    margin: '0 auto',
    padding: '13px 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logo: { display: 'flex', alignItems: 'center', gap: 10 },
  logoText: {
    fontSize: '1.05rem',
    fontWeight: 400,
    color: 'var(--text)',
    letterSpacing: '-0.01em',
    fontFamily: 'Inter, sans-serif',
  },
  logoBold: { fontWeight: 700, color: 'var(--accent-2)' },
  navTag: {
    fontSize: '0.72rem',
    fontWeight: 500,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: 'var(--text-dim)',
    fontFamily: 'Inter, sans-serif',
  },
  navBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    padding: '6px 12px',
    background: 'var(--bg-input)',
    border: '1px solid var(--border)',
    borderRadius: 8,
    color: 'var(--text-muted)',
    fontSize: '0.75rem',
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'Inter, sans-serif',
    letterSpacing: '0.01em',
    transition: 'border-color 0.2s ease, color 0.2s ease, background 0.2s ease',
  },
}

/* ── App (inner, inside ThemeProvider) ──────────────────────────────────── */
function AppInner() {
  const [selectedModel, setSelectedModel] = useState('')
  const [instructionsOpen, setInstructionsOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const observe = useScrollReveal()

  return (
    <div style={styles.root}>
      <BackgroundOrbs />
      <DotGrid />
      <Navbar
        onHowToUse={() => setInstructionsOpen(true)}
        onSettings={() => setSettingsOpen(true)}
      />
      <Instructions isOpen={instructionsOpen} onClose={() => setInstructionsOpen(false)} />
      <Settings isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />

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

          {/* LangChain-inspired pipeline graphic */}
          <PipelineGraphic />
        </section>

        {/* Card */}
        <section ref={observe} style={styles.card} className="scroll-reveal">
          <div style={styles.cardRow}>
            <label style={styles.label}>Model</label>
            <ModelSelect selectedModel={selectedModel} onModelChange={setSelectedModel} />
          </div>
          <div style={styles.divider} />
          <Input
            selectedModel={selectedModel}
            onOpenSettings={() => setSettingsOpen(true)}
          />
        </section>

        {/* Feature highlights */}
        <section style={styles.features}>
          {[
            { icon: '⚡', title: 'Real-time Intelligence', desc: 'Tavily-powered live web search across hundreds of authoritative sources.' },
            { icon: '🧠', title: 'Multi-Agent Reasoning', desc: 'Scout → Analyst → Critic → Director. Each agent refines the previous output.' },
            { icon: '🎯', title: 'Strategic Briefings', desc: 'Executive-ready SWOT analysis and numbered strategic recommendations.' },
          ].map((f, i) => (
            <div
              key={f.title}
              ref={observe}
              className="scroll-reveal"
              style={{ ...styles.featureCard, animationDelay: `${i * 0.1}s` }}
            >
              <span style={styles.featureIcon}>{f.icon}</span>
              <div style={styles.featureTitle}>{f.title}</div>
              <div style={styles.featureDesc}>{f.desc}</div>
            </div>
          ))}
        </section>
      </main>
    </div>
  )
}

/* ── Root App wrapped in ThemeProvider ──────────────────────────────────── */
function App() {
  return (
    <ThemeProvider>
      <AppInner />
    </ThemeProvider>
  )
}

/* ── Inline styles ───────────────────────────────────────────────────────── */
const styles = {
  root: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    background: 'var(--bg)',
  },
  main: {
    flex: 1,
    zIndex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '120px 24px 80px',
    maxWidth: 900,
    margin: '0 auto',
    width: '100%',
  },
  hero: {
    textAlign: 'center',
    marginBottom: 52,
    width: '100%',
  },
  badge: {
    display: 'inline-block',
    marginBottom: 20,
    padding: '5px 14px',
    borderRadius: 999,
    border: '1px solid var(--border-hov)',
    background: 'var(--accent-glow)',
    color: 'var(--accent-2)',
    fontSize: '0.72rem',
    fontWeight: 600,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    fontFamily: 'Inter, sans-serif',
  },
  h1: {
    fontSize: 'clamp(2rem, 5vw, 3.4rem)',
    fontWeight: 800,
    lineHeight: 1.15,
    letterSpacing: '-0.03em',
    color: 'var(--text)',
    marginBottom: 18,
    fontFamily: 'Inter, sans-serif',
  },
  h1Accent: {
    background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  subtitle: {
    color: 'var(--text-muted)',
    fontSize: '1rem',
    lineHeight: 1.7,
    maxWidth: 500,
    margin: '0 auto',
    fontFamily: 'Inter, sans-serif',
  },
  card: {
    width: '100%',
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 20,
    padding: '28px 32px',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    boxShadow: 'var(--shadow)',
    marginBottom: 32,
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
    color: 'var(--text-dim)',
    fontFamily: 'Inter, sans-serif',
  },
  divider: { height: 1, background: 'var(--border)', marginBottom: 20 },
  features: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: 16,
    width: '100%',
    marginTop: 8,
  },
  featureCard: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 16,
    padding: '20px 22px',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
  },
  featureIcon: { fontSize: '1.4rem' },
  featureTitle: {
    fontSize: '0.88rem',
    fontWeight: 700,
    color: 'var(--text)',
    fontFamily: 'Inter, sans-serif',
  },
  featureDesc: {
    fontSize: '0.78rem',
    color: 'var(--text-muted)',
    lineHeight: 1.6,
    fontFamily: 'Inter, sans-serif',
  },
}

export default App
