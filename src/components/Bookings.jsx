import { useState } from 'react';
import Checkbox from './common/Checkbox';
import AddForm from './common/AddForm';
import { EditIcon, TrashIcon, CheckIcon } from './common/Icons';
import { f } from '../utils/constants';

function EditableItem({ item, color, onToggle, onEdit, onDelete, urgent }) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(item.text);
  const [note, setNote] = useState(item.note || '');

  const save = () => {
    if (!text.trim()) return;
    onEdit({ text: text.trim(), note: note.trim() });
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
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 9, padding: '8px 0', borderBottom: '1px solid var(--border-light)', opacity: item.done ? 0.5 : 1, transition: 'opacity .25s' }}>
      <Checkbox on={item.done} color={color} sz={20} onClick={onToggle} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', fontFamily: f, textDecoration: item.done ? 'line-through' : 'none' }}>{item.text}</div>
        {item.note && <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: f, marginTop: 1 }}>{item.note}</div>}
      </div>
      {urgent && !item.done && (
        <span style={{ fontSize: 9, fontWeight: 700, color: '#E63946', background: '#E6394614', padding: '2px 6px', borderRadius: 8, fontFamily: f, whiteSpace: 'nowrap', alignSelf: 'center' }}>URGENT</span>
      )}
      <div style={{ display: 'flex', gap: 2, flexShrink: 0, alignSelf: 'center' }}>
        <button onClick={() => setEditing(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: 5, borderRadius: 6, display: 'flex', transition: 'all .15s' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--border)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-secondary)'; }}>
          <EditIcon />
        </button>
        <button onClick={onDelete} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: 5, borderRadius: 6, display: 'flex', transition: 'all .15s' }}
          onMouseEnter={e => { e.currentTarget.style.background = '#E6394618'; e.currentTarget.style.color = '#E63946'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-secondary)'; }}>
          <TrashIcon />
        </button>
      </div>
    </div>
  );
}

export default function Bookings({ trip, updateTrip }) {
  const { bookings = [], transport = [] } = trip;

  const toggleBooking = (id) => updateTrip(t => ({ ...t, bookings: t.bookings.map(b => b.id === id ? { ...b, done: !b.done } : b) }));
  const editBooking = (id, fields) => updateTrip(t => ({ ...t, bookings: t.bookings.map(b => b.id === id ? { ...b, ...fields } : b) }));
  const deleteBooking = (id) => updateTrip(t => ({ ...t, bookings: t.bookings.filter(b => b.id !== id) }));
  const addBooking = ({ text, note }) => updateTrip(t => ({ ...t, bookings: [...t.bookings, { id: `bk-${Date.now()}`, text, note, done: false }] }));

  const toggleTransport = (id) => updateTrip(t => ({ ...t, transport: t.transport.map(tr => tr.id === id ? { ...tr, done: !tr.done } : tr) }));
  const editTransport = (id, fields) => updateTrip(t => ({ ...t, transport: t.transport.map(tr => tr.id === id ? { ...tr, ...fields } : tr) }));
  const deleteTransport = (id) => updateTrip(t => ({ ...t, transport: t.transport.filter(tr => tr.id !== id) }));
  const addTransport = ({ text, note }) => updateTrip(t => ({ ...t, transport: [...t.transport, { id: `tr-${Date.now()}`, text, note, done: false }] }));

  return (
    <>
      <div style={{ background: 'var(--bg-card)', borderRadius: 13, padding: '14px 16px', marginTop: 20, border: '1px solid var(--border)' }}>
        <div style={{ fontSize: 14, fontWeight: 600, fontFamily: f, color: 'var(--text-primary)', marginBottom: 10 }}>🎟️ Bookings & Tickets</div>
        {bookings.map(b => (
          <EditableItem
            key={b.id} item={b} color="#E63946" urgent={b.urgent}
            onToggle={() => toggleBooking(b.id)}
            onEdit={(fields) => editBooking(b.id, fields)}
            onDelete={() => deleteBooking(b.id)}
          />
        ))}
        <div style={{ marginTop: 8 }}><AddForm onAdd={addBooking} color="#E63946" /></div>
      </div>

      <div style={{ background: 'var(--bg-card)', borderRadius: 13, padding: '14px 16px', marginTop: 10, border: '1px solid var(--border)' }}>
        <div style={{ fontSize: 14, fontWeight: 600, fontFamily: f, color: 'var(--text-primary)', marginBottom: 10 }}>🚄 Transport & Flights</div>
        {transport.map(tr => (
          <EditableItem
            key={tr.id} item={tr} color="#457B9D"
            onToggle={() => toggleTransport(tr.id)}
            onEdit={(fields) => editTransport(tr.id, fields)}
            onDelete={() => deleteTransport(tr.id)}
          />
        ))}
        <div style={{ marginTop: 8 }}><AddForm onAdd={addTransport} color="#457B9D" /></div>
      </div>
    </>
  );
}
