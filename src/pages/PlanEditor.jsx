import { useState, useEffect, useRef, useCallback, useId } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPlan, savePlan, deletePlan } from '../lib/api';
import DrawingCanvas from '../components/DrawingCanvas';
import CommandMenu from '../components/CommandMenu';
import { ChevLeft } from '../components/common/Icons';
import { f } from '../utils/constants';

// ─── helpers ──────────────────────────────────────────────────────────────────

function newBlock(type, content = '') {
  return { id: crypto.randomUUID(), type, content };
}

const EMOJIS = ['🗺️', '✈️', '🏖️', '🏔️', '🌍', '🌸', '🎒', '🏛️', '🚂', '🛳️', '🌴', '⛷️', '🎿', '🏄', '🌃'];

// ─── Block renderer ────────────────────────────────────────────────────────────

function Block({ block, index, focused, onChange, onDelete, onKeyDown, onFocus, onAddBelow, menuOpen, onMenuSelect, onMenuClose, menuPos }) {
  const inputRef = useRef(null);

  useEffect(() => {
    if (focused && inputRef.current) inputRef.current.focus();
  }, [focused]);

  const baseInputStyle = {
    width: '100%',
    background: 'none',
    border: 'none',
    outline: 'none',
    color: 'var(--text-primary)',
    fontFamily: f,
    resize: 'none',
    lineHeight: 1.7,
    padding: 0,
  };

  if (block.type === 'divider') {
    return (
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0', cursor: 'pointer' }} onClick={() => onFocus()}>
        <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        <button onClick={(e) => { e.stopPropagation(); onDelete(); }} style={{ opacity: 0, position: 'absolute', right: -24, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 14, padding: 2 }} className="block-delete">⌫</button>
      </div>
    );
  }

  if (block.type === 'drawing') {
    return (
      <div style={{ position: 'relative' }}>
        <DrawingCanvas
          initialData={block.content || null}
          onChange={(data) => onChange(data)}
          height={200}
        />
        <button
          onClick={onDelete}
          style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: 6, color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 12, padding: '3px 8px', fontFamily: f }}
        >
          Remove
        </button>
      </div>
    );
  }

  if (block.type === 'image') {
    if (block.content) {
      return (
        <div style={{ position: 'relative', borderRadius: 10, overflow: 'hidden' }}>
          <img src={block.content} alt="" style={{ width: '100%', maxHeight: 340, objectFit: 'cover', display: 'block', borderRadius: 10 }} onError={e => e.target.style.display = 'none'} />
          <button
            onClick={onDelete}
            style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: 6, color: '#fff', cursor: 'pointer', fontSize: 12, padding: '3px 8px', fontFamily: f }}
          >
            Remove
          </button>
        </div>
      );
    }
    return (
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <input
          ref={inputRef}
          value={block.content}
          onChange={e => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          onFocus={onFocus}
          placeholder="Paste an image URL…"
          style={{ ...baseInputStyle, fontSize: 14, flex: 1, padding: '8px 12px', background: 'var(--bg-input)', borderRadius: 8, border: '1px solid var(--border)' }}
        />
        <button onClick={onDelete} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 14, padding: 4, fontFamily: f }}>✕</button>
      </div>
    );
  }

  if (block.type === 'callout') {
    return (
      <div style={{ display: 'flex', gap: 10, background: 'var(--bg-input)', borderRadius: 10, padding: '10px 14px', border: '1px solid var(--border)', position: 'relative' }}>
        <span style={{ fontSize: 18, flexShrink: 0 }}>💡</span>
        <AutoTextarea
          ref={inputRef}
          value={block.content}
          onChange={e => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          onFocus={onFocus}
          placeholder="Add a tip or note…"
          style={{ ...baseInputStyle, fontSize: 13.5 }}
        />
        <button onClick={onDelete} className="block-delete" style={{ opacity: 0, position: 'absolute', right: 8, top: 10, background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 13, padding: 2, transition: 'opacity .15s' }}>✕</button>
      </div>
    );
  }

  const styleMap = {
    h1:       { fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em' },
    h2:       { fontSize: 20, fontWeight: 600, letterSpacing: '-0.01em' },
    text:     { fontSize: 14.5 },
    bullet:   { fontSize: 14.5 },
    numbered: { fontSize: 14.5 },
  };

  const placeholderMap = {
    h1:       'Heading 1',
    h2:       'Heading 2',
    text:     "Type '/' for commands…",
    bullet:   'List item',
    numbered: 'List item',
  };

  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, position: 'relative' }}>
      {block.type === 'bullet' && (
        <span style={{ color: 'var(--text-secondary)', marginTop: 5, flexShrink: 0, fontSize: 16, lineHeight: 1.7 }}>•</span>
      )}
      {block.type === 'numbered' && (
        <span style={{ color: 'var(--text-secondary)', marginTop: 3, flexShrink: 0, fontSize: 14, lineHeight: 1.7, minWidth: 20, textAlign: 'right' }}>{index + 1}.</span>
      )}
      <AutoTextarea
        ref={inputRef}
        value={block.content}
        onChange={e => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        onFocus={onFocus}
        placeholder={placeholderMap[block.type] || ''}
        style={{ ...baseInputStyle, flex: 1, ...styleMap[block.type] }}
      />
      <button onClick={onDelete} className="block-delete" style={{ opacity: 0, position: 'absolute', right: -28, top: 4, background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 14, padding: '2px 4px', transition: 'opacity .15s', flexShrink: 0 }}>⌫</button>
      {menuOpen && (
        <CommandMenu
          query={block.content.replace(/^\//, '')}
          onSelect={onMenuSelect}
          onClose={onMenuClose}
          position={menuPos}
        />
      )}
    </div>
  );
}

// Auto-growing textarea
const AutoTextarea = ({ value, onChange, onKeyDown, onFocus, placeholder, style, ...props }) => {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = el.scrollHeight + 'px';
  }, [value]);

  return (
    <textarea
      ref={ref}
      rows={1}
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      onFocus={onFocus}
      placeholder={placeholder}
      style={{ overflow: 'hidden', ...style }}
      {...props}
    />
  );
};

