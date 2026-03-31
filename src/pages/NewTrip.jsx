import { useNavigate } from 'react-router-dom';
import TripForm from '../components/TripForm';
import { ChevLeft } from '../components/common/Icons';
import { createTrip } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { f } from '../utils/constants';

export default function NewTrip() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { invalidateTripList } = useData();

  const handleSave = async (tripData) => {
    try {
      const tripId = await createTrip(user.id, tripData);
      // Force Dashboard to re-fetch the list so the new trip appears
      invalidateTripList();
      navigate(`/trips/${tripId}`);
    } catch (e) {
      console.error('Failed to create trip:', e);
    }
  };

  return (
    <>
      {/* Sticky header */}
      <div style={{ position: 'sticky', top: 0, zIndex: 100, background: 'var(--bg)', borderBottom: '1px solid var(--border)', backdropFilter: 'blur(20px)' }}>
        <div style={{ maxWidth: 600, margin: '0 auto', padding: '11px 16px', display: 'flex', alignItems: 'center', gap: 9 }}>
          <div style={{ fontSize: 14, fontWeight: 600, fontFamily: f, color: 'var(--text-secondary)' }}>
            New Trip
          </div>
        </div>
      </div>

      <TripForm
        onSave={handleSave}
        onCancel={() => navigate('/')}
      />
    </>
  );
}
