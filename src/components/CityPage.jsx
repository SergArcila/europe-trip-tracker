import { useState } from 'react';
import { CalIcon, ListIcon, MapIcon, NoteIcon, ChevDown, EditIcon } from './common/Icons';
import ChecklistTab from './ChecklistTab';
import ScheduleTab from './ScheduleTab';
import MapTab from './MapTab';
import { cityCounts, pct } from '../utils/tripHelpers';
import { f, pf } from '../utils/constants';

function ProgressBar({ d, t, color }) {
  const p = pct(d, t);
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: 11.5, fontFamily: f, color: 'var(--text-secondary)' }}>
        <span>{d} of {t}</span>
        <span style={{ fontWeight: 600, color }}>{p}%</span>
      </div>
      <div style={{ width: '100%', height: 5, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ width: `${p}%`, height: '100%', background: color, borderRadius: 3, transition: 'width .35s ease' }} />
      </div>
    </div>
  );
}

function CityNotes({ city, updateCity }) {
  const [showNotes, setShowNotes] = useState(false);
  const cityNotes = city.notes || '';
  const updateNotes = (val) => {
    updateCity(c => ({ ...c, notes: val }));
  };

  return (
    <div style={{ marginTop: 24 }}>
      <button onClick={() => setShowNotes(!showNotes)} style={{ display: 'flex', alignItems: 'center', gap: 7, width: '100%', padding: '10px 14px', background: 'var(--bg-card)', borderRadius: 11, border: '1px solid var(--border)', cursor: 'pointer', color: 'var(--text-primary)', fontFamily: f, fontSize: 13, fontWeight: 600, transition: 'all .15s' }}>
        <NoteIcon /> City Notes {cityNotes && <span style={{ fontSize: 10, color: 'var(--text-secondary)', fontWeight: 400 }}>({cityNotes.length} chars)</span>}
        <div style={{ flex: 1 }} /><ChevDown up={!showNotes} />
      </button>
      {showNotes && (
        <textarea value={cityNotes} onChange={e => updateNotes(e.target.value)} placeholder={`Notes, memories, recommendations for ${city.name}...`} style={{ width: '100%', minHeight: 120, padding: 12, marginTop: 6, borderRadius: 11, border: '1px solid var(--border)', background: 'var(--bg-input)', color: 'var(--text-primary)', fontSize: 13, fontFamily: f, outline: 'none', resize: 'vertical', lineHeight: 1.5, boxSizing: 'border-box' }} />
      )}
    </div>
  );
}

export default function CityPage({ city, updateCity }) {
  const [tab, setTab] = useState('checklist');
  const [editMode, setEditMode] = useState(false);
  const { t, d } = cityCounts(city);
  const hasSch = city.schedule?.length > 0;

  const tabs = [
    { key: 'checklist', icon: <ListIcon />, label: 'Checklist' },
    { key: 'schedule', icon: <CalIcon />, label: 'Schedule' },
    { key: 'map', icon: <MapIcon />, label: 'Map' },
  ];

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '0 16px 40px' }}>
      <div style={{ textAlign: 'center', padding: '22px 0 10px' }}>
        <div style={{ fontSize: 38, marginBottom: 3 }}>{city.flag}</div>
        <h1 style={{ fontSize: 26, fontWeight: 700, fontFamily: pf, color: 'var(--text-primary)', margin: '0 0 2px', letterSpacing: '-0.02em' }}>{city.name}</h1>
        <div style={{ fontSize: 12.5, color: city.color, fontFamily: f, fontWeight: 500 }}>{city.country}</div>
      </div>

      <div style={{ display: 'flex', gap: 3, marginBottom: 14, background: 'var(--bg-card)', borderRadius: 10, padding: 3, border: '1px solid var(--border)' }}>
        {tabs.map(tb => (
          <button key={tb.key} onClick={() => setTab(tb.key)} style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
            padding: '9px 0', borderRadius: 8, border: 'none', cursor: 'pointer',
            background: tab === tb.key ? city.color : 'transparent',
            color: tab === tb.key ? '#fff' : 'var(--text-secondary)',
            fontSize: 12.5, fontWeight: 600, fontFamily: f, transition: 'all .15s',
          }}>{tb.icon}{tb.label}</button>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <ProgressBar d={d} t={t} color={city.color} />
        {tab !== 'map' && (
          <button onClick={() => setEditMode(!editMode)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 8, border: editMode ? `1px solid ${city.color}` : '1px solid var(--border)', background: editMode ? `${city.color}14` : 'transparent', color: editMode ? city.color : 'var(--text-secondary)', fontSize: 12, fontWeight: 600, fontFamily: f, cursor: 'pointer', transition: 'all .15s', flexShrink: 0, marginBottom: 18, marginLeft: 12 }}>
            <EditIcon /> {editMode ? 'Done' : 'Edit'}
          </button>
        )}
      </div>

      {tab !== 'map' && hasSch && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '7px 11px', background: `${city.color}08`, borderRadius: 8, marginBottom: 16, border: `1px solid ${city.color}14` }}>
          <span style={{ fontSize: 12 }}>🔗</span>
          <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: f }}>Checklist ↔ Schedule stay synced</span>
        </div>
      )}

      {tab === 'checklist' && <ChecklistTab city={city} updateCity={updateCity} editMode={editMode} />}
      {tab === 'schedule' && <ScheduleTab city={city} updateCity={updateCity} editMode={editMode} />}
      {tab === 'map' && <MapTab city={city} />}

      {/* City Notes */}
      <CityNotes city={city} updateCity={updateCity} />
    </div>
  );
}
