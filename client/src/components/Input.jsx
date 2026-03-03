import { useState } from 'react'
import ReactMarkdown from 'react-markdown'

/* ── Step Flow Indicator ────────────────────────────────────────────────────── */
const STEPS = [
    { n: 1, label: 'Scout', color: '#6366f1' },
    { n: 2, label: 'Search', color: '#14b8a6' },
    { n: 3, label: 'Analyse', color: '#f59e0b' },
]

function FlowIndicator({ activeStep }) {
    return (
        <div style={flowStyles.wrap}>
            {STEPS.map((s, i) => {
                const done = activeStep > s.n
                const active = activeStep === s.n
                return (
                    <div key={s.n} style={flowStyles.item}>
                        <div style={{
                            ...flowStyles.dot,
                            background: done || active ? s.color : 'transparent',
                            border: `2px solid ${done || active ? s.color : '#334155'}`,
                            boxShadow: active ? `0 0 10px ${s.color}88` : 'none',
                        }}>
                            {done
                                ? <svg width="10" height="10" viewBox="0 0 20 20" fill="#fff"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                : <span style={{ ...flowStyles.dotNum, color: active ? '#fff' : '#475569' }}>{s.n}</span>
                            }
                        </div>
                        <span style={{ ...flowStyles.label, color: done || active ? '#e2e8f0' : '#475569' }}>
                            {s.label}
                        </span>
                        {i < STEPS.length - 1 && (
                            <span style={{ ...flowStyles.connector, background: activeStep > s.n ? s.color : '#1e293b' }} />
                        )}
                    </div>
                )
            })}
        </div>
    )
}

const flowStyles = {
    wrap: {
        display: 'flex',
        alignItems: 'center',
        gap: 0,
        marginBottom: 18,
    },
    item: {
        display: 'flex',
        alignItems: 'center',
        gap: 7,
    },
    dot: {
        width: 22,
        height: 22,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        transition: 'all 0.3s ease',
    },
    dotNum: {
        fontSize: '0.65rem',
        fontWeight: 700,
        fontFamily: 'Inter, sans-serif',
    },
    label: {
        fontSize: '0.72rem',
        fontWeight: 600,
        fontFamily: 'Inter, sans-serif',
        letterSpacing: '0.03em',
        transition: 'color 0.3s ease',
    },
    connector: {
        display: 'block',
        width: 28,
        height: 2,
        borderRadius: 2,
        margin: '0 6px',
        transition: 'background 0.3s ease',
    },
}

/* ── Markdown renderer component ────────────────────────────────────────────── */
function MdBody({ children }) {
    return (
        <div style={mdStyles.root}>
            <ReactMarkdown
                components={{
                    h1: ({ children }) => <h1 style={mdStyles.h1}>{children}</h1>,
                    h2: ({ children }) => <h2 style={mdStyles.h2}>{children}</h2>,
                    h3: ({ children }) => <h3 style={mdStyles.h3}>{children}</h3>,
                    p: ({ children }) => <p style={mdStyles.p}>{children}</p>,
                    ul: ({ children }) => <ul style={mdStyles.ul}>{children}</ul>,
                    ol: ({ children }) => <ol style={mdStyles.ol}>{children}</ol>,
                    li: ({ children }) => <li style={mdStyles.li}>{children}</li>,
                    strong: ({ children }) => <strong style={mdStyles.strong}>{children}</strong>,
                    em: ({ children }) => <em style={mdStyles.em}>{children}</em>,
                    hr: () => <hr style={mdStyles.hr} />,
                    code: ({ inline, children }) =>
                        inline
                            ? <code style={mdStyles.inlineCode}>{children}</code>
                            : <pre style={mdStyles.codeBlock}><code>{children}</code></pre>,
                    a: ({ href, children }) => (
                        <a href={href} target="_blank" rel="noopener noreferrer" style={mdStyles.a}>{children}</a>
                    ),
                }}
            >
                {children}
            </ReactMarkdown>
        </div>
    )
}

