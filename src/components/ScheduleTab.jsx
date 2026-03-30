import { useState } from 'react';
import Checkbox from './common/Checkbox';
import MapButton from './common/MapButton';
import { EditIcon, TrashIcon, PlusIcon } from './common/Icons';
import { findItem, slotDone, slotCoords } from '../utils/tripHelpers';
import { f } from '../utils/constants';

function SlotRow({ slot, city, onToggle, onEdit, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [time, setTime] = useState(slot.time || '');
  const [text, setText] = useState(slot.text);

  const done = slotDone(city, slot);
  const co = slotCoords(city, slot);

  const save = () => {
    if (!text.trim()) return;
    onEdit({ time: time.trim(), text: text.trim() });
    setEditing(false);
  };

  const cancel = () => {
    setTime(slot.time || '');
    setText(slot.text);
    setEditing(false);
  };

  if (editing) {
    return (
      <div style={{ padding: '10px 0', borderBottom: '1px solid var(--border-light)' }}>
        <div style={{ display: 'flex', gap: 7, marginBottom: 6 }}>
          <input
            value={time}
            onChange={e => setTime(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') cancel(); }}
            placeholder="Time (e.g. 10:00)"
            style={{ width: 110, padding: '7px 10px', borderRadius: 7, border: `1px solid ${city.color}`, background: 'var(--bg-input)', color: 'var(--text-primary)', fontSize: 12, fontFamily: f, outline: 'none', boxSizing: 'border-box' }}
          />
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') cancel(); }}
            autoFocus
            placeholder="What?"
            style={{ flex: 1, padding: '7px 10px', borderRadius: 7, border: `1px solid ${city.color}`, background: 'var(--bg-input)', color: 'var(--text-primary)', fontSize: 13, fontFamily: f, outline: 'none', boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
          <button onClick={cancel} style={{ padding: '5px 12px', borderRadius: 7, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', fontSize: 12, fontFamily: f, cursor: 'pointer' }}>Cancel</button>
          <button onClick={save} style={{ padding: '5px 12px', borderRadius: 7, border: 'none', background: city.color, color: '#fff', fontSize: 12, fontWeight: 600, fontFamily: f, cursor: 'pointer', opacity: text.trim() ? 1 : 0.4 }}>Save</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 9, padding: '8px 0', borderBottom: '1px solid var(--border-light)', opacity: done ? 0.5 : 1, transition: 'opacity .25s' }}>
      <Checkbox on={done} color={city.color} sz={20} onClick={onToggle} />
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 7, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 10.5, fontWeight: 700, color: city.color, fontFamily: f, minWidth: 52, textTransform: 'uppercase', letterSpacing: '.04em' }}>{slot.time}</span>
          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', fontFamily: f, textDecoration: done ? 'line-through' : 'none' }}>{slot.text}</span>
        </div>
      </div>
      {co && <MapButton lat={co.lat} lng={co.lng} color={city.color} />}
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
  );
}

function AddSlotForm({ color, onAdd }) {
  const [open, setOpen] = useState(false);
  const [time, setTime] = useState('');
  const [text, setText] = useState('');

  const submit = () => {
    if (!text.trim()) return;
    onAdd({ time: time.trim(), text: text.trim(), done: false });
    setTime(''); setText(''); setOpen(false);
  };

  if (!open) return (
    <button onClick={() => setOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '7px 12px', background: 'transparent', border: `1px dashed ${color}44`, borderRadius: 9, color, cursor: 'pointer', fontSize: 12, fontFamily: f, width: '100%', marginTop: 6, transition: 'all .15s' }}
      onMouseEnter={e => e.currentTarget.style.borderColor = color}
      onMouseLeave={e => e.currentTarget.style.borderColor = `${color}44`}>
      <PlusIcon /> Add slot
    </button>
  );

  return (
    <div style={{ marginTop: 6, padding: 10, background: 'var(--bg-card)', borderRadius: 10, border: `1px solid ${color}33` }}>
      <div style={{ display: 'flex', gap: 7, marginBottom: 7 }}>
        <input value={time} onChange={e => setTime(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') submit(); if (e.key === 'Escape') { setOpen(false); setTime(''); setText(''); } }} placeholder="Time" style={{ width: 100, padding: '6px 9px', borderRadius: 7, border: `1px solid ${color}`, background: 'var(--bg-input)', color: 'var(--text-primary)', fontSize: 12, fontFamily: f, outline: 'none', boxSizing: 'border-box' }} />
        <input value={text} onChange={e => setText(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') submit(); if (e.key === 'Escape') { setOpen(false); setTime(''); setText(''); } }} autoFocus placeholder="What?" style={{ flex: 1, padding: '6px 9px', borderRadius: 7, border: `1px solid ${color}`, background: 'var(--bg-input)', color: 'var(--text-primary)', fontSize: 13, fontFamily: f, outline: 'none', boxSizing: 'border-box' }} />
      </div>
      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
        <button onClick={() => { setOpen(false); setTime(''); setText(''); }} style={{ padding: '4px 11px', borderRadius: 7, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', fontSize: 12, fontFamily: f, cursor: 'pointer' }}>Cancel</button>
        <button onClick={submit} style={{ padding: '4px 11px', borderRadius: 7, border: 'none', background: color, color: '#fff', fontSize: 12, fontWeight: 600, fontFamily: f, cursor: 'pointer', opacity: text.trim() ? 1 : 0.4 }}>Add</button>
      </div>
    </div>
  );
}

export default function ScheduleTab({ city, updateCity, editMode }) {
  const toggle = (dayIdx, slotIdx) => {
    updateCity(c => {
      const updated = JSON.parse(JSON.stringify(c));
      const s = updated.schedule[dayIdx].slots[slotIdx];
      if (s.ref) {
        const item = findItem(updated, s.ref);
        if (item) item.done = !item.done;
      } else {
        s.done = !s.done;
      }
      return updated;
    });
  };

  const editSlot = (dayIdx, slotIdx, fields) => {
    updateCity(c => {
      const updated = JSON.parse(JSON.stringify(c));
      Object.assign(updated.schedule[dayIdx].slots[slotIdx], fields);
      return updated;
    });
  };

  const deleteSlot = (dayIdx, slotIdx) => {
    updateCity(c => {
      const updated = JSON.parse(JSON.stringify(c));
      updated.schedule[dayIdx].slots.splice(slotIdx, 1);
      return updated;
    });
  };

  const addSlot = (dayIdx, slot) => {
    updateCity(c => {
      const updated = JSON.parse(JSON.stringify(c));
      updated.schedule[dayIdx].slots.push({ id: `slot-${Date.now()}`, ...slot });
      return updated;
    });
  };

  if (!city.schedule?.length) {
    return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)', fontSize: 13, fontFamily: f }}>No schedule yet</div>;
  }

  return (
    <div>
      {city.schedule.map((day, dI) => {
        const dc = day.slots.filter(s => slotDone(city, s)).length;
        const allDone = dc === day.slots.length && day.slots.length > 0;
        return (
          <div key={dI} style={{ marginBottom: 22 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 7, padding: '9px 13px', background: `${city.color}08`, borderRadius: 11, border: `1px solid ${city.color}18` }}>
              <div style={{ width: 36, height: 36, borderRadius: 9, background: allDone ? `${city.color}18` : 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${allDone ? city.color + '40' : 'var(--border)'}`, flexShrink: 0 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: allDone ? city.color : 'var(--text-secondary)', fontFamily: f }}>{dc}/{day.slots.length}</span>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--text-primary)', fontFamily: f }}>{day.day}</div>
                <div style={{ fontSize: 11.5, color: 'var(--text-secondary)', fontFamily: f }}>{day.title}</div>
              </div>
              {allDone && <span style={{ fontSize: 18 }}>✅</span>}
            </div>
            <div style={{ paddingLeft: 3 }}>
              {day.slots.map((s, sI) => (
                <SlotRow
                  key={s.id ?? sI}
                  slot={s}
                  city={city}
                  onToggle={() => toggle(dI, sI)}
                  onEdit={editMode ? (fields) => editSlot(dI, sI, fields) : null}
                  onDelete={editMode ? () => deleteSlot(dI, sI) : null}
                />
              ))}
              <AddSlotForm color={city.color} onAdd={(slot) => addSlot(dI, slot)} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
