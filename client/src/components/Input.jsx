import { useState } from 'react'

const Input = ({ selectedModel }) => {
    const [query, setQuery] = useState('')
    const [response, setResponse] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSearch = async () => {
        if (!query.trim()) return
        if (!selectedModel) return

        setLoading(true)
        setResponse('')
        try {
            const res = await fetch('http://localhost:5000/api/search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query, model: selectedModel }),
            })
            const data = await res.json()
            setResponse(res.ok ? data.result : `Error: ${data.error}`)
        } catch (err) {
            setResponse(`Error: ${err.message}`)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div>
            {/* ── Search bar ── */}
            <div style={styles.row}>
                <div
                    style={{
                        ...styles.inputWrap,
                        ...(selectedModel ? {} : styles.inputDisabled),
                    }}
                >
                    <svg style={styles.searchIcon} viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd"
                            d="M9 3a6 6 0 100 12A6 6 0 009 3zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
                            clipRule="evenodd" />
                    </svg>
                    <input
                        type="text"
                        placeholder={
                            selectedModel
                                ? 'e.g. Apple stock price trend this quarter…'
                                : 'Select a model above first'
                        }
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSearch()}
                        disabled={!selectedModel}
                        style={styles.input}
                    />
                </div>

                <button
                    onClick={handleSearch}
                    disabled={loading || !selectedModel || !query.trim()}
                    style={{
                        ...styles.btn,
                        ...(loading || !selectedModel || !query.trim()
                            ? styles.btnDisabled
                            : {}),
                    }}
                    onMouseEnter={e => {
                        if (!loading && selectedModel && query.trim())
                            e.currentTarget.style.background =
                                'linear-gradient(135deg,#4f46e5,#7c3aed)';
                    }}
                    onMouseLeave={e => {
                        if (!loading && selectedModel && query.trim())
                            e.currentTarget.style.background =
                                'linear-gradient(135deg,#6366f1,#818cf8)';
                    }}
                >
                    {loading ? <Spinner /> : (
                        <>
                            <svg width="15" height="15" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 11h-1v6a1 1 0 01-1 1h-3a1 1 0 01-1-1v-3H9v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-6H3a1 1 0 01-.707-1.707l7-7z" />
                            </svg>
                            Analyse
                        </>
                    )}
                </button>
            </div>

            {/* ── No model warning ── */}
            {!selectedModel && (
                <p style={styles.warn}>← Choose a model from the dropdown to begin</p>
            )}

            {/* ── Response card ── */}
            {response && (
                <div style={styles.result} className="slide-up">
                    <div style={styles.resultHeader}>
                        <svg width="15" height="15" viewBox="0 0 20 20" fill="#6366f1">
                            <path fillRule="evenodd"
                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z"
                                clipRule="evenodd" />
                        </svg>
                        <span style={styles.resultTitle}>Scout Agent Response</span>
                    </div>
                    <pre style={styles.resultBody}>{response}</pre>
                </div>
            )}
        </div>
    )
}

/* ── Spinner ─────────────────────────────────────────────────────────────── */
function Spinner() {
    return (
        <span style={spinnerStyle} />
    )
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
    inputDisabled: {
        opacity: 0.45,
    },
    searchIcon: {
        width: 16,
        height: 16,
        color: '#475569',
        flexShrink: 0,
    },
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
        padding: '11px 22px',
        background: 'linear-gradient(135deg, #6366f1, #818cf8)',
        border: 'none',
        borderRadius: 12,
        color: '#fff',
        fontSize: '0.88rem',
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'background 0.2s ease, opacity 0.2s ease, transform 0.15s ease',
        fontFamily: 'Inter, sans-serif',
        flexShrink: 0,
        whiteSpace: 'nowrap',
    },
    btnDisabled: {
        opacity: 0.4,
        cursor: 'not-allowed',
    },
    warn: {
        marginTop: 10,
        fontSize: '0.78rem',
        color: '#475569',
        fontFamily: 'Inter, sans-serif',
    },
    result: {
        marginTop: 22,
        background: 'rgba(99,102,241,0.06)',
        border: '1px solid rgba(99,102,241,0.2)',
        borderRadius: 14,
        overflow: 'hidden',
    },
    resultHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '12px 18px',
        borderBottom: '1px solid rgba(99,102,241,0.12)',
        background: 'rgba(99,102,241,0.05)',
    },
    resultTitle: {
        fontSize: '0.78rem',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        color: '#6366f1',
        fontFamily: 'Inter, sans-serif',
    },
    resultBody: {
        padding: '18px',
        margin: 0,
        fontSize: '0.88rem',
        lineHeight: 1.8,
        color: '#cbd5e1',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
        fontFamily: 'Inter, sans-serif',
    },
}

export default Input
