import { useState } from 'react';
import { PlusIcon, ChevDown } from './common/Icons';
import TripCard from './TripCard';
import PassportView from './PassportView';
import { f, pf } from '../utils/constants';

export default function TripList({ trips, onSelectTrip, onCreateTrip, onArchiveTrip, onUnarchiveTrip, onDeleteTrip }) {
  const [archiveOpen, setArchiveOpen] = useState(false);
  const active = trips.filter(t => !t.archived);
  const archived = trips.filter(t => t.archived);

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '0 16px 60px' }}>
      {/* Header */}
      <div style={{ padding: '28px 0 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 700, fontFamily: pf, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>My Trips</h1>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontFamily: f, marginTop: 3 }}>
              {active.length} active{archived.length > 0 ? ` · ${archived.length} past` : ''}
            </div>
          </div>
          <button onClick={onCreateTrip} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '10px 16px',
            background: 'var(--text-primary)', color: 'var(--bg)',
            border: 'none', borderRadius: 10,
            fontSize: 13, fontWeight: 600, fontFamily: f,
            cursor: 'pointer', transition: 'opacity .15s', flexShrink: 0,
          }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            <PlusIcon /> New Trip
          </button>
        </div>
      </div>

      {/* Active trips */}
      {active.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {active.map(trip => (
            <TripCard
              key={trip.id} trip={trip}
              onClick={() => onSelectTrip(trip.id)}
              onArchive={() => onArchiveTrip(trip.id)}
              onDelete={() => onDeleteTrip(trip.id)}
            />
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>✈️</div>
          <div style={{ fontSize: 18, fontWeight: 600, fontFamily: pf, color: 'var(--text-primary)', marginBottom: 8 }}>No trips planned</div>
          <div style={{ fontSize: 13.5, color: 'var(--text-secondary)', fontFamily: f, marginBottom: 28, lineHeight: 1.5 }}>
            Plan your next adventure with a beautiful,<br />interactive itinerary.
          </div>
          <button onClick={onCreateTrip} style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '13px 24px',
            background: 'var(--text-primary)', color: 'var(--bg)',
            border: 'none', borderRadius: 12,
            fontSize: 14, fontWeight: 600, fontFamily: f, cursor: 'pointer',
          }}>
            <PlusIcon /> Create your first trip
          </button>
        </div>
      )}

      {/* Past Trips / Archive */}
      {archived.length > 0 && (
        <div style={{ marginTop: 32 }}>
          <button onClick={() => setArchiveOpen(o => !o)} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            width: '100%', padding: '8px 0',
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-secondary)', marginBottom: 12,
          }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            <span style={{ fontSize: 11.5, fontWeight: 600, fontFamily: f, letterSpacing: '.06em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
              Past Trips ({archived.length})
            </span>
            <ChevDown up={archiveOpen} />
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </button>

          {archiveOpen && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {archived.map(trip => (
                <TripCard
                  key={trip.id} trip={trip} archived
                  onClick={() => onSelectTrip(trip.id)}
                  onUnarchive={() => onUnarchiveTrip(trip.id)}
                  onDelete={() => onDeleteTrip(trip.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Passport */}
      <PassportView trips={trips} />
    </div>
  );
}
