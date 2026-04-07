import { useEffect, useRef } from 'react';
import { f } from '../utils/constants';

const COMMANDS = [
  { type: 'h1',       icon: 'H1',  label: 'Heading 1',    desc: 'Large section heading' },
  { type: 'h2',       icon: 'H2',  label: 'Heading 2',    desc: 'Medium section heading' },
  { type: 'text',     icon: '¶',   label: 'Text',         desc: 'Plain paragraph' },
  { type: 'bullet',   icon: '•',   label: 'Bullet list',  desc: 'Unordered list item' },
  { type: 'numbered', icon: '1.',  label: 'Numbered list',desc: 'Ordered list item' },
  { type: 'callout',  icon: '💡',  label: 'Callout',      desc: 'Highlighted note or tip' },
  { type: 'divider',  icon: '—',   label: 'Divider',      desc: 'Horizontal separator' },
  { type: 'image',    icon: '🖼️',  label: 'Image',        desc: 'Upload or paste an image URL' },
  { type: 'drawing',  icon: '✏️',  label: 'Drawing',      desc: 'Freehand sketch canvas' },
];

export default function CommandMenu({ query = '', onSelect, onClose, position }) {
  const ref = useRef(null);
  const filtered = COMMANDS.filter(c =>
    !query || c.label.toLowerCase().includes(query.toLowerCase()) || c.type.includes(query.toLowerCase())
  );

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  // Keyboard: Escape to close
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  if (filtered.length === 0) return null;

  return (
    <div
      ref={ref}
      style={{
        position: 'fixed',
        top: position?.y ?? 100,
        left: position?.x ?? 100,
        zIndex: 9999,
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 12,
        boxShadow: '0 8px 32px rgba(0,0,0,0.45)',
        minWidth: 240,
        overflow: 'hidden',
        padding: '6px 0',
      }}
    >
      <div style={{ padding: '4px 12px 6px', fontSize: 11, color: 'var(--text-secondary)', fontFamily: f, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
        Blocks
      </div>
      {filtered.map((cmd, i) => (
        <button
          key={cmd.type}
          onClick={() => onSelect(cmd.type)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            width: '100%',
            padding: '8px 12px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            textAlign: 'left',
            transition: 'background .1s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-input)'}
          onMouseLeave={e => e.currentTarget.style.background = 'none'}
        >
          <span style={{ width: 28, height: 28, background: 'var(--bg-input)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', flexShrink: 0, fontFamily: f }}>
            {cmd.icon}
          </span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', fontFamily: f }}>{cmd.label}</div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: f, marginTop: 1 }}>{cmd.desc}</div>
          </div>
        </button>
      ))}
    </div>
  );
}
