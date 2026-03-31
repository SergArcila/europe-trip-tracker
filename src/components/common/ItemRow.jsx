import { useState, useRef } from 'react';
import Checkbox from './Checkbox';
import MapButton from './MapButton';
import { EditIcon, TrashIcon, LinkIcon } from './Icons';
import { f } from '../../utils/constants';

const SWIPE_THRESHOLD = 64;

function SwipeRow({ onToggle, children }) {
  const [offset, setOffset] = useState(0);
  const startX = useRef(null);
  const triggered = useRef(false);

  const onTouchStart = (e) => {
    startX.current = e.touches[0].clientX;
    triggered.current = false;
  };

  const onTouchMove = (e) => {
    if (startX.current === null) return;
    const dx = e.touches[0].clientX - startX.current;
    if (dx < 0) return; // right swipe only
    setOffset(Math.min(dx, SWIPE_THRESHOLD + 16));
  };

  const onTouchEnd = () => {
    if (offset >= SWIPE_THRESHOLD && !triggered.current) {
      triggered.current = true;
      onToggle?.();
    }
    setOffset(0);
    startX.current = null;
  };

  const pct = Math.min(offset / SWIPE_THRESHOLD, 1);

  return (
    <div style={{ position: 'relative', overflow: 'hidden' }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div style={{ position: 'absolute', inset: 0, background: `rgba(52,199,89,${pct * 0.9})`, display: 'flex', alignItems: 'center', paddingLeft: 18, pointerEvents: 'none', borderRadius: 'inherit' }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: pct }}>
          <path d="M20 6L9 17l-5-5"/>
        </svg>
      </div>
      <div style={{ transform: `translateX(${offset}px)`, transition: offset === 0 ? 'transform .25s ease' : 'none', background: 'var(--bg)', position: 'relative' }}>
        {children}
      </div>
    </div>
  );
}

function LinkButton({ href, color }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer"
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: 7, background: `${color}14`, color, textDecoration: 'none', flexShrink: 0, transition: 'background .15s' }}
      onMouseEnter={e => e.currentTarget.style.background = `${color}30`}
      onMouseLeave={e => e.currentTarget.style.background = `${color}14`}
      title="Open reservation/info link">
      <LinkIcon />
    </a>
  );
}

export default function ItemRow({ item, color, onToggle, onEdit, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(item.text);
  const [note, setNote] = useState(item.note || '');

  const save = () => {
    if (!text.trim()) return;
    onEdit?.({ text: text.trim(), note: note.trim() });
    setEditing(false);
  };

  const cancel = () => {
    setText(item.text);
    setNote(item.note || '');
    setEditing(false);
  };

  if (editing) {
    return (
      <div style={{ padding: '10px 0', borderBottom: '1px solid var(--border-light)' }}>
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') cancel(); }}
          autoFocus
          style={{ width: '100%', padding: '7px 10px', borderRadius: 7, border: `1px solid ${color}`, background: 'var(--bg-input)', color: 'var(--text-primary)', fontSize: 13, fontFamily: f, outline: 'none', marginBottom: 6, boxSizing: 'border-box' }}
        />
        <input
          value={note}
          onChange={e => setNote(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') cancel(); }}
          placeholder="Notes (optional)"
          style={{ width: '100%', padding: '7px 10px', borderRadius: 7, border: '1px solid var(--border)', background: 'var(--bg-input)', color: 'var(--text-primary)', fontSize: 12, fontFamily: f, outline: 'none', marginBottom: 8, boxSizing: 'border-box' }}
        />
        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
          <button onClick={cancel} style={{ padding: '5px 12px', borderRadius: 7, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', fontSize: 12, fontFamily: f, cursor: 'pointer' }}>Cancel</button>
          <button onClick={save} style={{ padding: '5px 12px', borderRadius: 7, border: 'none', background: color, color: '#fff', fontSize: 12, fontWeight: 600, fontFamily: f, cursor: 'pointer', opacity: text.trim() ? 1 : 0.4 }}>Save</button>
        </div>
      </div>
    );
  }

  return (
    <SwipeRow onToggle={onToggle}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 9, padding: '9px 0', borderBottom: '1px solid var(--border-light)', opacity: item.done ? 0.5 : 1, transition: 'opacity .25s' }}>
        <Checkbox on={item.done} color={color} onClick={onToggle} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--text-primary)', textDecoration: item.done ? 'line-through' : 'none', fontFamily: f }}>{item.text}</div>
          {item.note && <div style={{ fontSize: 11.5, color: 'var(--text-secondary)', marginTop: 1.5, fontFamily: f, lineHeight: 1.35 }}>{item.note}</div>}
        </div>
        {item.link && <LinkButton href={item.link} color={color} />}
        {item.lat && item.lng && <MapButton lat={item.lat} lng={item.lng} color={color} />}
        {(onEdit || onDelete) && (
          <div style={{ display: 'flex', gap: 2, flexShrink: 0, alignSelf: 'center' }}>
            {onEdit && (
              <button onClick={() => setEditing(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: 5, borderRadius: 6, display: 'flex', transition: 'all .15s' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--border)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-secondary)'; }}>
                <EditIcon />
              </button>
            )}
            {onDelete && (
              <button onClick={onDelete} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: 5, borderRadius: 6, display: 'flex', transition: 'all .15s' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#E6394618'; e.currentTarget.style.color = '#E63946'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-secondary)'; }}>
                <TrashIcon />
              </button>
            )}
          </div>
        )}
      </div>
    </SwipeRow>
  );
}
