/* ── Instructions Modal Component ────────────────────────────────────────────
   Triggered by the "?" button in the Navbar. Explains the 4-agent pipeline
   and how to use the application effectively. Fully theme-aware via CSS vars.
 ────────────────────────────────────────────────────────────────────────────── */

const agents = [
    {
        step: '01',
        name: 'Research Scout',
        color: '#6366f1',
        colorBg: 'rgba(99,102,241,0.08)',
        colorBorder: 'rgba(99,102,241,0.2)',
        icon: 'M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z',
        role: 'Query Expander & Web Researcher',
        what: 'Rewrites your query into 3–5 sub-queries using Gemini, then fires all of them at the Tavily real-time search engine to gather raw, verified facts from the web.',
        trigger: '"Analyse Query" → "Start Search"',
    },
    {
        step: '02',
        name: 'Data Analyst',
        color: '#14b8a6',
        colorBg: 'rgba(20,184,166,0.06)',
        colorBorder: 'rgba(20,184,166,0.2)',
        icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
        role: 'Senior Market Analyst',
        what: 'Processes the raw search data and produces a structured SWOT analysis — identifying Strengths, Weaknesses, Opportunities, Threats, key trends, and competitor strategy shifts grounded in cited sources.',
        trigger: '"Analyze Report" (runs automatically)',
    },
    {
        step: '03',
        name: 'The Critic',
        color: '#f59e0b',
        colorBg: 'rgba(245,158,11,0.06)',
        colorBorder: 'rgba(245,158,11,0.2)',
        icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
        role: 'Ruthless Editor',
        what: "Reviews the Analyst's report for logical fallacies, vague claims, and missing citations. If the report is weak, it sends it back with specific feedback. The Analyst gets one revision attempt. This step exists to reduce hallucinations.",
        trigger: 'Runs automatically after the Analyst',
    },
    {
        step: '04',
        name: 'Strategy Director',
        color: '#a78bfa',
        colorBg: 'rgba(167,139,250,0.06)',
        colorBorder: 'rgba(167,139,250,0.2)',
        icon: 'M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 15V5.25m19.5 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 7.409A2.25 2.25 0 012.25 5.493V5.25',
        role: 'C-Suite Advisor',
        what: 'Turns the approved analysis into a crisp executive briefing: numbered strategic recommendations with urgency levels, a risk watch section, and a single bottom-line takeaway for leadership.',
        trigger: 'Runs automatically after the Critic',
    },
]

const tips = [
    { icon: '🎯', tip: 'Be specific — "Apple supply chain risks Q1 2025" beats "Apple"' },
    { icon: '🌐', tip: 'The Search step uses real-time web data, so recency matters' },
    { icon: '⚡', tip: 'Analyze Report can take 30–60s — all 3 agents run in sequence' },
    { icon: '🔁', tip: 'Change the query and start fresh — all cards reset automatically' },
    { icon: '🧠', tip: 'Try different Gemini models — larger models produce richer analyses' },
]

