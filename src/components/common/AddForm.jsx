import { useState, useEffect, useRef } from 'react';
import { PlusIcon } from './Icons';
import { f } from '../../utils/constants';

export default function AddForm({ onAdd, color }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [note, setNote] = useState('');
  const [link, setLink] = useState('');
  const ref = useRef();

  useEffect(() => { if (open && ref.current) ref.current.focus(); }, [open]);

  const submit = () => {
    if (!text.trim()) return;
    const item = { text: text.trim(), note: note.trim() };
    if (link.trim()) item.link = link.trim();
    onAdd(item);
    setText(''); setNote(''); setLink(''); setOpen(false);
  };

  if (!open) return (
    <button
      onClick={() => setOpen(true)}
      style={{
        display: 'flex', alignItems: 'center', gap: 7,
        padding: '9px 14px',
        background: 'transparent',
        border: `1px dashed ${color}44`,
        borderRadius: 10, color, cursor: 'pointer',
        fontSize: 12.5, fontFamily: f, width: '100%',
        transition: 'all .15s',
      }}
      onMouseEnter={e => e.currentTarget.style.borderColor = color}
      onMouseLeave={e => e.currentTarget.style.borderColor = `${color}44`}
    >
      <PlusIcon /> Add item
    </button>
  );

  const inputStyle = {
    padding: '7px 11px', borderRadius: 7,
    border: '1px solid var(--border)',
    background: 'var(--bg-input)',
    color: 'var(--text-primary)',
    fontSize: 13.5, fontFamily: f, outline: 'none', width: '100%',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 7, padding: 11, background: 'var(--bg-card)', borderRadius: 11, border: `1px solid ${color}33` }}>
      <input ref={ref} value={text} onChange={e => setText(e.target.value)} placeholder="What?" onKeyDown={e => e.key === 'Enter' && submit()} style={inputStyle} />
      <input value={note} onChange={e => setNote(e.target.value)} placeholder="Notes (optional)" onKeyDown={e => e.key === 'Enter' && submit()} style={{ ...inputStyle, fontSize: 12.5 }} />
      <input value={link} onChange={e => setLink(e.target.value)} placeholder="🔗 Reservation / info link (optional)" onKeyDown={e => e.key === 'Enter' && submit()} style={{ ...inputStyle, fontSize: 12.5 }} />
      <div style={{ display: 'flex', gap: 7, justifyContent: 'flex-end' }}>
        <button onClick={() => { setOpen(false); setText(''); setNote(''); setLink(''); }} style={{ padding: '5px 13px', borderRadius: 7, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', fontSize: 12.5, cursor: 'pointer', fontFamily: f }}>Cancel</button>
        <button onClick={submit} style={{ padding: '5px 13px', borderRadius: 7, border: 'none', background: color, color: '#fff', fontSize: 12.5, cursor: 'pointer', fontFamily: f, opacity: text.trim() ? 1 : 0.4 }}>Add</button>
      </div>
    </div>
  );
}
