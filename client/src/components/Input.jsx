import { useState } from 'react'

const Input = ({ selectedModel }) => {
    const [query, setQuery] = useState('')
    const [analysisResult, setAnalysisResult] = useState(null)   // expanded queries text
    const [searchResult, setSearchResult] = useState(null)   // tavily results array
    const [analyseLoading, setAnalyseLoading] = useState(false)
    const [searchLoading, setSearchLoading] = useState(false)
    const [hasAnalysed, setHasAnalysed] = useState(false)  // gate for Search btn

    /* ── Reset when user changes the query ── */
    const handleQueryChange = (e) => {
        setQuery(e.target.value)
        setAnalysisResult(null)
        setSearchResult(null)
        setHasAnalysed(false)
    }

    /* ── Step 1: Analyse Query (Gemini expansion) ── */
    const handleAnalyse = async () => {
        if (!query.trim() || !selectedModel) return
        setAnalyseLoading(true)
        setAnalysisResult(null)
        setSearchResult(null)
        setHasAnalysed(false)
        try {
            const res = await fetch('http://localhost:5000/api/analyse', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query, model: selectedModel }),
            })
            const data = await res.json()
            if (res.ok) {
                setAnalysisResult(data.expanded)
                setHasAnalysed(true)
            } else {
                setAnalysisResult(`Error: ${data.error}`)
            }
        } catch (err) {
            setAnalysisResult(`Error: ${err.message}`)
        } finally {
            setAnalyseLoading(false)
        }
    }

    /* ── Step 2: Start Search (Tavily) ── */
    const handleSearch = async () => {
        if (!query.trim() || !hasAnalysed) return
        setSearchLoading(true)
        setSearchResult(null)
        try {
            const res = await fetch('http://localhost:5000/api/search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query }),
            })
            const data = await res.json()
            if (res.ok) {
                setSearchResult(data.results)
            } else {
                setSearchResult([{ type: 'error', content: data.error }])
            }
        } catch (err) {
            setSearchResult([{ type: 'error', content: err.message }])
        } finally {
            setSearchLoading(false)
        }
    }

    const analyseDisabled = analyseLoading || !selectedModel || !query.trim()
    const searchDisabled = searchLoading || !hasAnalysed

    return (
        <div>
            {/* ── Search bar + buttons ── */}
            <div style={styles.row}>
                <div style={{ ...styles.inputWrap, ...(selectedModel ? {} : styles.inputDisabled) }}>
                    <svg style={styles.searchIcon} viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd"
                            d="M9 3a6 6 0 100 12A6 6 0 009 3zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
                            clipRule="evenodd" />
                    </svg>
                    <input
                        type="text"
                        placeholder={selectedModel ? 'e.g. Apple stock price trend this quarter…' : 'Select a model above first'}
                        value={query}
                        onChange={handleQueryChange}
                        onKeyDown={e => e.key === 'Enter' && handleAnalyse()}
                        disabled={!selectedModel}
                        style={styles.input}
                    />
                </div>

                {/* Analyse Query button */}
                <ActionButton
                    onClick={handleAnalyse}
                    disabled={analyseDisabled}
                    loading={analyseLoading}
                    label="Analyse Query"
                    icon="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 11h-1v6a1 1 0 01-1 1h-3a1 1 0 01-1-1v-3H9v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-6H3a1 1 0 01-.707-1.707l7-7z"
                    gradient={['#6366f1', '#818cf8', '#4f46e5', '#7c3aed']}
                />

                {/* Start Search button */}
                <div style={{ position: 'relative' }}>
                    <ActionButton
                        onClick={handleSearch}
                        disabled={searchDisabled}
                        loading={searchLoading}
                        label="Start Search"
                        icon="M3 9.5a1 1 0 011-1h1.586l-2.293-2.293a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L6.586 10.5H4a1 1 0 01-1-1zm10.707-4.207a1 1 0 010 1.414L11.414 9H16a1 1 0 110 2h-4.586l2.293 2.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                        gradient={['#14b8a6', '#2dd4bf', '#0d9488', '#0f766e']}
                        searchGate={!hasAnalysed && !searchLoading}
                    />
                    {!hasAnalysed && !searchLoading && (
                        <span style={styles.gateHint}>Run Analyse first</span>
                    )}
                </div>
            </div>

            {/* ── No model warning ── */}
            {!selectedModel && (
                <p style={styles.warn}>← Choose a model from the dropdown to begin</p>
            )}

            {/* ── Card 1: Expanded Queries (indigo) ── */}
            {analysisResult && (
                <ResultCard
                    title="Query Analysis"
                    subtitle="Expanded sub-queries via Gemini"
                    accent="#6366f1"
                    accentBg="rgba(99,102,241,0.06)"
                    accentBorder="rgba(99,102,241,0.2)"
                    accentHeaderBg="rgba(99,102,241,0.08)"
                    icon="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15M14.25 3.104c.251.023.501.05.75.082M19.8 15l-1.575-1.573M19.8 15l1.35 1.35a1.5 1.5 0 010 2.121l-.527.528a1.5 1.5 0 01-2.12 0L17 17.5m-12.8-2.5l1.35-1.35m0 0L4.2 12.3a1.5 1.5 0 010-2.12l.527-.528a1.5 1.5 0 012.12 0L8.2 11"
                >
                    <pre style={styles.preBody}>{analysisResult}</pre>
                </ResultCard>
            )}

            {/* ── Card 2: Tavily Search Results (teal) ── */}
            {searchResult && (
                <ResultCard
                    title="Live Search Results"
                    subtitle="Powered by Tavily · Real-time web intelligence"
                    accent="#14b8a6"
                    accentBg="rgba(20,184,166,0.05)"
                    accentBorder="rgba(20,184,166,0.2)"
                    accentHeaderBg="rgba(20,184,166,0.08)"
                    icon="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253M3 12c0 .778.099 1.533.284 2.253"
                >
                    <div style={styles.resultsList}>
                        {searchResult.map((item, i) => {
                            if (item.type === 'answer') {
                                return (
                                    <div key={i} style={styles.answerBlock}>
                                        <span style={{ ...styles.tag, background: 'rgba(20,184,166,0.15)', color: '#14b8a6' }}>
                                            AI Answer
                                        </span>
                                        <p style={styles.answerText}>{item.content}</p>
                                    </div>
                                )
                            }
                            if (item.type === 'error') {
                                return <p key={i} style={{ color: '#f87171', padding: '10px', fontFamily: 'Inter, sans-serif', fontSize: '0.85rem' }}>⚠ {item.content}</p>
                            }
                            return (
                                <div key={i} style={styles.resultItem}>
                                    <div style={styles.resultItemHeader}>
                                        <span style={{ ...styles.tag, background: 'rgba(20,184,166,0.1)', color: '#2dd4bf' }}>
                                            #{i}
                                        </span>
                                        <a href={item.url} target="_blank" rel="noopener noreferrer" style={styles.resultUrl}>
                                            {item.url}
                                        </a>
                                    </div>
                                    <p style={styles.resultTitle}>{item.title}</p>
                                    <p style={styles.resultContent}>{item.content}</p>
                                </div>
                            )
                        })}
                    </div>
                </ResultCard>
            )}
        </div>
    )
}

