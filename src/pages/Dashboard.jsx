import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import TripList from '../components/TripList';
import { useAuth } from '../context/AuthContext';
import { getTrips, deleteTrip, updateTripMeta } from '../lib/api';
import { f } from '../utils/constants';

function PersonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadTrips = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getTrips(user.id);
      setTrips(data);
    } catch (e) {
      setError('Failed to load trips. Check your connection.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  useEffect(() => { loadTrips(); }, [loadTrips]);

  const handleSelectTrip = (id) => navigate(`/trips/${id}`);

  const handleCreateTrip = () => navigate('/trips/new');

  const handleArchiveTrip = async (tripId) => {
    setTrips(prev => prev.map(t => t.id === tripId ? { ...t, archived: true } : t));
    try { await updateTripMeta(tripId, { archived: true }); } catch (e) { console.error(e); loadTrips(); }
  };

  const handleUnarchiveTrip = async (tripId) => {
    setTrips(prev => prev.map(t => t.id === tripId ? { ...t, archived: false } : t));
    try { await updateTripMeta(tripId, { archived: false }); } catch (e) { console.error(e); loadTrips(); }
  };

  const handleDeleteTrip = async (tripId) => {
    setTrips(prev => prev.filter(t => t.id !== tripId));
    try { await deleteTrip(tripId); } catch (e) { console.error(e); loadTrips(); }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontFamily: f }}>Loading trips…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '40px 16px', textAlign: 'center' }}>
        <div style={{ fontSize: 13, color: '#E63946', fontFamily: f, marginBottom: 16 }}>{error}</div>
        <button onClick={loadTrips} style={{ padding: '10px 20px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: 13, fontFamily: f, cursor: 'pointer' }}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Sticky header */}
      <div style={{ position: 'sticky', top: 0, zIndex: 100, background: 'var(--bg)', borderBottom: '1px solid var(--border)', backdropFilter: 'blur(20px)' }}>
        <div style={{ maxWidth: 600, margin: '0 auto', padding: '11px 16px', display: 'flex', alignItems: 'center' }}>
          <div style={{ fontSize: 14, fontWeight: 700, fontFamily: f, letterSpacing: '.05em', color: 'var(--text-secondary)', textTransform: 'uppercase', flex: 1 }}>Trips</div>
          <button
            onClick={() => navigate('/profile')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', padding: '4px', borderRadius: 7, transition: 'color .15s' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
            title="Profile"
          >
            <PersonIcon />
          </button>
        </div>
      </div>

      <TripList
        trips={trips}
        onSelectTrip={handleSelectTrip}
        onCreateTrip={handleCreateTrip}
        onArchiveTrip={handleArchiveTrip}
        onUnarchiveTrip={handleUnarchiveTrip}
        onDeleteTrip={handleDeleteTrip}
      />
    </>
  );
}
