// Time slot → { startHHMM, endHHMM }
const TIME_MAP = {
  MORNING:   ['0900', '1000'],
  BREAKFAST: ['0830', '0930'],
  AFTERNOON: ['1400', '1500'],
  EVENING:   ['1800', '1900'],
  SUNSET:    ['1830', '1930'],
  DINNER:    ['2000', '2100'],
  NIGHT:     ['2200', '2300'],
  LUNCH:     ['1230', '1330'],
};

function parseSlotTime(time) {
  if (!time) return ['0900', '1000'];
  const upper = time.toUpperCase().trim();
  if (TIME_MAP[upper]) return TIME_MAP[upper];

  // "10:30 AM" / "2:30 PM"
  const ampm = time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (ampm) {
    let h = parseInt(ampm[1]);
    const m = ampm[2];
    if (ampm[3].toUpperCase() === 'PM' && h < 12) h += 12;
    if (ampm[3].toUpperCase() === 'AM' && h === 12) h = 0;
    const hs = h.toString().padStart(2, '0');
    const he = ((h + 1) % 24).toString().padStart(2, '0');
    return [`${hs}${m}`, `${he}${m}`];
  }

  // "14:30" 24h
  const h24 = time.match(/^(\d{1,2}):(\d{2})$/);
  if (h24) {
    const h = parseInt(h24[1]);
    const hs = h.toString().padStart(2, '0');
    const he = ((h + 1) % 24).toString().padStart(2, '0');
    return [`${hs}${h24[2]}`, `${he}${h24[2]}`];
  }

  return ['0900', '1000'];
}

function icsEscape(str) {
  return (str || '').replace(/\\/g, '\\\\').replace(/,/g, '\\,').replace(/;/g, '\\;').replace(/\n/g, '\\n');
}

function mapsUrl(item, fallbackLat, fallbackLng) {
  if (item?.lat && item?.lng) return `https://maps.google.com/?q=${item.lat},${item.lng}`;
  if (item?.address) return `https://maps.google.com/?q=${encodeURIComponent(item.address)}`;
  if (fallbackLat && fallbackLng) return `https://maps.google.com/?q=${fallbackLat},${fallbackLng}`;
  return null;
}

export function generateICS(trip, cities) {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//TripTracker//EN',
    'CALSCALE:GREGORIAN',
    `X-WR-CALNAME:${icsEscape(trip.name)}`,
  ];

  for (const city of cities) {
    if (!city.schedule?.length) continue;

    for (const day of city.schedule) {
      for (const slot of day.slots) {
        const date = day.date || city.startDate;
        if (!date) continue;

        const datePart = date.replace(/-/g, '');
        const [startT, endT] = parseSlotTime(slot.time);
        const dtStart = `${datePart}T${startT}00`;
        const dtEnd   = `${datePart}T${endT}00`;

        // Find linked checklist item for location data
        let linkedItem = null;
        if (slot.ref && city.categories) {
          for (const cat of Object.values(city.categories)) {
            linkedItem = cat.items?.find(i => i.id === slot.ref) || null;
            if (linkedItem) break;
          }
        }

        const location = linkedItem?.address
          || (linkedItem?.lat && linkedItem?.lng ? `${linkedItem.lat},${linkedItem.lng}` : null)
          || `${city.name}${city.country ? ', ' + city.country : ''}`;

        const url = mapsUrl(linkedItem, city.lat, city.lng);
        const desc = `${city.name}${day.title ? ' — ' + day.title : ''}`;

        lines.push('BEGIN:VEVENT');
        lines.push(`DTSTART:${dtStart}`);
        lines.push(`DTEND:${dtEnd}`);
        lines.push(`SUMMARY:${icsEscape(slot.text)}`);
        lines.push(`LOCATION:${icsEscape(location)}`);
        if (url) lines.push(`URL:${url}`);
        lines.push(`DESCRIPTION:${icsEscape(desc)}`);
        lines.push(`UID:${slot.id || crypto.randomUUID()}@triptracker`);
        lines.push('END:VEVENT');
      }
    }
  }

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

export function downloadICS(trip, cities) {
  const content = generateICS(trip, cities);
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${trip.name.replace(/[^a-z0-9]/gi, '_')}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
