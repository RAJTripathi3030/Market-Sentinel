import { useState } from 'react'
import { useTheme, ACCENTS } from '../context/ThemeContext.jsx'

/* ── Settings Modal ─────────────────────────────────────────────────────────── */
export default function Settings({ isOpen, onClose }) {
    const { mode, accentKey, setMode, setAccentKey } = useTheme()

    /* API key state — initialised from localStorage */
    const [geminiKey, setGeminiKey] = useState(() => localStorage.getItem('ms_gemini_key') || '')
    const [tavilyKey, setTavilyKey] = useState(() => localStorage.getItem('ms_tavily_key') || '')
    const [showGemini, setShowGemini] = useState(false)
    const [showTavily, setShowTavily] = useState(false)
    const [saved, setSaved] = useState(false)

    if (!isOpen) return null

    const handleSave = () => {
        if (geminiKey.trim()) localStorage.setItem('ms_gemini_key', geminiKey.trim())
        else localStorage.removeItem('ms_gemini_key')
        if (tavilyKey.trim()) localStorage.setItem('ms_tavily_key', tavilyKey.trim())
        else localStorage.removeItem('ms_tavily_key')
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
    }

    const handleClear = () => {
        localStorage.removeItem('ms_gemini_key')
        localStorage.removeItem('ms_tavily_key')
        setGeminiKey('')
        setTavilyKey('')
    }

    const isDark = mode === 'dark' || (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)

    return (
        <div style={styles.overlay} onClick={onClose}>
            <div style={{ ...styles.modal, background: isDark ? 'rgba(10,10,22,0.98)' : 'rgba(250,251,252,0.99)' }} onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div style={{ ...styles.header, borderColor: 'var(--border)' }}>
                    <div>
                        <h2 style={{ ...styles.title, color: 'var(--text)' }}>Settings</h2>
                        <p style={{ ...styles.subtitle, color: 'var(--text-dim)' }}>Appearance & API Configuration</p>
                    </div>
                    <button style={{ ...styles.closeBtn, borderColor: 'var(--border)', color: 'var(--text-muted)' }} onClick={onClose}>
                        <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>

                <div style={styles.body}>
                    {/* ── Appearance ── */}
                    <section style={styles.section}>
                        <p style={{ ...styles.sectionLabel, color: 'var(--text-dim)' }}>APPEARANCE</p>

                        {/* Theme mode */}
                        <div style={styles.fieldRow}>
                            <span style={{ ...styles.fieldLabel, color: 'var(--text-muted)' }}>Theme</span>
                            <div style={styles.modeGroup}>
                                {['dark', 'light', 'system'].map(m => (
                                    <button
                                        key={m}
                                        style={{
                                            ...styles.modeBtn,
                                            background: mode === m ? 'var(--accent)' : 'var(--bg-input)',
                                            color: mode === m ? '#fff' : 'var(--text-muted)',
                                            border: `1px solid ${mode === m ? 'var(--accent)' : 'var(--border)'}`,
                                        }}
                                        onClick={() => setMode(m)}
                                    >
                                        {m === 'dark' ? '🌙 Dark' : m === 'light' ? '☀️ Light' : '💻 System'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Accent */}
                        <div style={styles.fieldRow}>
                            <span style={{ ...styles.fieldLabel, color: 'var(--text-muted)' }}>Accent</span>
                            <div style={styles.accentGroup}>
                                {Object.entries(ACCENTS).map(([key, a]) => (
                                    <button
                                        key={key}
                                        title={a.label}
                                        style={{
                                            ...styles.accentSwatch,
                                            background: a.swatch,
                                            outline: accentKey === key ? `3px solid ${a.accent}` : '3px solid transparent',
                                            outlineOffset: 2,
                                        }}
                                        onClick={() => setAccentKey(key)}
                                    >
                                        {accentKey === key && (
                                            <svg width="12" height="12" viewBox="0 0 20 20" fill="#fff">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        )}
                                    </button>
                                ))}
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontFamily: 'Inter, sans-serif', alignSelf: 'center', marginLeft: 4 }}>
                                    {ACCENTS[accentKey]?.label}
                                </span>
                            </div>
                        </div>
                    </section>

                    <div style={{ ...styles.divider, background: 'var(--border)' }} />

                    {/* ── API Keys ── */}
                    <section style={styles.section}>
                        <p style={{ ...styles.sectionLabel, color: 'var(--text-dim)' }}>API KEYS</p>
                        <p style={{ ...styles.hint, color: 'var(--text-dim)' }}>
                            Stored in localStorage only — never sent to any server other than the respective API. Your keys take priority over the default server keys.
                        </p>

                        {/* Gemini */}
                        <div style={styles.keyField}>
                            <label style={{ ...styles.keyLabel, color: 'var(--text-muted)' }}>Gemini API Key</label>
                            <div style={{ ...styles.keyInputWrap, background: 'var(--bg-input)', border: `1px solid var(--border)` }}>
                                <input
                                    type={showGemini ? 'text' : 'password'}
                                    value={geminiKey}
                                    onChange={e => setGeminiKey(e.target.value)}
                                    placeholder="AIza..."
                                    style={{ ...styles.keyInput, color: 'var(--text)' }}
                                />
                                <button style={{ ...styles.eyeBtn, color: 'var(--text-dim)' }} onClick={() => setShowGemini(v => !v)}>
                                    {showGemini ? '🙈' : '👁'}
                                </button>
                            </div>
                        </div>

                        {/* Tavily */}
                        <div style={styles.keyField}>
                            <label style={{ ...styles.keyLabel, color: 'var(--text-muted)' }}>Tavily API Key</label>
                            <div style={{ ...styles.keyInputWrap, background: 'var(--bg-input)', border: `1px solid var(--border)` }}>
                                <input
                                    type={showTavily ? 'text' : 'password'}
                                    value={tavilyKey}
                                    onChange={e => setTavilyKey(e.target.value)}
                                    placeholder="tvly-..."
                                    style={{ ...styles.keyInput, color: 'var(--text)' }}
                                />
                                <button style={{ ...styles.eyeBtn, color: 'var(--text-dim)' }} onClick={() => setShowTavily(v => !v)}>
                                    {showTavily ? '🙈' : '👁'}
                                </button>
                            </div>
                        </div>

                        {/* Buttons */}
                        <div style={styles.keyActions}>
                            <button style={{
                                ...styles.saveBtn,
                                background: saved ? '#22c55e' : 'var(--accent)',
                            }} onClick={handleSave}>
                                {saved ? '✓ Saved' : 'Save Keys'}
                            </button>
                            <button style={{ ...styles.clearBtn, color: 'var(--text-muted)', borderColor: 'var(--border)' }} onClick={handleClear}>
                                Clear Keys
                            </button>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    )
}

const styles = {
    overlay: {
        position: 'fixed',
        inset: 0,
        zIndex: 999,
        background: 'rgba(0,0,0,0.65)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
    },
    modal: {
        width: '100%',
        maxWidth: 520,
        maxHeight: '88vh',
        overflowY: 'auto',
        border: '1px solid var(--border)',
        borderRadius: 20,
        boxShadow: 'var(--shadow-lg)',
    },
    header: {
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        padding: '24px 28px 20px',
        borderBottom: '1px solid var(--border)',
        position: 'sticky',
        top: 0,
        zIndex: 10,
        backdropFilter: 'blur(20px)',
    },
    title: { margin: 0, fontSize: '1.1rem', fontWeight: 700, fontFamily: 'Inter, sans-serif' },
    subtitle: { margin: '3px 0 0', fontSize: '0.78rem', fontFamily: 'Inter, sans-serif' },
    closeBtn: {
        background: 'var(--bg-input)',
        border: '1px solid var(--border)',
        borderRadius: 8,
        cursor: 'pointer',
        padding: 7,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    body: { padding: '24px 28px 28px', display: 'flex', flexDirection: 'column', gap: 0 },
    section: { display: 'flex', flexDirection: 'column', gap: 14 },
    sectionLabel: {
        fontSize: '0.65rem',
        fontWeight: 700,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        fontFamily: 'Inter, sans-serif',
        marginBottom: 2,
    },
    divider: { height: 1, margin: '22px 0' },
    fieldRow: { display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' },
    fieldLabel: { fontSize: '0.82rem', fontWeight: 500, fontFamily: 'Inter, sans-serif', width: 52, flexShrink: 0 },
    modeGroup: { display: 'flex', gap: 6 },
    modeBtn: {
        padding: '6px 12px',
        borderRadius: 8,
        cursor: 'pointer',
        fontSize: '0.78rem',
        fontWeight: 600,
        fontFamily: 'Inter, sans-serif',
        transition: 'all 0.2s ease',
    },
    accentGroup: { display: 'flex', alignItems: 'center', gap: 8 },
    accentSwatch: {
        width: 28,
        height: 28,
        borderRadius: '50%',
        cursor: 'pointer',
        border: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'outline 0.15s ease, transform 0.15s ease',
        flexShrink: 0,
    },
    hint: {
        fontSize: '0.75rem',
        lineHeight: 1.55,
        fontFamily: 'Inter, sans-serif',
        marginBottom: 4,
    },
    keyField: { display: 'flex', flexDirection: 'column', gap: 6 },
    keyLabel: { fontSize: '0.78rem', fontWeight: 500, fontFamily: 'Inter, sans-serif' },
    keyInputWrap: {
        display: 'flex',
        alignItems: 'center',
        borderRadius: 10,
        overflow: 'hidden',
    },
    keyInput: {
        flex: 1,
        background: 'none',
        border: 'none',
        outline: 'none',
        padding: '10px 14px',
        fontSize: '0.85rem',
        fontFamily: 'Inter, sans-serif',
    },
    eyeBtn: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '0 12px',
        fontSize: '1rem',
        lineHeight: 1,
    },
    keyActions: { display: 'flex', gap: 10, marginTop: 4 },
    saveBtn: {
        padding: '9px 20px',
        borderRadius: 10,
        border: 'none',
        color: '#fff',
        fontSize: '0.82rem',
        fontWeight: 600,
        cursor: 'pointer',
        fontFamily: 'Inter, sans-serif',
        transition: 'background 0.25s ease',
    },
    clearBtn: {
        padding: '9px 16px',
        borderRadius: 10,
        border: '1px solid',
        background: 'transparent',
        fontSize: '0.82rem',
        fontWeight: 500,
        cursor: 'pointer',
        fontFamily: 'Inter, sans-serif',
    },
}