const mdStyles = {
    root: { padding: '16px 20px', fontFamily: 'Inter, sans-serif' },
    h1: { fontSize: '1.05rem', fontWeight: 700, color: '#f1f5f9', margin: '0 0 12px', lineHeight: 1.3 },
    h2: { fontSize: '0.92rem', fontWeight: 700, color: '#e2e8f0', margin: '18px 0 8px', lineHeight: 1.3 },
    h3: { fontSize: '0.84rem', fontWeight: 600, color: '#cbd5e1', margin: '14px 0 6px', lineHeight: 1.3 },
    p: { fontSize: '0.85rem', lineHeight: 1.75, color: '#94a3b8', margin: '0 0 10px' },
    ul: { margin: '0 0 10px', paddingLeft: 20 },
    ol: { margin: '0 0 10px', paddingLeft: 20 },
    li: { fontSize: '0.85rem', lineHeight: 1.75, color: '#94a3b8', marginBottom: 4 },
    strong: { fontWeight: 700, color: '#e2e8f0' },
    em: { fontStyle: 'italic', color: '#cbd5e1' },
    hr: { border: 'none', borderTop: '1px solid rgba(255,255,255,0.06)', margin: '14px 0' },
    inlineCode: {
        background: 'rgba(255,255,255,0.07)',
        borderRadius: 4,
        padding: '1px 5px',
        fontSize: '0.82rem',
        color: '#a78bfa',
        fontFamily: 'monospace',
    },
    codeBlock: {
        background: 'rgba(0,0,0,0.3)',
        borderRadius: 8,
        padding: '12px 16px',
        fontSize: '0.8rem',
        color: '#a5b4fc',
        fontFamily: 'monospace',
        overflowX: 'auto',
        margin: '8px 0',
    },
    a: { color: '#818cf8', textDecoration: 'underline', textUnderlineOffset: 3 },
}

/* ── Agent Panel (collapsible section inside the report card) ───────────────── */
function AgentPanel({ title, subtitle, accentColor, accentBg, accentBorder, statusBadge, statusBadgeColor, content }) {
    const [open, setOpen] = useState(true)
    return (
        <div style={{ borderBottom: `1px solid rgba(255,255,255,0.05)` }}>
            <button
                style={{ ...panelStyles.toggle, background: open ? accentBg : 'transparent' }}
                onClick={() => setOpen(o => !o)}
            >
                <div style={panelStyles.toggleLeft}>
                    <span style={{ ...panelStyles.badge, color: accentColor, borderColor: accentBorder, background: accentBg }}>
                        {title}
                    </span>
                    <span style={panelStyles.subtitle}>{subtitle}</span>
                </div>
                <div style={panelStyles.toggleRight}>
                    {statusBadge && (
                        <span style={{ ...panelStyles.statusBadge, color: statusBadgeColor, borderColor: statusBadgeColor + '40', background: statusBadgeColor + '15' }}>
                            {statusBadge}
                        </span>
                    )}
                    <svg
                        width="14" height="14" viewBox="0 0 20 20" fill={accentColor}
                        style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease', flexShrink: 0 }}
                    >
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </div>
            </button>
            {open && <MdBody>{content}</MdBody>}
        </div>
    )
}

