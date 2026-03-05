import { useState } from 'react'
import { useTheme, ACCENTS } from '../context/ThemeContext.jsx'

/* SVG Eye / EyeOff icons — reliable across all platforms */
function EyeIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
        </svg>
    )
}

function EyeOffIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
            <line x1="1" y1="1" x2="23" y2="23" />
        </svg>
    )
}

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

    return (
        <div style={styles.overlay} onClick={onClose}>
            <div style={styles.modal} onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div style={styles.header}>
                    <div>
                        <h2 style={styles.title}>Settings</h2>
                        <p style={styles.subtitle}>Appearance & API Configuration</p>
                    </div>
                    <button style={styles.closeBtn} onClick={onClose}>
                        <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>

                <div style={styles.body}>
                    {/* ── Appearance ── */}
                    <section style={styles.section}>
                        <p style={styles.sectionLabel}>APPEARANCE</p>

                        {/* Theme mode */}
                        <div style={styles.fieldRow}>
                            <span style={styles.fieldLabel}>Theme</span>
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
                            <span style={styles.fieldLabel}>Accent</span>
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
                                <span style={styles.accentLabel}>
                                    {ACCENTS[accentKey]?.label}
                                </span>
                            </div>
                        </div>
                    </section>

                    <div style={styles.divider} />

                    {/* ── API Keys ── */}
                    <section style={styles.section}>
                        <p style={styles.sectionLabel}>API KEYS</p>
                        <p style={styles.hint}>
                            Stored in localStorage only — never sent to any server other than the respective API. Your keys take priority over the default server keys.
                        </p>

                        {/* Gemini */}
                        <div style={styles.keyField}>
                            <label style={styles.keyLabel}>Gemini API Key</label>
                            <div style={styles.keyInputWrap}>
                                <input
                                    type={showGemini ? 'text' : 'password'}
                                    value={geminiKey}
                                    onChange={e => setGeminiKey(e.target.value)}
                                    placeholder="AIza..."
                                    style={styles.keyInput}
                                />
                                <button style={styles.eyeBtn} onClick={() => setShowGemini(v => !v)} title={showGemini ? 'Hide key' : 'Show key'}>
                                    {showGemini ? <EyeOffIcon /> : <EyeIcon />}
                                </button>
                            </div>
                        </div>

                        {/* Tavily */}
                        <div style={styles.keyField}>
                            <label style={styles.keyLabel}>Tavily API Key</label>
                            <div style={styles.keyInputWrap}>
                                <input
                                    type={showTavily ? 'text' : 'password'}
                                    value={tavilyKey}
                                    onChange={e => setTavilyKey(e.target.value)}
                                    placeholder="tvly-..."
                                    style={styles.keyInput}
                                />
                                <button style={styles.eyeBtn} onClick={() => setShowTavily(v => !v)} title={showTavily ? 'Hide key' : 'Show key'}>
                                    {showTavily ? <EyeOffIcon /> : <EyeIcon />}
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
                            <button style={styles.clearBtn} onClick={handleClear}>
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
        background: 'rgba(0,0,0,0.45)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        animation: 'fadeIn 0.2s ease both',
    },
    modal: {
        width: '100%',
        maxWidth: 520,
        maxHeight: '88vh',
        overflowY: 'auto',
        background: 'var(--modal-bg)',
        border: '1px solid var(--border)',
        borderRadius: 20,
        boxShadow: 'var(--shadow-lg)',
        animation: 'slideUp 0.3s cubic-bezier(0.22,1,0.36,1) both',
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
        background: 'var(--modal-header-bg)',
        backdropFilter: 'blur(20px)',
    },
    title: { margin: 0, fontSize: '1.1rem', fontWeight: 700, fontFamily: 'Inter, sans-serif', color: 'var(--text)' },
    subtitle: { margin: '3px 0 0', fontSize: '0.78rem', fontFamily: 'Inter, sans-serif', color: 'var(--text-dim)' },
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
        color: 'var(--text-muted)',
        transition: 'background 0.2s ease',
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
        color: 'var(--text-dim)',
    },
    divider: { height: 1, margin: '22px 0', background: 'var(--border)' },
    fieldRow: { display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' },
    fieldLabel: { fontSize: '0.82rem', fontWeight: 500, fontFamily: 'Inter, sans-serif', width: 52, flexShrink: 0, color: 'var(--text-muted)' },
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
    accentLabel: {
        color: 'var(--text-muted)',
        fontSize: '0.8rem',
        fontFamily: 'Inter, sans-serif',
        alignSelf: 'center',
        marginLeft: 4,
    },
    hint: {
        fontSize: '0.75rem',
        lineHeight: 1.55,
        fontFamily: 'Inter, sans-serif',
        marginBottom: 4,
        color: 'var(--text-dim)',
    },
    keyField: { display: 'flex', flexDirection: 'column', gap: 6 },
    keyLabel: { fontSize: '0.78rem', fontWeight: 500, fontFamily: 'Inter, sans-serif', color: 'var(--text-muted)' },
    keyInputWrap: {
        display: 'flex',
        alignItems: 'center',
        borderRadius: 10,
        overflow: 'hidden',
        background: 'var(--bg-input)',
        border: '1px solid var(--border)',
        transition: 'border-color 0.2s ease',
    },
    keyInput: {
        flex: 1,
        background: 'none',
        border: 'none',
        outline: 'none',
        padding: '10px 14px',
        fontSize: '0.85rem',
        fontFamily: 'Inter, sans-serif',
        color: 'var(--text)',
    },
    eyeBtn: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '0 12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--text-dim)',
        transition: 'color 0.2s ease',
        height: '100%',
        minHeight: 40,
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
        border: '1px solid var(--border)',
        background: 'transparent',
        fontSize: '0.82rem',
        fontWeight: 500,
        cursor: 'pointer',
        fontFamily: 'Inter, sans-serif',
        color: 'var(--text-muted)',
        transition: 'border-color 0.2s ease',
    },
}