/* ── Reusable ActionButton ─────────────────────────────────────────────────── */
function ActionButton({ onClick, disabled, loading, label, icon, gradient, searchGate }) {
    const [base, hover, pressBase, pressHover] = gradient
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            style={{
                ...styles.btn,
                background: `linear-gradient(135deg, ${base}, ${pressBase})`,
                ...(disabled ? styles.btnDisabled : {}),
            }}
            onMouseEnter={e => {
                if (!disabled) e.currentTarget.style.background = `linear-gradient(135deg,${hover},${pressHover})`
            }}
            onMouseLeave={e => {
                if (!disabled) e.currentTarget.style.background = `linear-gradient(135deg,${base},${pressBase})`
            }}
        >
            {loading ? <Spinner /> : (
                <>
                    <svg width="15" height="15" viewBox="0 0 20 20" fill="currentColor">
                        <path d={icon} />
                    </svg>
                    {label}
                </>
            )}
        </button>
    )
}

/* ── Reusable ResultCard ────────────────────────────────────────────────────── */
function ResultCard({ title, subtitle, accent, accentBg, accentBorder, accentHeaderBg, icon, children }) {
    return (
        <div style={{ ...styles.card, background: accentBg, border: `1px solid ${accentBorder}` }} className="slide-up">
            <div style={{ ...styles.cardHeader, background: accentHeaderBg, borderBottom: `1px solid ${accentBorder}` }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d={icon} />
                </svg>
                <div>
                    <span style={{ ...styles.cardTitle, color: accent }}>{title}</span>
                    {subtitle && <span style={styles.cardSubtitle}>{subtitle}</span>}
                </div>
            </div>
            {children}
        </div>
    )
}

/* ── Spinner ─────────────────────────────────────────────────────────────── */
function Spinner() {
    return <span style={spinnerStyle} />
}

const spinnerStyle = {
    display: 'inline-block',
    width: 16,
    height: 16,
    border: '2px solid rgba(255,255,255,0.3)',
    borderTopColor: '#fff',
    borderRadius: '50%',
    animation: 'spinRing 0.7s linear infinite',
}

/* ── Styles ─────────────────────────────────────────────────────────────── */
const styles = {
    row: {
        display: 'flex',
        gap: 10,
        alignItems: 'center',
    },
    inputWrap: {
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 12,
        padding: '11px 16px',
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
    },
    inputDisabled: { opacity: 0.45 },
    searchIcon: { width: 16, height: 16, color: '#475569', flexShrink: 0 },
    input: {
        flex: 1,
        background: 'none',
        border: 'none',
        outline: 'none',
        color: '#f1f5f9',
        fontSize: '0.9rem',
        fontFamily: 'Inter, sans-serif',
    },
    btn: {
        display: 'flex',
        alignItems: 'center',
        gap: 7,
        padding: '11px 20px',
        border: 'none',
        borderRadius: 12,
        color: '#fff',
        fontSize: '0.88rem',
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'background 0.2s ease, opacity 0.2s ease',
        fontFamily: 'Inter, sans-serif',
        flexShrink: 0,
        whiteSpace: 'nowrap',
    },
    btnDisabled: { opacity: 0.35, cursor: 'not-allowed' },
    gateHint: {
        position: 'absolute',
        top: 'calc(100% + 6px)',
        left: '50%',
        transform: 'translateX(-50%)',
        fontSize: '0.7rem',
        color: '#475569',
        whiteSpace: 'nowrap',
        fontFamily: 'Inter, sans-serif',
        pointerEvents: 'none',
    },
    warn: {
        marginTop: 10,
        fontSize: '0.78rem',
        color: '#475569',
        fontFamily: 'Inter, sans-serif',
    },
    /* Cards */
    card: {
        marginTop: 22,
        borderRadius: 14,
        overflow: 'hidden',
    },
    cardHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '12px 18px',
    },
    cardTitle: {
        display: 'block',
        fontSize: '0.78rem',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        fontFamily: 'Inter, sans-serif',
    },
    cardSubtitle: {
        display: 'block',
        fontSize: '0.72rem',
        color: '#475569',
        fontFamily: 'Inter, sans-serif',
        marginTop: 1,
    },
    preBody: {
        padding: '18px',
        margin: 0,
        fontSize: '0.88rem',
        lineHeight: 1.8,
        color: '#cbd5e1',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
        fontFamily: 'Inter, sans-serif',
    },
    /* Tavily results */
    resultsList: { padding: '10px 14px 14px' },
    answerBlock: {
        padding: '12px 14px',
        marginBottom: 12,
        background: 'rgba(20,184,166,0.07)',
        borderRadius: 10,
        border: '1px solid rgba(20,184,166,0.15)',
    },
    answerText: {
        margin: '8px 0 0',
        fontSize: '0.88rem',
        lineHeight: 1.75,
        color: '#e2e8f0',
        fontFamily: 'Inter, sans-serif',
    },
    resultItem: {
        padding: '12px 14px',
        marginBottom: 8,
        background: 'rgba(255,255,255,0.03)',
        borderRadius: 10,
        border: '1px solid rgba(255,255,255,0.06)',
    },
    resultItemHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginBottom: 6,
    },
    tag: {
        fontSize: '0.68rem',
        fontWeight: 700,
        padding: '2px 8px',
        borderRadius: 99,
        fontFamily: 'Inter, sans-serif',
        letterSpacing: '0.05em',
        flexShrink: 0,
    },
    resultUrl: {
        fontSize: '0.72rem',
        color: '#475569',
        textDecoration: 'none',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        fontFamily: 'Inter, sans-serif',
        maxWidth: 400,
    },
    resultTitle: {
        margin: '0 0 6px',
        fontSize: '0.88rem',
        fontWeight: 600,
        color: '#f1f5f9',
        fontFamily: 'Inter, sans-serif',
    },
    resultContent: {
        margin: 0,
        fontSize: '0.82rem',
        lineHeight: 1.7,
        color: '#94a3b8',
        fontFamily: 'Inter, sans-serif',
        display: '-webkit-box',
        WebkitLineClamp: 3,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
    },
}

export default Input