export default function Instructions({ isOpen, onClose }) {
    if (!isOpen) return null

    return (
        <div style={styles.overlay} onClick={onClose}>
            <div style={styles.modal} onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div style={styles.header}>
                    <div>
                        <h2 style={styles.title}>How Market Sentinel Works</h2>
                        <p style={styles.subtitle}>A 4-agent autonomous intelligence pipeline</p>
                    </div>
                    <button style={styles.closeBtn} onClick={onClose}>
                        <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>

                <div style={styles.body}>
                    {/* 3-Step UI flow */}
                    <div style={styles.flowSection}>
                        <p style={styles.sectionLabel}>THE 3-STEP UI FLOW</p>
                        <div style={styles.flowRow}>
                            {[
                                { n: '1', label: 'Analyse Query', color: '#6366f1' },
                                { n: '2', label: 'Start Search', color: '#14b8a6' },
                                { n: '3', label: 'Analyze Report', color: '#f59e0b' },
                            ].map((s, i, arr) => (
                                <div key={s.n} style={styles.flowItem}>
                                    <div style={{ ...styles.flowBadge, background: s.color }}>
                                        {s.n}
                                    </div>
                                    <span style={styles.flowLabel}>{s.label}</span>
                                    {i < arr.length - 1 && <span style={styles.flowArrow}>→</span>}
                                </div>
                            ))}
                        </div>
                        <p style={styles.flowNote}>
                            Each step is gated — you must complete the previous step before the next button activates.
                        </p>
                    </div>

                    {/* Agent cards */}
                    <p style={styles.sectionLabel}>THE AGENTS</p>
                    <div style={styles.agentGrid}>
                        {agents.map(a => (
                            <div key={a.step} style={{ ...styles.agentCard, background: a.colorBg, border: `1px solid ${a.colorBorder}` }}>
                                <div style={styles.agentHeader}>
                                    <div style={{ ...styles.agentBadge, color: a.color, border: `1px solid ${a.colorBorder}` }}>
                                        {a.step}
                                    </div>
                                    <div>
                                        <div style={{ ...styles.agentName, color: a.color }}>{a.name}</div>
                                        <div style={styles.agentRole}>{a.role}</div>
                                    </div>
                                </div>
                                <p style={styles.agentWhat}>{a.what}</p>
                                <div style={{ ...styles.agentTrigger, color: a.color, borderColor: a.colorBorder }}>
                                    Triggered by: {a.trigger}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Tips */}
                    <p style={styles.sectionLabel}>TIPS FOR BEST RESULTS</p>
                    <div style={styles.tipsList}>
                        {tips.map((t, i) => (
                            <div key={i} style={styles.tipRow}>
                                <span style={styles.tipIcon}>{t.icon}</span>
                                <span style={styles.tipText}>{t.tip}</span>
                            </div>
                        ))}
                    </div>
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
        background: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        animation: 'fadeIn 0.2s ease both',
    },
    modal: {
        width: '100%',
        maxWidth: 760,
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
        padding: '28px 32px 24px',
        borderBottom: '1px solid var(--border)',
        position: 'sticky',
        top: 0,
        background: 'var(--modal-header-bg)',
        backdropFilter: 'blur(20px)',
        zIndex: 10,
    },
    title: {
        margin: 0,
        fontSize: '1.2rem',
        fontWeight: 700,
        color: 'var(--text)',
        fontFamily: 'Inter, sans-serif',
    },
    subtitle: {
        margin: '4px 0 0',
        fontSize: '0.8rem',
        color: 'var(--text-dim)',
        fontFamily: 'Inter, sans-serif',
    },
    closeBtn: {
        background: 'var(--bg-input)',
        border: '1px solid var(--border)',
        borderRadius: 8,
        color: 'var(--text-muted)',
        cursor: 'pointer',
        padding: '7px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        transition: 'background 0.2s ease',
    },
    body: {
        padding: '28px 32px 32px',
        display: 'flex',
        flexDirection: 'column',
        gap: 28,
    },
    sectionLabel: {
        margin: '0 0 12px',
        fontSize: '0.68rem',
        fontWeight: 700,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        color: 'var(--text-dim)',
        fontFamily: 'Inter, sans-serif',
    },
    flowSection: { marginBottom: 4 },
    flowRow: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        flexWrap: 'wrap',
        marginBottom: 12,
    },
    flowItem: { display: 'flex', alignItems: 'center', gap: 8 },
    flowBadge: {
        width: 28,
        height: 28,
        borderRadius: 8,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '0.75rem',
        fontWeight: 700,
        color: '#fff',
        fontFamily: 'Inter, sans-serif',
        flexShrink: 0,
    },
    flowLabel: {
        fontSize: '0.85rem',
        fontWeight: 600,
        color: 'var(--text)',
        fontFamily: 'Inter, sans-serif',
    },
    flowArrow: { color: 'var(--text-dim)', fontSize: '1rem', marginLeft: 2 },
    flowNote: {
        fontSize: '0.78rem',
        color: 'var(--text-muted)',
        fontFamily: 'Inter, sans-serif',
        margin: 0,
    },
    agentGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: 12,
    },
    agentCard: {
        borderRadius: 14,
        padding: '16px 18px',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
    },
    agentHeader: { display: 'flex', alignItems: 'flex-start', gap: 12 },
    agentBadge: {
        fontSize: '0.7rem',
        fontWeight: 800,
        padding: '3px 9px',
        borderRadius: 99,
        fontFamily: 'Inter, sans-serif',
        letterSpacing: '0.05em',
        flexShrink: 0,
    },
    agentName: {
        fontSize: '0.88rem',
        fontWeight: 700,
        fontFamily: 'Inter, sans-serif',
    },
    agentRole: {
        fontSize: '0.72rem',
        color: 'var(--text-dim)',
        fontFamily: 'Inter, sans-serif',
        marginTop: 1,
    },
    agentWhat: {
        fontSize: '0.8rem',
        lineHeight: 1.65,
        color: 'var(--text-muted)',
        fontFamily: 'Inter, sans-serif',
        margin: 0,
    },
    agentTrigger: {
        fontSize: '0.72rem',
        fontWeight: 600,
        fontFamily: 'Inter, sans-serif',
        padding: '5px 10px',
        borderRadius: 8,
        border: '1px solid',
        background: 'var(--trigger-bg)',
        letterSpacing: '0.01em',
    },
    tipsList: { display: 'flex', flexDirection: 'column', gap: 8 },
    tipRow: { display: 'flex', alignItems: 'flex-start', gap: 10 },
    tipIcon: { fontSize: '1rem', flexShrink: 0, marginTop: 1 },
    tipText: {
        fontSize: '0.82rem',
        color: 'var(--text-muted)',
        fontFamily: 'Inter, sans-serif',
        lineHeight: 1.5,
    },
}
