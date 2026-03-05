import { useState, useEffect, useRef } from 'react';

function ModelSelect({ selectedModel, onModelChange }) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [models, setModels] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const dropRef = useRef(null);

    /* ── Fetch models on mount ── */
    useEffect(() => { fetchModels(); }, []);

    /* ── Close on outside click ── */
    useEffect(() => {
        const handler = (e) => {
            if (dropRef.current && !dropRef.current.contains(e.target)) setIsOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const fetchModels = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/models');
            const data = await res.json();
            if (res.ok) setModels(data.models);
            else setError(data.error || 'Failed to fetch models');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const filtered = models.filter(m =>
        m.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelect = (model) => {
        onModelChange(model);
        setIsOpen(false);
        setSearchTerm('');
    };

    const displayText = selectedModel
        ? selectedModel.split('/').pop()
        : loading ? 'Loading models…' : 'Select a model';

    return (
        <div ref={dropRef} style={styles.wrap}>
            {/* Trigger */}
            <button
                onClick={() => setIsOpen(o => !o)}
                style={{
                    ...styles.trigger,
                    ...(isOpen ? styles.triggerOpen : {}),
                    ...(selectedModel ? styles.triggerActive : {}),
                }}
            >
                <span style={{
                    ...styles.triggerText,
                    color: selectedModel ? 'var(--text)' : 'var(--text-dim)',
                }}>
                    {displayText}
                </span>
                <svg
                    style={{ ...styles.chevron, ...(isOpen ? styles.chevronOpen : {}), color: 'var(--text-dim)' }}
                    viewBox="0 0 20 20" fill="currentColor"
                >
                    <path fillRule="evenodd"
                        d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                        clipRule="evenodd" />
                </svg>
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div style={styles.dropdown} className="slide-down">
                    <div style={styles.searchWrap}>
                        <svg style={styles.searchIcon} viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd"
                                d="M9 3a6 6 0 100 12A6 6 0 009 3zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
                                clipRule="evenodd" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search models…"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            style={styles.searchInput}
                            autoFocus
                        />
                    </div>

                    <div style={styles.list}>
                        {loading && <p style={styles.hint}>Loading models…</p>}
                        {error && <p style={{ ...styles.hint, color: '#f87171' }}>⚠ {error}</p>}
                        {!loading && !error && filtered.length === 0 && (
                            <p style={styles.hint}>No models match</p>
                        )}
                        {!loading && !error && filtered.map(model => (
                            <button
                                key={model}
                                onClick={() => handleSelect(model)}
                                style={{
                                    ...styles.item,
                                    ...(model === selectedModel ? styles.itemActive : {}),
                                }}
                                onMouseEnter={e => {
                                    if (model !== selectedModel)
                                        e.currentTarget.style.background = 'var(--accent-glow)';
                                }}
                                onMouseLeave={e => {
                                    if (model !== selectedModel)
                                        e.currentTarget.style.background = 'transparent';
                                }}
                            >
                                <span style={styles.modelDot} />
                                {model.split('/').pop()}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

/* ── Styles — fully CSS-variable driven for light/dark theme support ── */
const styles = {
    wrap: {
        position: 'relative',
        minWidth: 220,
    },
    trigger: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '9px 14px',
        background: 'var(--bg-input)',
        border: '1px solid var(--border)',
        borderRadius: 10,
        fontSize: '0.85rem',
        fontWeight: 500,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        fontFamily: 'Inter, sans-serif',
        width: '100%',
        justifyContent: 'space-between',
    },
    triggerOpen: {
        borderColor: 'var(--border-hov)',
        background: 'var(--accent-glow)',
    },
    triggerActive: {
        borderColor: 'var(--border-hov)',
    },
    triggerText: {
        flex: 1,
        textAlign: 'left',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        fontFamily: 'Inter, sans-serif',
    },
    chevron: {
        width: 16,
        height: 16,
        flexShrink: 0,
        transition: 'transform 0.25s ease',
    },
    chevronOpen: {
        transform: 'rotate(180deg)',
    },
    dropdown: {
        position: 'absolute',
        top: 'calc(100% + 8px)',
        right: 0,
        zIndex: 200,
        minWidth: 280,
        background: 'var(--modal-bg)',
        border: '1px solid var(--border-hov)',
        borderRadius: 14,
        boxShadow: 'var(--shadow-lg)',
        overflow: 'hidden',
        animationName: 'slideDown',
        animationDuration: '0.2s',
        animationTimingFunction: 'ease',
    },
    searchWrap: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '10px 14px',
        borderBottom: '1px solid var(--border)',
    },
    searchIcon: {
        width: 15,
        height: 15,
        color: 'var(--text-dim)',
        flexShrink: 0,
    },
    searchInput: {
        flex: 1,
        background: 'none',
        border: 'none',
        outline: 'none',
        color: 'var(--text)',
        fontSize: '0.85rem',
        fontFamily: 'Inter, sans-serif',
    },
    list: {
        maxHeight: 260,
        overflowY: 'auto',
        padding: '6px',
    },
    hint: {
        padding: '10px 12px',
        fontSize: '0.8rem',
        color: 'var(--text-dim)',
        fontFamily: 'Inter, sans-serif',
    },
    item: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        width: '100%',
        padding: '9px 12px',
        background: 'transparent',
        border: 'none',
        borderRadius: 8,
        color: 'var(--text-muted)',
        fontSize: '0.83rem',
        fontFamily: 'Inter, sans-serif',
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'background 0.15s ease',
    },
    itemActive: {
        background: 'var(--accent-glow)',
        color: 'var(--accent-2)',
    },
    modelDot: {
        width: 6,
        height: 6,
        borderRadius: '50%',
        background: 'var(--accent)',
        flexShrink: 0,
    },
};

export default ModelSelect;