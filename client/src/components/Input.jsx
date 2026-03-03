import { useState, useRef } from 'react'
import ReactMarkdown from 'react-markdown'

/* ── Helpers ─────────────────────────────────────────────────────────────── */
const getStoredKeys = () => ({
    gemini_key: localStorage.getItem('ms_gemini_key') || '',
    tavily_key: localStorage.getItem('ms_tavily_key') || '',
})

const isQuotaError = (status, errMsg = '') => {
    const msg = errMsg.toLowerCase()
    return (
        status === 429 ||
        msg.includes('quota') ||
        msg.includes('429') ||
        msg.includes('resource_exhausted') ||
        msg.includes('too many requests')
    )
}

/* ── Markdown renderer ───────────────────────────────────────────────────── */
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
    h1: { fontSize: '1.05rem', fontWeight: 700, color: 'var(--text)', margin: '0 0 12px', lineHeight: 1.3 },
    h2: { fontSize: '0.92rem', fontWeight: 700, color: 'var(--text)', margin: '18px 0 8px', lineHeight: 1.3 },
    h3: { fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-muted)', margin: '14px 0 6px', lineHeight: 1.3 },
    p: { fontSize: '0.85rem', lineHeight: 1.75, color: 'var(--text-muted)', margin: '0 0 10px' },
    ul: { margin: '0 0 10px', paddingLeft: 20 },
    ol: { margin: '0 0 10px', paddingLeft: 20 },
    li: { fontSize: '0.85rem', lineHeight: 1.75, color: 'var(--text-muted)', marginBottom: 4 },
    strong: { fontWeight: 700, color: 'var(--text)' },
    em: { fontStyle: 'italic', color: 'var(--text-muted)' },
    hr: { border: 'none', borderTop: '1px solid var(--border)', margin: '14px 0' },
    inlineCode: {
        background: 'var(--bg-input)',
        borderRadius: 4,
        padding: '1px 5px',
        fontSize: '0.82rem',
        color: 'var(--accent-2)',
        fontFamily: 'monospace',
    },
    codeBlock: {
        background: 'var(--bg-input)',
        borderRadius: 8,
        padding: '12px 16px',
        fontSize: '0.8rem',
        color: 'var(--accent-2)',
        fontFamily: 'monospace',
        overflowX: 'auto',
        margin: '8px 0',
    },
    a: { color: 'var(--accent-2)', textDecoration: 'underline', textUnderlineOffset: 3 },
}

/* ── Collapsible Agent Panel ────────────────────────────────────────────── */
function AgentPanel({ title, subtitle, accentColor, accentBg, accentBorder, statusBadge, statusBadgeColor, content }) {
    const [open, setOpen] = useState(true)
    return (
        <div style={{ borderBottom: '1px solid var(--border-subtle)' }}>
            <button
                style={{ ...panelStyles.toggle, background: open ? accentBg : 'transparent' }}
                onClick={() => setOpen(o => !o)}
            >
                <div style={panelStyles.left}>
                    <span style={{ ...panelStyles.badge, color: accentColor, borderColor: accentBorder, background: accentBg }}>
                        {title}
                    </span>
                    <span style={panelStyles.subtitle}>{subtitle}</span>
                </div>
                <div style={panelStyles.right}>
                    {statusBadge && (
                        <span style={{ ...panelStyles.statusBadge, color: statusBadgeColor, borderColor: statusBadgeColor + '40', background: statusBadgeColor + '15' }}>
                            {statusBadge}
                        </span>
                    )}
                    <svg
                        width="13" height="13" viewBox="0 0 20 20" fill={accentColor}
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
        padding: '11px 16px',
        border: 'none',
        cursor: 'pointer',
        transition: 'background 0.2s ease',
        gap: 10,
    },
    left: { display: 'flex', alignItems: 'center', gap: 9, overflow: 'hidden' },
    right: { display: 'flex', alignItems: 'center', gap: 7, flexShrink: 0 },
    badge: {
        fontSize: '0.68rem',
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
        fontSize: '0.73rem',
        color: 'var(--text-dim)',
        fontFamily: 'Inter, sans-serif',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
    },
    statusBadge: {
        fontSize: '0.63rem',
        fontWeight: 700,
        padding: '2px 8px',
        borderRadius: 99,
        border: '1px solid',
        fontFamily: 'Inter, sans-serif',
        letterSpacing: '0.05em',
        whiteSpace: 'nowrap',
    },
}

