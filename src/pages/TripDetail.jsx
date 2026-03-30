import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TripView from '../components/TripView';
import TripForm from '../components/TripForm';
import { ChevLeft, EditIcon } from '../components/common/Icons';
import { getTripById, saveTrip, deleteTrip, updateTripMeta, syncTripDiff } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { f } from '../utils/constants';

export default function TripDetail() {
  const { id: tripId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [view, setView] = useState('trip'); // 'trip' | 'edit'

  const tripRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getTripById(tripId)
      .then(data => {
        if (!cancelled) {
          setTrip(data);
          tripRef.current = data;
          setLoading(false);
        }
      })
      .catch(e => {
        if (!cancelled) {
          console.error(e);
          setError('Failed to load trip.');
          setLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, [tripId]);

  const updateTrip = useCallback((updaterFn) => {
    setTrip(prev => {
      const oldTrip = prev;
      const newTrip = updaterFn(prev);
      tripRef.current = newTrip;
      // Fire async sync
      syncTripDiff(oldTrip, newTrip).catch(console.error);
      return newTrip;
    });
  }, []);

  const handleSaveTrip = async (tripData) => {
    try {
      await saveTrip(tripId, user.id, tripData);
      const updated = await getTripById(tripId);
      setTrip(updated);
      tripRef.current = updated;
      setView('trip');
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteTrip = async () => {
    try {
      await deleteTrip(tripId);
      navigate('/');
    } catch (e) {
      console.error(e);
    }
  };

  const handleArchive = async () => {
    const archived = !trip.archived;
    setTrip(t => ({ ...t, archived }));
    try { await updateTripMeta(tripId, { archived }); } catch (e) { console.error(e); }
    if (archived) navigate('/');
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontFamily: f }}>Loading…</div>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '40px 16px', textAlign: 'center' }}>
        <div style={{ fontSize: 13, color: '#E63946', fontFamily: f }}>{error || 'Trip not found.'}</div>
      </div>
    );
  }

  return (
    <>
      {/* Sticky header */}
      <div style={{ position: 'sticky', top: 0, zIndex: 100, background: 'var(--bg)', borderBottom: '1px solid var(--border)', backdropFilter: 'blur(20px)' }}>
        <div style={{ maxWidth: 600, margin: '0 auto', padding: '11px 16px', display: 'flex', alignItems: 'center', gap: 9 }}>
          {view === 'trip' && (
            <>
              <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', padding: '3px 0', fontSize: 12.5, fontFamily: f, gap: 3 }}>
                <ChevLeft /> All Trips
              </button>
              <div style={{ flex: 1 }} />
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                {trip.archived ? (
                  <button onClick={handleArchive} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 7, padding: '4px 10px', cursor: 'pointer', fontSize: 11.5, color: 'var(--text-secondary)', fontFamily: f }}>
                    Restore
                  </button>
                ) : (
                  <button onClick={handleArchive} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 12, fontFamily: f, padding: '3px 4px' }}>
                    Archive
                  </button>
                )}
                <button onClick={() => setView('edit')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12.5, fontFamily: f }}>
                  <EditIcon /> Edit
                </button>
              </div>
            </>
          )}
          {view === 'edit' && (
            <div style={{ fontSize: 14, fontWeight: 600, fontFamily: f, color: 'var(--text-secondary)' }}>
              Edit Trip
            </div>
          )}
        </div>
      </div>

      {view === 'trip' && (
        <TripView
          trip={trip}
          updateTrip={updateTrip}
          onSelectCity={(cityId) => navigate(`/trips/${tripId}/cities/${cityId}`)}
        />
      )}

      {view === 'edit' && (
        <TripForm
          existingTrip={trip}
          onSave={handleSaveTrip}
          onCancel={() => setView('trip')}
          onDelete={handleDeleteTrip}
        />
      )}
    </>
  );
}
