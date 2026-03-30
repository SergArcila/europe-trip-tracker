import { useState, useEffect, useRef } from 'react';
import { ChevDown, SearchIcon, PlusIcon } from './common/Icons';
import ItemRow from './common/ItemRow';
import AddForm from './common/AddForm';
import { findItem } from '../utils/tripHelpers';
import { f } from '../utils/constants';

const EMOJI_PRESETS = ['📌','🎭','🛍️','💊','📸','🎵','🏋️','🧳','🍷','🎯'];

function CatSection({ catKey, cat, color, allItems, filteredItems, onToggleItem, onEditItem, onDeleteItem, onAddItem, editMode }) {
  const [collapsed, setCollapsed] = useState(false);
  const displayItems = filteredItems || allItems;
  const done = allItems.filter(i => i.done).length;

  return (
    <div style={{ marginBottom: 18 }}>
      <button onClick={() => setCollapsed(!collapsed)} style={{ display: 'flex', alignItems: 'center', gap: 7, width: '100%', padding: '7px 0', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)' }}>
        <span style={{ fontSize: 17 }}>{cat.icon}</span>
        <span style={{ fontSize: 13.5, fontWeight: 600, fontFamily: f, flex: 1, textAlign: 'left' }}>{cat.label}</span>
        <span style={{ fontSize: 11.5, color, fontFamily: f, fontWeight: 600, background: `${color}14`, padding: '2px 7px', borderRadius: 16 }}>{done}/{allItems.length}</span>
        <ChevDown up={collapsed} />
      </button>
      {!collapsed && (
        <div style={{ paddingLeft: 3 }}>
          {displayItems.map(item => (
            <ItemRow
              key={item.id} item={item} color={color}
              onToggle={() => onToggleItem(item.id)}
              onEdit={editMode ? (fields) => onEditItem(item.id, fields) : null}
              onDelete={editMode ? () => onDeleteItem(item.id) : null}
            />
          ))}
          {!filteredItems && (
            <div style={{ marginTop: 7 }}>
              <AddForm onAdd={onAddItem} color={color} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function AddCategoryBtn({ color, onAdd }) {
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState('');
  const [icon, setIcon] = useState('📌');
  const ref = useRef();

  useEffect(() => { if (open && ref.current) ref.current.focus(); }, [open]);

  const submit = () => {
    if (!label.trim()) return;
    onAdd({ icon, label: label.trim() });
    setLabel(''); setIcon('📌'); setOpen(false);
  };

  if (!open) return (
    <button onClick={() => setOpen(true)}
      style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 14px', background: 'transparent', border: `1px dashed ${color}33`, borderRadius: 11, color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 12.5, fontFamily: f, width: '100%', transition: 'all .15s', marginTop: 4 }}
      onMouseEnter={e => e.currentTarget.style.borderColor = color}
      onMouseLeave={e => e.currentTarget.style.borderColor = `${color}33`}>
      <PlusIcon /> Add custom category
    </button>
  );

  return (
    <div style={{ padding: 12, background: 'var(--bg-card)', borderRadius: 11, border: `1px solid ${color}33`, marginTop: 4 }}>
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 8 }}>
        {EMOJI_PRESETS.map(e => (
          <button key={e} onClick={() => setIcon(e)} style={{ width: 30, height: 30, borderRadius: 7, border: icon === e ? `2px solid ${color}` : '1px solid var(--border)', background: icon === e ? `${color}14` : 'transparent', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{e}</button>
        ))}
      </div>
      <input ref={ref} value={label} onChange={e => setLabel(e.target.value)} placeholder="Category name" onKeyDown={e => e.key === 'Enter' && submit()} style={{ width: '100%', padding: '7px 11px', borderRadius: 7, border: '1px solid var(--border)', background: 'var(--bg-input)', color: 'var(--text-primary)', fontSize: 13, fontFamily: f, outline: 'none', marginBottom: 8, boxSizing: 'border-box' }} />
      <div style={{ display: 'flex', gap: 7, justifyContent: 'flex-end' }}>
        <button onClick={() => { setOpen(false); setLabel(''); }} style={{ padding: '5px 13px', borderRadius: 7, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', fontSize: 12.5, cursor: 'pointer', fontFamily: f }}>Cancel</button>
        <button onClick={submit} style={{ padding: '5px 13px', borderRadius: 7, border: 'none', background: color, color: '#fff', fontSize: 12.5, cursor: 'pointer', fontFamily: f, opacity: label.trim() ? 1 : 0.4 }}>Create</button>
      </div>
    </div>
  );
}

export default function ChecklistTab({ city, updateCity, editMode }) {
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('all');
  const [pendingOnly, setPendingOnly] = useState(false);

  const toggleItem = (itemId) => {
    updateCity(c => {
      const updated = JSON.parse(JSON.stringify(c));
      const item = findItem(updated, itemId);
      if (item) item.done = !item.done;
      return updated;
    });
  };

  const editItem = (itemId, fields) => {
    updateCity(c => {
      const updated = JSON.parse(JSON.stringify(c));
      const item = findItem(updated, itemId);
      if (item) Object.assign(item, fields);
      return updated;
    });
  };

  const deleteItem = (itemId) => {
    updateCity(c => {
      const updated = JSON.parse(JSON.stringify(c));
      for (const cat of Object.values(updated.categories)) {
        const idx = cat.items.findIndex(i => i.id === itemId);
        if (idx !== -1) { cat.items.splice(idx, 1); break; }
      }
      return updated;
    });
  };

  const addItem = (catKey, { text, note, link }) => {
    updateCity(c => {
      const updated = JSON.parse(JSON.stringify(c));
      const item = { id: `${c.id}-c-${Date.now()}`, text, note, done: false };
      if (link) item.link = link;
      updated.categories[catKey].items.push(item);
      return updated;
    });
  };

  const addCategory = ({ icon, label }) => {
    updateCity(c => {
      const updated = JSON.parse(JSON.stringify(c));
      const key = `custom-${Date.now()}`;
      updated.categories[key] = { icon, label, items: [] };
      return updated;
    });
  };

  const catEntries = Object.entries(city.categories);
  const hasFilters = search || filterCat !== 'all' || pendingOnly;

  const filteredCats = catEntries
    .filter(([k]) => filterCat === 'all' || k === filterCat)
    .map(([k, c]) => {
      let items = c.items;
      if (search.trim()) {
        const q = search.toLowerCase();
        items = items.filter(i => i.text.toLowerCase().includes(q) || i.note?.toLowerCase().includes(q));
      }
      if (pendingOnly) items = items.filter(i => !i.done);
      return [k, { ...c, items }];
    })
    .filter(([, c]) => c.items.length > 0 || (!search && !pendingOnly));

  return (
    <div>
      {/* Search & Filter */}
      <div style={{ marginBottom: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', gap: 7, alignItems: 'center' }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 7, padding: '7px 11px', borderRadius: 9, border: '1px solid var(--border)', background: 'var(--bg-input)' }}>
            <span style={{ color: 'var(--text-secondary)', flexShrink: 0 }}><SearchIcon /></span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search activities..." style={{ flex: 1, border: 'none', background: 'transparent', color: 'var(--text-primary)', fontSize: 12.5, fontFamily: f, outline: 'none' }} />
            {search && <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 14, lineHeight: 1, padding: 0 }}>×</button>}
          </div>
          <button onClick={() => setPendingOnly(!pendingOnly)} style={{ padding: '7px 11px', borderRadius: 9, border: pendingOnly ? `1px solid ${city.color}` : '1px solid var(--border)', background: pendingOnly ? `${city.color}18` : 'var(--bg-input)', color: pendingOnly ? city.color : 'var(--text-secondary)', fontSize: 11.5, fontWeight: 600, fontFamily: f, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all .15s' }}>
            {pendingOnly ? 'Pending' : 'All'}
          </button>
        </div>
        {catEntries.length > 1 && (
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            <button onClick={() => setFilterCat('all')} style={{ padding: '4px 10px', borderRadius: 16, border: filterCat === 'all' ? `1px solid ${city.color}` : '1px solid var(--border)', background: filterCat === 'all' ? `${city.color}18` : 'transparent', color: filterCat === 'all' ? city.color : 'var(--text-secondary)', fontSize: 11, fontWeight: 600, fontFamily: f, cursor: 'pointer', transition: 'all .15s' }}>All</button>
            {catEntries.map(([k, c]) => (
              <button key={k} onClick={() => setFilterCat(filterCat === k ? 'all' : k)} style={{ padding: '4px 10px', borderRadius: 16, border: filterCat === k ? `1px solid ${city.color}` : '1px solid var(--border)', background: filterCat === k ? `${city.color}18` : 'transparent', color: filterCat === k ? city.color : 'var(--text-secondary)', fontSize: 11, fontWeight: 600, fontFamily: f, cursor: 'pointer', transition: 'all .15s' }}>
                {c.icon} {c.label}
              </button>
            ))}
          </div>
        )}
        {hasFilters && filteredCats.length === 0 && (
          <div style={{ textAlign: 'center', padding: '16px 0', color: 'var(--text-secondary)', fontSize: 12.5, fontFamily: f }}>No matching items</div>
        )}
      </div>

      {/* Category sections */}
      {filteredCats.map(([k, filteredCat]) => {
        const originalCat = city.categories[k];
        return (
          <CatSection
            key={k}
            catKey={k}
            cat={filteredCat}
            allItems={originalCat.items}
            filteredItems={hasFilters ? filteredCat.items : null}
            color={city.color}
            onToggleItem={toggleItem}
            onEditItem={editItem}
            onDeleteItem={deleteItem}
            onAddItem={(item) => addItem(k, item)}
            editMode={editMode}
          />
        );
      })}

      {/* Add custom category */}
      {!hasFilters && <AddCategoryBtn color={city.color} onAdd={addCategory} />}
    </div>
  );
}