const panelStyles = {
    toggle: {
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 18px',
        border: 'none',
        cursor: 'pointer',
        transition: 'background 0.2s ease',
        gap: 12,
    },
    toggleLeft: { display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden' },
    toggleRight: { display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 },
    badge: {
        fontSize: '0.7rem',
        fontWeight: 700,
        padding: '2px 9px',
        borderRadius: 99,
        border: '1px solid',
        fontFamily: 'Inter, sans-serif',
        letterSpacing: '0.05em',
        whiteSpace: 'nowrap',
        flexShrink: 0,
    },
    subtitle: {
        fontSize: '0.75rem',
        color: '#475569',
        fontFamily: 'Inter, sans-serif',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
    },
    statusBadge: {
        fontSize: '0.65rem',
        fontWeight: 700,
        padding: '2px 8px',
        borderRadius: 99,
        border: '1px solid',
        fontFamily: 'Inter, sans-serif',
        letterSpacing: '0.05em',
        whiteSpace: 'nowrap',
    },
}

/* ── Main Input component ──────────────────────────────────────────────────── */
const Input = ({ selectedModel }) => {
    const [query, setQuery] = useState('')
    const [analysisResult, setAnalysisResult] = useState(null)   // expanded queries text
    const [searchResult, setSearchResult] = useState(null)        // tavily results array
    const [analyseLoading, setAnalyseLoading] = useState(false)
    const [searchLoading, setSearchLoading] = useState(false)
    const [hasAnalysed, setHasAnalysed] = useState(false)         // gate for Search btn
    const [reportResult, setReportResult] = useState(null)        // { analyst_report, critic_verdict, strategy_report }
    const [reportLoading, setReportLoading] = useState(false)

    /* active step: 1 = none done, 2 = analysed, 3 = searched, 4 = reported */
    const activeStep = reportResult ? 4 : searchResult ? 3 : hasAnalysed ? 2 : 1

    /* ── Reset when user changes the query ── */
    const handleQueryChange = (e) => {
        setQuery(e.target.value)
        setAnalysisResult(null)
        setSearchResult(null)
        setHasAnalysed(false)
        setReportResult(null)
    }

    /* ── Step 1: Analyse Query (Research Scout — Gemini expansion) ── */
    const handleAnalyse = async () => {
        if (!query.trim() || !selectedModel) return
        setAnalyseLoading(true)
        setAnalysisResult(null)
        setSearchResult(null)
        setHasAnalysed(false)
        setReportResult(null)
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

    /* ── Step 2: Start Search (Research Scout — Tavily) ── */
    const handleSearch = async () => {
        if (!query.trim() || !hasAnalysed) return
        setSearchLoading(true)
        setSearchResult(null)
        setReportResult(null)
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

    /* ── Step 3: Full pipeline (Analyst → Critic → Director) ── */
    const handleAnalyzeReport = async () => {
        if (!searchResult || !selectedModel) return
        setReportLoading(true)
        setReportResult(null)
        try {
            const res = await fetch('http://localhost:5000/api/resultAnalyzer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ results: searchResult, query, model: selectedModel }),
            })
            const data = await res.json()
            if (res.ok) {
                setReportResult(data)   // { analyst_report, critic_verdict, strategy_report }
            } else {
                setReportResult({ error: data.error })
            }
        } catch (err) {
            setReportResult({ error: err.message })
        } finally {
            setReportLoading(false)
        }
    }

    const analyseDisabled = analyseLoading || !selectedModel || !query.trim()
    const searchDisabled = searchLoading || !hasAnalysed
    const reportDisabled = reportLoading || !searchResult

    /* Derive critic badge */
    const criticIsApproved = reportResult?.critic_verdict?.toUpperCase().startsWith('APPROVED')
    const criticBadge = reportResult
        ? (criticIsApproved ? '✓ Approved' : '⚠ Revised')
        : null
    const criticColor = criticIsApproved ? '#22c55e' : '#f59e0b'

    return (
        <div>
            {/* ── Flow indicator ── */}
            <FlowIndicator activeStep={activeStep} />

            {/* ── Search bar + all 3 buttons in one row ── */}
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
                    label="Analyse"
                    icon="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 11h-1v6a1 1 0 01-1 1h-3a1 1 0 01-1-1v-3H9v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-6H3a1 1 0 01-.707-1.707l7-7z"
                    gradient={['#6366f1', '#818cf8', '#4f46e5', '#7c3aed']}
                />

                {/* Start Search button */}
                <div style={{ position: 'relative' }}>
                    <ActionButton
                        onClick={handleSearch}
                        disabled={searchDisabled}
                        loading={searchLoading}
                        label="Search"
                        icon="M3 9.5a1 1 0 011-1h1.586l-2.293-2.293a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L6.586 10.5H4a1 1 0 01-1-1zm10.707-4.207a1 1 0 010 1.414L11.414 9H16a1 1 0 110 2h-4.586l2.293 2.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                        gradient={['#14b8a6', '#2dd4bf', '#0d9488', '#0f766e']}
                    />
                    {!hasAnalysed && !searchLoading && (
                        <span style={styles.gateHint}>Analyse first</span>
                    )}
                </div>

                {/* Analyze Report button */}
                <div style={{ position: 'relative' }}>
                    <ActionButton
                        onClick={handleAnalyzeReport}
                        disabled={reportDisabled}
                        loading={reportLoading}
                        label="Report"
                        icon="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 15V5.25m19.5 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 7.409A2.25 2.25 0 012.25 5.493V5.25"
                        gradient={['#f59e0b', '#fbbf24', '#d97706', '#b45309']}
                    />
                    {!searchResult && !reportLoading && (
                        <span style={styles.gateHint}>Search first</span>
                    )}
                </div>
            </div>

            {/* ── No model warning ── */}
            {!selectedModel && (
                <p style={styles.warn}>← Choose a model from the dropdown to begin</p>
            )}

            {/* ── Card 1: Research Scout — Expanded Queries (indigo) ── */}
            {analysisResult && (
                <ResultCard
                    title="Research Scout"
                    subtitle="Query expanded — 3–5 sub-queries generated by Gemini"
                    accent="#6366f1"
                    accentBg="rgba(99,102,241,0.06)"
                    accentBorder="rgba(99,102,241,0.2)"
                    accentHeaderBg="rgba(99,102,241,0.08)"
                    icon="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15M14.25 3.104c.251.023.501.05.75.082M19.8 15l-1.575-1.573M19.8 15l1.35 1.35a1.5 1.5 0 010 2.121l-.527.528a1.5 1.5 0 01-2.12 0L17 17.5m-12.8-2.5l1.35-1.35m0 0L4.2 12.3a1.5 1.5 0 010-2.12l.527-.528a1.5 1.5 0 012.12 0L8.2 11"
                >
                    <MdBody>{analysisResult}</MdBody>
                </ResultCard>
            )}

            {/* ── Card 2: Research Scout — Tavily Search Results (teal) ── */}
            {searchResult && (
                <ResultCard
                    title="Research Scout — Live Results"
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

            {/* ── Card 3: Full Agent Pipeline Report ── */}
            {reportResult && !reportResult.error && (
                <ResultCard
                    title="Intelligence Briefing"
                    subtitle="Data Analyst · Critic · Strategy Director"
                    accent="#f59e0b"
                    accentBg="rgba(245,158,11,0.05)"
                    accentBorder="rgba(245,158,11,0.2)"
                    accentHeaderBg="rgba(245,158,11,0.08)"
                    icon="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 15V5.25m19.5 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 7.409A2.25 2.25 0 012.25 5.493V5.25"
                >
                    {/* Strategy Director — shown first / most prominent */}
                    <AgentPanel
                        title="Strategy Director"
                        subtitle="C-Suite executive briefing & recommendations"
                        accentColor="#a78bfa"
                        accentBg="rgba(167,139,250,0.07)"
                        accentBorder="rgba(167,139,250,0.25)"
                        content={reportResult.strategy_report}
                    />
                    {/* Data Analyst */}
                    <AgentPanel
                        title="Data Analyst"
                        subtitle="SWOT analysis · Trends · Competitor shifts"
                        accentColor="#14b8a6"
                        accentBg="rgba(20,184,166,0.06)"
                        accentBorder="rgba(20,184,166,0.2)"
                        content={reportResult.analyst_report}
                    />
                    {/* Critic */}
                    <AgentPanel
                        title="Critic"
                        subtitle="Quality review verdict"
                        accentColor={criticColor}
                        accentBg={criticIsApproved ? 'rgba(34,197,94,0.06)' : 'rgba(245,158,11,0.06)'}
                        accentBorder={criticIsApproved ? 'rgba(34,197,94,0.2)' : 'rgba(245,158,11,0.2)'}
                        statusBadge={criticBadge}
                        statusBadgeColor={criticColor}
                        content={reportResult.critic_verdict}
                    />
                </ResultCard>
            )}

            {/* Error case */}
            {reportResult?.error && (
                <p style={{ ...styles.warn, color: '#f87171', marginTop: 16 }}>⚠ {reportResult.error}</p>
            )}
        </div>
    )
}

/* ── Reusable ActionButton ─────────────────────────────────────────────────── */
function ActionButton({ onClick, disabled, loading, label, icon, gradient }) {
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
                    <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
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
    width: 14,
    height: 14,
    border: '2px solid rgba(255,255,255,0.3)',
    borderTopColor: '#fff',
    borderRadius: '50%',
    animation: 'spinRing 0.7s linear infinite',
}

/* ── Styles ─────────────────────────────────────────────────────────────── */
const styles = {
    row: {
        display: 'flex',
        gap: 8,
        alignItems: 'center',
        flexWrap: 'wrap',
    },
    inputWrap: {
        flex: 1,
        minWidth: 160,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 12,
        padding: '10px 14px',
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
    },
    inputDisabled: { opacity: 0.45 },
    searchIcon: { width: 15, height: 15, color: '#475569', flexShrink: 0 },
    input: {
        flex: 1,
        background: 'none',
        border: 'none',
        outline: 'none',
        color: '#f1f5f9',
        fontSize: '0.88rem',
        fontFamily: 'Inter, sans-serif',
        minWidth: 0,
    },
    btn: {
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '10px 16px',
        border: 'none',
        borderRadius: 12,
        color: '#fff',
        fontSize: '0.82rem',
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
        top: 'calc(100% + 5px)',
        left: '50%',
        transform: 'translateX(-50%)',
        fontSize: '0.65rem',
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
        fontSize: '0.85rem',
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
        fontSize: '0.85rem',
        fontWeight: 600,
        color: '#f1f5f9',
        fontFamily: 'Inter, sans-serif',
    },
    resultContent: {
        margin: 0,
        fontSize: '0.8rem',
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
