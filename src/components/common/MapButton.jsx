import { PinIcon } from './Icons';

export default function MapButton({ lat, lng, color }) {
  return (
    <a
      href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`}
      target="_blank"
      rel="noopener noreferrer"
      title="Open in Maps"
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: 28, height: 28,
        borderRadius: 7,
        background: `${color}14`,
        color,
        textDecoration: 'none',
        flexShrink: 0,
        transition: 'background .15s',
      }}
      onMouseEnter={e => e.currentTarget.style.background = `${color}30`}
      onMouseLeave={e => e.currentTarget.style.background = `${color}14`}
    >
      <PinIcon />
    </a>
  );
}