/* ── ResultCard ─────────────────────────────────────────────────────────── */
function ResultCard({ title, subtitle, accent, accentBg, accentBorder, icon, children }) {
    return (
        <div style={{ borderRadius: 14, overflow: 'hidden', background: accentBg, border: `1px solid ${accentBorder}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 16px', background: accentBg, borderBottom: `1px solid ${accentBorder}` }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d={icon} />
                </svg>
                <div>
                    <span style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'Inter, sans-serif', color: accent }}>{title}</span>
                    {subtitle && <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-dim)', fontFamily: 'Inter, sans-serif', marginTop: 1 }}>{subtitle}</span>}
                </div>
            </div>
            {children}
        </div>
    )
}

/* ── ActionButton ────────────────────────────────────────────────────────── */
function ActionButton({ onClick, disabled, loading, label, icon, gradient }) {
    const [base, hover, pressBase, pressHover] = gradient
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '9px 16px', border: 'none', borderRadius: 10,
                color: '#fff', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
                fontFamily: 'Inter, sans-serif', flexShrink: 0, whiteSpace: 'nowrap',
                background: `linear-gradient(135deg, ${base}, ${pressBase})`,
                opacity: disabled ? 0.35 : 1,
                transition: 'background 0.2s ease, opacity 0.2s ease',
            }}
            onMouseEnter={e => { if (!disabled) e.currentTarget.style.background = `linear-gradient(135deg,${hover},${pressHover})` }}
            onMouseLeave={e => { if (!disabled) e.currentTarget.style.background = `linear-gradient(135deg,${base},${pressBase})` }}
        >
            {loading ? <Spinner /> : (
                <>
                    <svg width="13" height="13" viewBox="0 0 20 20" fill="currentColor"><path d={icon} /></svg>
                    {label}
                </>
            )}
        </button>
    )
}

/* ── Spinner ─────────────────────────────────────────────────────────────── */
function Spinner() {
    return <span style={{ display: 'inline-block', width: 13, height: 13, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spinRing 0.7s linear infinite' }} />
}

/* ── Tab Strip ───────────────────────────────────────────────────────────── */
const TAB_META = {
    analyse: { label: '① Scout', color: '#6366f1' },
    search: { label: '② Search', color: '#14b8a6' },
    report: { label: '③ Report', color: '#f59e0b' },
}

function TabStrip({ tabs, active, onSelect }) {
    if (!tabs.length) return null
    return (
        <div style={tabStyles.strip}>
            {tabs.map(t => {
                const meta = TAB_META[t]
                const isActive = active === t
                return (
                    <button
                        key={t}
                        style={{
                            ...tabStyles.tab,
                            color: isActive ? meta.color : 'var(--text-dim)',
                            borderBottom: `2px solid ${isActive ? meta.color : 'transparent'}`,
                            background: isActive ? `${meta.color}12` : 'transparent',
                        }}
                        onClick={() => onSelect(t)}
                    >
                        {meta.label}
                    </button>
                )
            })}
        </div>
    )
}

const tabStyles = {
    strip: {
        display: 'flex',
        gap: 4,
        borderBottom: '1px solid var(--border)',
        marginTop: 20,
        marginBottom: 0,
    },
    tab: {
        padding: '9px 16px',
        border: 'none',
        borderBottom: '2px solid transparent',
        cursor: 'pointer',
        fontSize: '0.8rem',
        fontWeight: 600,
        fontFamily: 'Inter, sans-serif',
        letterSpacing: '0.02em',
        transition: 'color 0.2s ease, border-color 0.2s ease, background 0.2s ease',
        borderRadius: '8px 8px 0 0',
        whiteSpace: 'nowrap',
    },
}

/* ── Quota Error Banner ──────────────────────────────────────────────────── */
function QuotaBanner({ onOpenSettings, onDismiss }) {
    return (
        <div style={bannerStyles.wrap}>
            <span style={bannerStyles.icon}>⚠️</span>
            <span style={bannerStyles.msg}>
                The default API quota has been reached. Please enter your own API key in{' '}
                <button style={bannerStyles.link} onClick={onOpenSettings}>⚙ Settings</button>{' '}
                to continue.
            </span>
            <button style={bannerStyles.close} onClick={onDismiss}>✕</button>
        </div>
    )
}

const bannerStyles = {
    wrap: {
        display: 'flex',
        alignItems: 'flex-start',
        gap: 10,
        padding: '12px 16px',
        background: 'rgba(245,158,11,0.1)',
        border: '1px solid rgba(245,158,11,0.35)',
        borderRadius: 12,
        marginTop: 16,
    },
    icon: { fontSize: '1rem', flexShrink: 0, marginTop: 1 },
    msg: { flex: 1, fontSize: '0.82rem', lineHeight: 1.55, color: '#fbbf24', fontFamily: 'Inter, sans-serif' },
    link: { background: 'none', border: 'none', color: '#fbbf24', textDecoration: 'underline', textUnderlineOffset: 2, cursor: 'pointer', fontSize: 'inherit', padding: 0, fontWeight: 600 },
    close: { background: 'none', border: 'none', color: '#92400e', cursor: 'pointer', fontSize: '0.85rem', flexShrink: 0, padding: '0 2px' },
}

/* ── Main Input Component ────────────────────────────────────────────────── */
const Input = ({ selectedModel, onOpenSettings }) => {
    const [query, setQuery] = useState('')
    const [analysisResult, setAnalysisResult] = useState(null)
    const [searchResult, setSearchResult] = useState(null)
    const [reportResult, setReportResult] = useState(null)
    const [analyseLoading, setAnalyseLoading] = useState(false)
    const [searchLoading, setSearchLoading] = useState(false)
    const [reportLoading, setReportLoading] = useState(false)
    const [hasAnalysed, setHasAnalysed] = useState(false)
    const [currentTab, setCurrentTab] = useState(null)
    const [quotaError, setQuotaError] = useState(false)
    const textareaRef = useRef(null)

    /* Auto-expand textarea */
    const autoResize = () => {
        const el = textareaRef.current
        if (!el) return
        el.style.height = 'auto'
        el.style.height = Math.min(el.scrollHeight, 260) + 'px'
    }

    /* Reset state on query change */
    const handleQueryChange = (e) => {
        setQuery(e.target.value)
        setAnalysisResult(null)
        setSearchResult(null)
        setReportResult(null)
        setHasAnalysed(false)
        setCurrentTab(null)
        setQuotaError(false)
        autoResize()
    }

    /* Step 1 — Research Scout: query expansion */
    const handleAnalyse = async () => {
        if (!query.trim() || !selectedModel) return
        setAnalyseLoading(true)
        setAnalysisResult(null)
        setSearchResult(null)
        setReportResult(null)
        setHasAnalysed(false)
        setCurrentTab(null)
        setQuotaError(false)
        try {
            const res = await fetch('http://localhost:5000/api/analyse', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query, model: selectedModel, ...getStoredKeys() }),
            })
            const data = await res.json()
            if (res.ok) {
                setAnalysisResult(data.expanded)
                setHasAnalysed(true)
                setCurrentTab('analyse')
            } else {
                if (isQuotaError(res.status, data.error)) setQuotaError(true)
                setAnalysisResult(`Error: ${data.error}`)
                setCurrentTab('analyse')
            }
        } catch (err) {
            setAnalysisResult(`Error: ${err.message}`)
            setCurrentTab('analyse')
        } finally {
            setAnalyseLoading(false)
        }
    }

    /* Step 2 — Research Scout: Tavily search */
    const handleSearch = async () => {
        if (!query.trim() || !hasAnalysed) return
        setSearchLoading(true)
        setSearchResult(null)
        setReportResult(null)
        setQuotaError(false)
        try {
            const res = await fetch('http://localhost:5000/api/search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query, ...getStoredKeys() }),
            })
            const data = await res.json()
            if (res.ok) {
                setSearchResult(data.results)
                setCurrentTab('search')
            } else {
                if (isQuotaError(res.status, data.error)) setQuotaError(true)
                setSearchResult([{ type: 'error', content: data.error }])
                setCurrentTab('search')
            }
        } catch (err) {
            setSearchResult([{ type: 'error', content: err.message }])
            setCurrentTab('search')
        } finally {
            setSearchLoading(false)
        }
    }

    /* Step 3 — Full 4-agent pipeline */
    const handleAnalyzeReport = async () => {
        if (!searchResult || !selectedModel) return
        setReportLoading(true)
        setReportResult(null)
        setQuotaError(false)
        try {
            const res = await fetch('http://localhost:5000/api/resultAnalyzer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ results: searchResult, query, model: selectedModel, ...getStoredKeys() }),
            })
            const data = await res.json()
            if (res.ok) {
                setReportResult(data)
                setCurrentTab('report')
            } else {
                if (isQuotaError(res.status, data.error)) setQuotaError(true)
                setReportResult({ error: data.error })
                setCurrentTab('report')
            }
        } catch (err) {
            setReportResult({ error: err.message })
            setCurrentTab('report')
        } finally {
            setReportLoading(false)
        }
    }

    /* Derived state */
    const analyseDisabled = analyseLoading || !selectedModel || !query.trim()
    const searchDisabled = searchLoading || !hasAnalysed
    const reportDisabled = reportLoading || !searchResult

    const availableTabs = [
        analysisResult ? 'analyse' : null,
        searchResult ? 'search' : null,
        reportResult ? 'report' : null,
    ].filter(Boolean)

    const criticIsApproved = reportResult?.critic_verdict?.toUpperCase().startsWith('APPROVED')
    const criticColor = criticIsApproved ? '#22c55e' : '#f59e0b'

    return (
        <div>
            {/* ── Quota error banner ── */}
            {quotaError && (
                <QuotaBanner
                    onOpenSettings={() => { setQuotaError(false); onOpenSettings?.() }}
                    onDismiss={() => setQuotaError(false)}
                />
            )}

            {/* ── Auto-expanding Textarea ── */}
            <div style={{ ...styles.inputWrap, ...(selectedModel ? {} : styles.inputDisabled) }}>
                <svg style={styles.searchIcon} viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 3a6 6 0 100 12A6 6 0 009 3zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
                </svg>
                <textarea
                    ref={textareaRef}
                    placeholder={selectedModel ? 'Ask anything about a market, company, or trend… (Shift+Enter for new line)' : 'Select a model above first'}
                    value={query}
                    onChange={handleQueryChange}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAnalyse() } }}
                    disabled={!selectedModel}
                    rows={1}
                    style={styles.textarea}
                />
            </div>

            {/* ── Action buttons row ── */}
            <div style={styles.btnRow}>
                {!selectedModel && <p style={styles.warn}>← Choose a model above first</p>}
                <div style={styles.btnGroup}>
                    <ActionButton
                        onClick={handleAnalyse}
                        disabled={analyseDisabled}
                        loading={analyseLoading}
                        label="Analyse Query"
                        icon="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 11h-1v6a1 1 0 01-1 1h-3a1 1 0 01-1-1v-3H9v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-6H3a1 1 0 01-.707-1.707l7-7z"
                        gradient={['#6366f1', '#818cf8', '#4f46e5', '#7c3aed']}
                    />
                    <div style={{ position: 'relative' }}>
                        <ActionButton
                            onClick={handleSearch}
                            disabled={searchDisabled}
                            loading={searchLoading}
                            label="Start Search"
                            icon="M3 9.5a1 1 0 011-1h1.586l-2.293-2.293a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L6.586 10.5H4a1 1 0 01-1-1zm10.707-4.207a1 1 0 010 1.414L11.414 9H16a1 1 0 110 2h-4.586l2.293 2.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                            gradient={['#14b8a6', '#2dd4bf', '#0d9488', '#0f766e']}
                        />
                        {!hasAnalysed && !searchLoading && <span style={styles.gateHint}>Analyse first</span>}
                    </div>
                    <div style={{ position: 'relative' }}>
                        <ActionButton
                            onClick={handleAnalyzeReport}
                            disabled={reportDisabled}
                            loading={reportLoading}
                            label="Analyze Report"
                            icon="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 15V5.25m19.5 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 7.409A2.25 2.25 0 012.25 5.493V5.25"
                            gradient={['#f59e0b', '#fbbf24', '#d97706', '#b45309']}
                        />
                        {!searchResult && !reportLoading && <span style={styles.gateHint}>Search first</span>}
                    </div>
                </div>
            </div>

            {/* ── Tab strip ── */}
            <TabStrip tabs={availableTabs} active={currentTab} onSelect={setCurrentTab} />

            {/* ── Tab content panel ── */}
            {currentTab && (
                <div key={currentTab} className="tab-active" style={styles.tabPanel}>
                    {/* ── Tab: analyse ── */}
                    {currentTab === 'analyse' && analysisResult && (
                        <ResultCard
                            title="Research Scout — Query Expansion"
                            subtitle="Sub-queries generated by Gemini"
                            accent="#6366f1"
                            accentBg="rgba(99,102,241,0.06)"
                            accentBorder="rgba(99,102,241,0.2)"
                            icon="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15M14.25 3.104c.251.023.501.05.75.082M19.8 15l-1.575-1.573M19.8 15l1.35 1.35a1.5 1.5 0 010 2.121l-.527.528a1.5 1.5 0 01-2.12 0L17 17.5m-12.8-2.5l1.35-1.35m0 0L4.2 12.3a1.5 1.5 0 010-2.12l.527-.528a1.5 1.5 0 012.12 0L8.2 11"
                        >
                            <MdBody>{analysisResult}</MdBody>
                        </ResultCard>
                    )}

                    {/* ── Tab: search ── */}
                    {currentTab === 'search' && searchResult && (
                        <ResultCard
                            title="Research Scout — Live Results"
                            subtitle="Powered by Tavily · Real-time web intelligence"
                            accent="#14b8a6"
                            accentBg="rgba(20,184,166,0.05)"
                            accentBorder="rgba(20,184,166,0.2)"
                            icon="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253M3 12c0 .778.099 1.533.284 2.253"
                        >
                            <div style={{ padding: '10px 14px 14px' }}>
                                {searchResult.map((item, i) => {
                                    if (item.type === 'answer') return (
                                        <div key={i} style={{ padding: '12px 14px', marginBottom: 12, background: 'rgba(20,184,166,0.07)', borderRadius: 10, border: '1px solid rgba(20,184,166,0.15)' }}>
                                            <span style={{ fontSize: '0.67rem', fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: 'rgba(20,184,166,0.15)', color: '#14b8a6', fontFamily: 'Inter, sans-serif', letterSpacing: '0.05em' }}>AI Answer</span>
                                            <p style={{ margin: '8px 0 0', fontSize: '0.85rem', lineHeight: 1.75, color: 'var(--text)', fontFamily: 'Inter, sans-serif' }}>{item.content}</p>
                                        </div>
                                    )
                                    if (item.type === 'error') return <p key={i} style={{ color: '#f87171', padding: '10px', fontFamily: 'Inter, sans-serif', fontSize: '0.85rem' }}>⚠ {item.content}</p>
                                    return (
                                        <div key={i} style={{ padding: '11px 13px', marginBottom: 8, background: 'var(--bg-result-item)', borderRadius: 10, border: '1px solid var(--border-subtle)' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 5 }}>
                                                <span style={{ fontSize: '0.66rem', fontWeight: 700, padding: '2px 7px', borderRadius: 99, background: 'rgba(20,184,166,0.1)', color: '#2dd4bf', fontFamily: 'Inter, sans-serif' }}>#{i}</span>
                                                <a href={item.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.71rem', color: 'var(--text-dim)', textDecoration: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'Inter, sans-serif', maxWidth: 440 }}>{item.url}</a>
                                            </div>
                                            <p style={{ margin: '0 0 5px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)', fontFamily: 'Inter, sans-serif' }}>{item.title}</p>
                                            <p style={{ margin: 0, fontSize: '0.8rem', lineHeight: 1.7, color: 'var(--text-muted)', fontFamily: 'Inter, sans-serif', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.content}</p>
                                        </div>
                                    )
                                })}
                            </div>
                        </ResultCard>
                    )}

                    {/* ── Tab: report ── */}
                    {currentTab === 'report' && reportResult && !reportResult.error && (
                        <ResultCard
                            title="Intelligence Briefing"
                            subtitle="Data Analyst · Critic · Strategy Director"
                            accent="#f59e0b"
                            accentBg="rgba(245,158,11,0.05)"
                            accentBorder="rgba(245,158,11,0.2)"
                            icon="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 15V5.25m19.5 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 7.409A2.25 2.25 0 012.25 5.493V5.25"
                        >
                            <AgentPanel
                                title="Strategy Director"
                                subtitle="C-Suite executive briefing & recommendations"
                                accentColor="#a78bfa"
                                accentBg="rgba(167,139,250,0.07)"
                                accentBorder="rgba(167,139,250,0.25)"
                                content={reportResult.strategy_report}
                            />
                            <AgentPanel
                                title="Data Analyst"
                                subtitle="SWOT analysis · Trends · Competitor shifts"
                                accentColor="#14b8a6"
                                accentBg="rgba(20,184,166,0.06)"
                                accentBorder="rgba(20,184,166,0.2)"
                                content={reportResult.analyst_report}
                            />
                            <AgentPanel
                                title="Critic"
                                subtitle="Quality review verdict"
                                accentColor={criticColor}
                                accentBg={criticIsApproved ? 'rgba(34,197,94,0.06)' : 'rgba(245,158,11,0.06)'}
                                accentBorder={criticIsApproved ? 'rgba(34,197,94,0.2)' : 'rgba(245,158,11,0.2)'}
                                statusBadge={criticIsApproved ? '✓ Approved' : '⚠ Revised'}
                                statusBadgeColor={criticColor}
                                content={reportResult.critic_verdict}
                            />
                        </ResultCard>
                    )}

                    {/* report error */}
                    {currentTab === 'report' && reportResult?.error && (
                        <p style={{ marginTop: 16, fontSize: '0.82rem', color: '#f87171', fontFamily: 'Inter, sans-serif' }}>⚠ {reportResult.error}</p>
                    )}
                </div>
            )}
        </div>
    )
}

/* ── Styles ──────────────────────────────────────────────────────────────── */
const styles = {
    inputWrap: {
        display: 'flex',
        alignItems: 'flex-start',
        gap: 10,
        background: 'var(--bg-input)',
        border: '1px solid var(--border)',
        borderRadius: 14,
        padding: '12px 16px',
        transition: 'border-color 0.2s ease',
    },
    inputDisabled: { opacity: 0.45 },
    searchIcon: { width: 15, height: 15, color: 'var(--text-dim)', flexShrink: 0, marginTop: 3 },
    textarea: {
        flex: 1,
        background: 'none',
        border: 'none',
        outline: 'none',
        color: 'var(--text)',
        fontSize: '0.9rem',
        fontFamily: 'Inter, sans-serif',
        resize: 'none',
        minHeight: 100,
        maxHeight: 260,
        lineHeight: 1.65,
        overflowY: 'auto',
    },
    btnRow: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 10,
        flexWrap: 'wrap',
        gap: 8,
    },
    btnGroup: {
        display: 'flex',
        gap: 8,
        flexWrap: 'wrap',
        marginLeft: 'auto',
    },
    warn: { fontSize: '0.75rem', color: 'var(--text-dim)', fontFamily: 'Inter, sans-serif', margin: 0 },
    gateHint: {
        position: 'absolute',
        top: 'calc(100% + 5px)',
        left: '50%',
        transform: 'translateX(-50%)',
        fontSize: '0.63rem',
        color: 'var(--text-dim)',
        whiteSpace: 'nowrap',
        fontFamily: 'Inter, sans-serif',
        pointerEvents: 'none',
    },
    tabPanel: {
        marginTop: 0,
        paddingTop: 18,
    },
}

export default Input