// ─── Main editor ───────────────────────────────────────────────────────────────

export default function PlanEditor() {
  const { id: planId } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState('Untitled Plan');
  const [emoji, setEmoji] = useState('🗺️');
  const [blocks, setBlocks] = useState([newBlock('text', '')]);
  const [focusedId, setFocusedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(true);
  const [menuState, setMenuState] = useState({ blockId: null, pos: null });
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const saveTimer = useRef(null);

  // Load plan
  useEffect(() => {
    getPlan(planId)
      .then(plan => {
        setTitle(plan.title);
        setEmoji(plan.emoji || '🗺️');
        setBlocks(plan.blocks?.length > 0 ? plan.blocks : [newBlock('text', '')]);
        setLoading(false);
      })
      .catch(e => {
        console.error(e);
        setLoading(false);
      });
  }, [planId]);

  // Auto-save
  const scheduleSave = useCallback((t, em, bl) => {
    setSaved(false);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      setSaving(true);
      try {
        await savePlan(planId, { title: t, emoji: em, blocks: bl });
        setSaved(true);
      } catch (e) { console.error(e); }
      setSaving(false);
    }, 1500);
  }, [planId]);

  const updateTitle = (t) => { setTitle(t); scheduleSave(t, emoji, blocks); };
  const updateEmoji = (e) => { setEmoji(e); setShowEmojiPicker(false); scheduleSave(title, e, blocks); };
  const updateBlocks = useCallback((bl) => { setBlocks(bl); scheduleSave(title, emoji, bl); }, [title, emoji, scheduleSave]);

  const updateBlock = useCallback((id, content) => {
    setBlocks(prev => {
      const next = prev.map(b => b.id === id ? { ...b, content } : b);
      scheduleSave(title, emoji, next);
      return next;
    });
  }, [title, emoji, scheduleSave]);

  const addBlockAfter = useCallback((id, type = 'text') => {
    setBlocks(prev => {
      const idx = prev.findIndex(b => b.id === id);
      const nb = newBlock(type);
      const next = [...prev.slice(0, idx + 1), nb, ...prev.slice(idx + 1)];
      scheduleSave(title, emoji, next);
      setFocusedId(nb.id);
      return next;
    });
  }, [title, emoji, scheduleSave]);

  const deleteBlock = useCallback((id) => {
    setBlocks(prev => {
      if (prev.length === 1) return [newBlock('text', '')];
      const idx = prev.findIndex(b => b.id === id);
      const next = prev.filter(b => b.id !== id);
      scheduleSave(title, emoji, next);
      // Focus previous block
      const focusIdx = Math.max(0, idx - 1);
      setFocusedId(next[focusIdx]?.id ?? null);
      return next;
    });
  }, [title, emoji, scheduleSave]);

  const handleKeyDown = useCallback((e, block) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      addBlockAfter(block.id);
    } else if (e.key === 'Backspace' && block.content === '') {
      e.preventDefault();
      deleteBlock(block.id);
    } else if (e.key === 'Escape') {
      setMenuState({ blockId: null, pos: null });
    }
  }, [addBlockAfter, deleteBlock]);

  const handleContentChange = useCallback((id, value) => {
    // Detect / at start to open command menu
    if (value === '/') {
      const el = document.activeElement;
      const rect = el?.getBoundingClientRect();
      setMenuState({ blockId: id, pos: { x: rect?.left ?? 100, y: (rect?.bottom ?? 100) + 6 } });
      updateBlock(id, value);
    } else if (value.startsWith('/') && menuState.blockId === id) {
      updateBlock(id, value);
    } else {
      if (menuState.blockId === id) setMenuState({ blockId: null, pos: null });
      updateBlock(id, value);
    }
  }, [menuState, updateBlock]);

  const handleMenuSelect = useCallback((type) => {
    const id = menuState.blockId;
    setMenuState({ blockId: null, pos: null });
    // Replace the current block's content with empty, change type
    setBlocks(prev => {
      const next = prev.map(b => b.id === id ? { ...b, type, content: '' } : b);
      scheduleSave(title, emoji, next);
      return next;
    });
    setFocusedId(id);
  }, [menuState, title, emoji, scheduleSave]);

  const handleDelete = async () => {
    if (!confirm('Delete this plan? This cannot be undone.')) return;
    await deletePlan(planId);
    navigate('/planning');
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <span style={{ color: 'var(--text-secondary)', fontFamily: f, fontSize: 13 }}>Loading…</span>
      </div>
    );
  }

  // Compute numbered list indices
  const numberedCount = {};
  blocks.forEach((b, i) => {
    if (b.type === 'numbered') {
      numberedCount[b.id] = Object.values(numberedCount).filter((_, idx) => {
        const prev = blocks.slice(0, i);
        return prev.slice(0, idx + 1).every(pb => pb.type === 'numbered');
      }).length;
    }
  });

  // Compute sequential numbered indices
  let numIdx = 0;
  const numberedIndex = {};
  blocks.forEach(b => {
    if (b.type === 'numbered') { numberedIndex[b.id] = ++numIdx; }
    else { numIdx = 0; }
  });

  return (
    <>
      {/* Header */}
      <div style={{ position: 'sticky', top: 0, zIndex: 100, background: 'var(--bg)', borderBottom: '1px solid var(--border)', backdropFilter: 'blur(20px)' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={() => navigate('/planning')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', padding: '3px 0', fontSize: 12.5, fontFamily: f, gap: 3 }}>
            <ChevLeft /> Plans
          </button>
          <div style={{ flex: 1 }} />
          <span style={{ fontSize: 11, color: saving ? '#f59e0b' : saved ? 'var(--text-secondary)' : 'var(--text-secondary)', fontFamily: f, opacity: 0.7 }}>
            {saving ? 'Saving…' : saved ? 'Saved' : ''}
          </span>
          <button
            onClick={handleDelete}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 12, fontFamily: f, padding: '3px 6px' }}
          >
            Delete
          </button>
        </div>
      </div>

      <style>{`
        .block-row:hover .block-delete { opacity: 1 !important; }
      `}</style>

      {/* Editor body */}
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 24px 120px' }}>

        {/* Emoji + Title */}
        <div style={{ marginBottom: 28, position: 'relative' }}>
          <button
            onClick={() => setShowEmojiPicker(v => !v)}
            style={{ fontSize: 52, background: 'none', border: 'none', cursor: 'pointer', lineHeight: 1, padding: 0, marginBottom: 12, display: 'block' }}
            title="Change emoji"
          >
            {emoji}
          </button>
          {showEmojiPicker && (
            <div style={{ position: 'absolute', top: 64, left: 0, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 12, display: 'flex', flexWrap: 'wrap', gap: 6, zIndex: 200, boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
              {EMOJIS.map(e => (
                <button key={e} onClick={() => updateEmoji(e)} style={{ fontSize: 22, background: 'none', border: 'none', cursor: 'pointer', borderRadius: 6, padding: '4px 6px', transition: 'background .1s' }} onMouseEnter={ev => ev.target.style.background = 'var(--bg-input)'} onMouseLeave={ev => ev.target.style.background = 'none'}>{e}</button>
              ))}
            </div>
          )}
          <input
            value={title}
            onChange={e => updateTitle(e.target.value)}
            placeholder="Untitled Plan"
            style={{
              width: '100%',
              background: 'none',
              border: 'none',
              outline: 'none',
              fontSize: 32,
              fontWeight: 700,
              color: 'var(--text-primary)',
              fontFamily: f,
              letterSpacing: '-0.02em',
              padding: 0,
            }}
          />
          <div style={{ height: 1, background: 'var(--border)', marginTop: 16 }} />
        </div>

        {/* Blocks */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {blocks.map((block, i) => (
            <div
              key={block.id}
              className="block-row"
              style={{ position: 'relative', padding: '3px 0' }}
            >
              <Block
                block={block}
                index={numberedIndex[block.id] ?? i}
                focused={focusedId === block.id}
                onChange={(v) => handleContentChange(block.id, v)}
                onDelete={() => deleteBlock(block.id)}
                onKeyDown={(e) => handleKeyDown(e, block)}
                onFocus={() => setFocusedId(block.id)}
                onAddBelow={(type) => addBlockAfter(block.id, type)}
                menuOpen={menuState.blockId === block.id}
                onMenuSelect={handleMenuSelect}
                onMenuClose={() => setMenuState({ blockId: null, pos: null })}
                menuPos={menuState.pos}
              />
            </div>
          ))}
        </div>

        {/* Add block button */}
        <button
          onClick={() => addBlockAfter(blocks[blocks.length - 1]?.id)}
          style={{ marginTop: 16, background: 'none', border: '1px dashed var(--border)', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 13, fontFamily: f, width: '100%', transition: 'all .15s' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--text-secondary)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
        >
          + Add block  &nbsp;<span style={{ opacity: 0.5 }}>or type '/' in any text block</span>
        </button>

        {/* AI teaser */}
        <div style={{ marginTop: 40, padding: '16px 20px', background: 'linear-gradient(135deg, #1e1b4b 0%, #1a1d23 100%)', borderRadius: 14, border: '1px solid #4338ca44', display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ fontSize: 28 }}>✨</span>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#a5b4fc', fontFamily: f }}>AI Trip Generator — Coming soon</div>
            <div style={{ fontSize: 12, color: '#6366f1aa', fontFamily: f, marginTop: 3 }}>Turn your notes into a full itinerary with one click.</div>
          </div>
          <div style={{ flex: 1 }} />
          <button disabled style={{ background: '#4338ca44', border: '1px solid #4338ca88', borderRadius: 8, padding: '7px 16px', cursor: 'not-allowed', color: '#6366f1', fontSize: 12.5, fontFamily: f, fontWeight: 600, opacity: 0.6 }}>
            Generate Trip →
          </button>
        </div>
      </div>
    </>
  );
}
