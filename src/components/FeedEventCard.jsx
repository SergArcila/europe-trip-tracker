import { useNavigate } from 'react-router-dom';
import { f, pf } from '../utils/constants';
import { ALL_COUNTRIES } from '../utils/countries';

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en', { month: 'short', day: 'numeric' });
}

function Avatar({ url, name, size = 36 }) {
  if (url) return (
    <img src={url} alt={name} style={{ width: size, height: size, borderRadius: size / 2, objectFit: 'cover', border: '1.5px solid var(--border)', flexShrink: 0 }} />
  );
  return (
    <div style={{ width: size, height: size, borderRadius: size / 2, background: 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.38, flexShrink: 0 }}>👤</div>
  );
}

const EVENT_META = {
  trip_created:   { icon: '✈️', color: '#2e86de', verb: 'planned a trip' },
  trip_completed: { icon: '🎉', color: '#22c55e', verb: 'completed a trip' },
  country_added:  { icon: '🌍', color: '#f59e0b', verb: 'visited' },
};

export default function FeedEventCard({ event }) {
  const navigate = useNavigate();
  const { profiles: actor, event_type, payload, created_at } = event;
  const meta = EVENT_META[event_type] || { icon: '📍', color: 'var(--text-secondary)', verb: 'did something' };

  const displayName = actor?.name || actor?.username || 'Someone';
  const username = actor?.username;

  const countryFlag = payload?.country
    ? ALL_COUNTRIES.find(c => c.name === payload.country)?.flag || '🌍'
    : null;

  const description = (() => {
    if (event_type === 'trip_created' && payload?.tripName) {
      const cities = payload?.cities?.join(', ');
      return cities ? `${payload.tripName} — ${cities}` : payload.tripName;
    }
    if (event_type === 'trip_completed' && payload?.tripName) {
      return payload.tripName;
    }
    if (event_type === 'country_added' && payload?.country) {
      return `${countryFlag} ${payload.country}`;
    }
    return null;
  })();

  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 12,
      padding: '14px 16px',
      background: 'var(--bg-card)',
      borderRadius: 13,
      border: '1px solid var(--border)',
    }}>
      {/* Avatar — tappable to public profile */}
      <div
        onClick={() => username && navigate(`/u/${username}`)}
        style={{ cursor: username ? 'pointer' : 'default', flexShrink: 0 }}
      >
        <Avatar url={actor?.avatar_url} name={displayName} />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Name + verb */}
        <div style={{ fontSize: 13.5, fontFamily: f, lineHeight: 1.4, color: 'var(--text-primary)' }}>
          <span
            onClick={() => username && navigate(`/u/${username}`)}
            style={{ fontWeight: 700, cursor: username ? 'pointer' : 'default' }}
          >
            {displayName}
          </span>
          {' '}
          <span style={{ color: 'var(--text-secondary)' }}>{meta.verb}</span>
        </div>

        {/* Description pill */}
        {description && (
          <div style={{
            marginTop: 6,
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '4px 10px',
            background: meta.color + '18',
            border: `1px solid ${meta.color}30`,
            borderRadius: 20,
            fontSize: 12, fontFamily: f, color: meta.color, fontWeight: 600,
          }}>
            <span>{meta.icon}</span>
            <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{description}</span>
          </div>
        )}

        {/* Timestamp */}
        <div style={{ marginTop: 6, fontSize: 11, color: 'var(--text-secondary)', fontFamily: f }}>
          {timeAgo(created_at)}
        </div>
      </div>
    </div>
  );
}
