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
    // WHAT THE FOLLOWING FUNCTION DOES IS THAT IT CHECKS IF THE CURRENT ELEMENT I.E. THE DROPDOWN EXISTS, IF YES THEN IT CHECKS THAT IF THE CLICK HAPPENED OUTSIDE THIS DROPDOWN, IF YES THEN IT SETS IT'S STATE TO CLOSED (setIsOpen(false)) SO THAT THE DROPDOWN CLOSES WHEN WE CLICK ANYWHERE OUTSIDE IT.
    // ALSO WE USED 'mousedown' INSTEAD OF 'click' BECAUSE IT FIRES UP A LITTLE EARLIER.
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
            const res = await fetch('http://localhost:5000/api/models');
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
                <span style={styles.triggerText}>{displayText}</span>
                <svg
                    style={{ ...styles.chevron, ...(isOpen ? styles.chevronOpen : {}) }}
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
                                        e.currentTarget.style.background = 'rgba(99,102,241,0.1)';
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

/* ── Styles ─────────────────────────────────────────────────────────────── */
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
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 10,
        color: '#94a3b8',
        fontSize: '0.85rem',
        fontWeight: 500,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        fontFamily: 'Inter, sans-serif',
        width: '100%',
        justifyContent: 'space-between',
    },
    triggerOpen: {
        borderColor: 'rgba(99,102,241,0.6)',
        background: 'rgba(99,102,241,0.08)',
    },
    triggerActive: {
        color: '#f1f5f9',
        borderColor: 'rgba(99,102,241,0.4)',
    },
    triggerText: {
        flex: 1,
        textAlign: 'left',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
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
        background: '#0f0f1e',
        border: '1px solid rgba(99,102,241,0.25)',
        borderRadius: 14,
        boxShadow: '0 16px 48px rgba(0,0,0,0.7)',
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
        borderBottom: '1px solid rgba(255,255,255,0.06)',
    },
    searchIcon: {
        width: 15,
        height: 15,
        color: '#475569',
        flexShrink: 0,
    },
    searchInput: {
        flex: 1,
        background: 'none',
        border: 'none',
        outline: 'none',
        color: '#f1f5f9',
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
        color: '#475569',
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
        color: '#cbd5e1',
        fontSize: '0.83rem',
        fontFamily: 'Inter, sans-serif',
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'background 0.15s ease',
    },
    itemActive: {
        background: 'rgba(99,102,241,0.18)',
        color: '#818cf8',
    },
    modelDot: {
        width: 6,
        height: 6,
        borderRadius: '50%',
        background: '#6366f1',
        flexShrink: 0,
    },
};

/* -- add slideDown keyframe via <style> tag once ─────────────────────────── */
if (!document.getElementById('ms-anim')) {
    const s = document.createElement('style');
    s.id = 'ms-anim';
    s.textContent = `@keyframes slideDown{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}`;
    document.head.appendChild(s);
}

export default ModelSelect;