import { createContext, useContext, useState, useEffect } from 'react'

/* ── Accent Presets ─────────────────────────────────────────────────────────── */
export const ACCENTS = {
    indigo: {
        label: 'Indigo',
        accent: '#6366f1',
        accent2: '#818cf8',
        glow: 'rgba(99,102,241,0.35)',
        borderHov: 'rgba(99,102,241,0.5)',
        dot: '#6366f1',
        swatch: 'linear-gradient(135deg,#6366f1,#818cf8)',
    },
    emerald: {
        label: 'Emerald',
        accent: '#10b981',
        accent2: '#34d399',
        glow: 'rgba(16,185,129,0.35)',
        borderHov: 'rgba(16,185,129,0.5)',
        dot: '#10b981',
        swatch: 'linear-gradient(135deg,#10b981,#34d399)',
    },
    royal: {
        label: 'Royal Blue',
        accent: '#3b82f6',
        accent2: '#60a5fa',
        glow: 'rgba(59,130,246,0.35)',
        borderHov: 'rgba(59,130,246,0.5)',
        dot: '#3b82f6',
        swatch: 'linear-gradient(135deg,#3b82f6,#60a5fa)',
    },
    sunset: {
        label: 'Sunset',
        accent: '#f97316',
        accent2: '#fb923c',
        glow: 'rgba(249,115,22,0.35)',
        borderHov: 'rgba(249,115,22,0.5)',
        dot: '#f97316',
        swatch: 'linear-gradient(135deg,#f97316,#fb923c)',
    },
}

const ThemeContext = createContext(null)

/* ── ThemeProvider ──────────────────────────────────────────────────────────── */
export function ThemeProvider({ children }) {
    const [mode, setModeState] = useState(() => localStorage.getItem('ms_theme') || 'dark')
    const [accentKey, setAccentKeyState] = useState(() => localStorage.getItem('ms_accent') || 'indigo')

    /* Apply Light / Dark / System */
    useEffect(() => {
        const apply = (dark) => {
            document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
        }
        if (mode === 'system') {
            const mq = window.matchMedia('(prefers-color-scheme: dark)')
            apply(mq.matches)
            const handler = (e) => apply(e.matches)
            mq.addEventListener('change', handler)
            return () => mq.removeEventListener('change', handler)
        } else {
            apply(mode === 'dark')
        }
    }, [mode])

    /* Apply Accent CSS variables */
    useEffect(() => {
        const c = ACCENTS[accentKey] || ACCENTS.indigo
        const root = document.documentElement
        root.style.setProperty('--accent', c.accent)
        root.style.setProperty('--accent-2', c.accent2)
        root.style.setProperty('--accent-glow', c.glow)
        root.style.setProperty('--border-hov', c.borderHov)
        root.style.setProperty('--dot', c.dot)
        localStorage.setItem('ms_accent', accentKey)
    }, [accentKey])

    const setMode = (m) => {
        setModeState(m)
        localStorage.setItem('ms_theme', m)
    }

    const setAccentKey = (a) => {
        setAccentKeyState(a)
        localStorage.setItem('ms_accent', a)
    }

    return (
        <ThemeContext.Provider value={{
            mode,
            accentKey,
            accentColors: ACCENTS[accentKey] || ACCENTS.indigo,
            setMode,
            setAccentKey,
        }}>
            {children}
        </ThemeContext.Provider>
    )
}

export const useTheme = () => useContext(ThemeContext)
