import { supabase } from './supabase';

// ─────────────────────────────────────────────────────────────
// Data transformation helpers
// ─────────────────────────────────────────────────────────────

// Transform Supabase trip row → component trip format
function toTripFormat(row) {
  return {
    id: row.id,
    name: row.title,
    coverEmoji: row.emoji,
    startDate: row.start_date,
    endDate: row.end_date,
    archived: row.archived,
    tripNotes: row.trip_notes || '',
    crew: row.crew || [],
    cities: [],
    bookings: [],
    transport: [],
  };
}

// Transform array of Supabase city rows → component city format (light, for trip list)
function toCityLight(row) {
  return {
    id: row.id,
    name: row.name,
    country: row.country,
    flag: row.flag_emoji,
    startDate: row.start_date,
    endDate: row.end_date,
    color: row.color,
    lat: row.lat,
    lng: row.lng,
    sort_order: row.sort_order,
    // Minimal categories/schedule so tripProgress() works
    categories: {},
    schedule: [],
  };
}

// Transform full city with nested data
function toCityFull(cityRow, categories, items, scheduleDays, scheduleItems) {
  // Build category map: key → { icon, label, items[] }
  const catMap = {};
  const catIdToKey = {}; // uuid → category_key

  for (const cat of categories) {
    catMap[cat.category_key] = {
      _id: cat.id,
      icon: cat.emoji,
      label: cat.name,
      items: [],
    };
    catIdToKey[cat.id] = cat.category_key;
  }

  // Distribute items into categories
  for (const item of items) {
    const catKey = catIdToKey[item.category_id];
    if (catKey && catMap[catKey]) {
      catMap[catKey].items.push(toItemFormat(item));
    }
  }

  // Sort items by sort_order
  for (const cat of Object.values(catMap)) {
    cat.items.sort((a, b) => (a._sort_order || 0) - (b._sort_order || 0));
  }

  // Build item lookup: id → formatted item (for schedule refs)
  const itemById = {};
  for (const item of items) {
    itemById[item.id] = toItemFormat(item);
  }

  // Build schedule days
  const dayById = {};
  for (const day of scheduleDays) {
    dayById[day.id] = {
      _id: day.id,
      day: day.day_label,
      title: day.title,
      date: day.date,
      day_number: day.day_number,
      slots: [],
    };
  }

  // Distribute schedule items into days
  for (const slot of scheduleItems) {
    const day = dayById[slot.day_id];
    if (day) {
      day.slots.push(toSlotFormat(slot));
    }
  }

  // Sort days and slots by sort_order / day_number
  const schedule = Object.values(dayById)
    .sort((a, b) => (a.day_number || 0) - (b.day_number || 0))
    .map(d => ({
      ...d,
      slots: d.slots.sort((a, b) => (a._sort_order || 0) - (b._sort_order || 0)),
    }));

  return {
    id: cityRow.id,
    name: cityRow.name,
    country: cityRow.country,
    flag: cityRow.flag_emoji,
    startDate: cityRow.start_date,
    endDate: cityRow.end_date,
    color: cityRow.color,
    lat: cityRow.lat,
    lng: cityRow.lng,
    notes: cityRow.city_notes || '',
    categories: catMap,
    schedule,
    // Metadata for syncing back to Supabase
    _catIdToKey: catIdToKey,
    _catKeyToId: Object.fromEntries(Object.entries(catMap).map(([k, v]) => [k, v._id])),
  };
}

function toItemFormat(row) {
  return {
    id: row.id,
    text: row.name,
    note: row.notes || '',
    done: row.completed,
    lat: row.lat,
    lng: row.lng,
    address: row.address,
    _sort_order: row.sort_order,
  };
}

function toSlotFormat(row) {
  return {
    id: row.id,
    time: row.time,
    text: row.name,
    notes: row.notes,
    ref: row.checklist_item_id || null,
    done: row.done || false,
    _sort_order: row.sort_order,
  };
}

function toBookingFormat(row) {
  return {
    id: row.id,
    text: row.name,
    note: row.notes || '',
    done: row.completed,
    urgent: row.is_urgent,
    _sort_order: row.sort_order,
  };
}

function toTransportFormat(row) {
  return {
    id: row.id,
    text: row.name,
    note: row.notes || '',
    done: row.completed,
    _sort_order: row.sort_order,
  };
}

// ─────────────────────────────────────────────────────────────
// Trips
// ─────────────────────────────────────────────────────────────

export async function getTrips(userId) {
  const { data: trips, error: tErr } = await supabase
    .from('trips')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (tErr) throw tErr;

  // Load cities for all trips (for flags + progress)
  const tripIds = trips.map(t => t.id);
  if (tripIds.length === 0) return [];

  const { data: allCities, error: cErr } = await supabase
    .from('cities')
    .select('*')
    .in('trip_id', tripIds)
    .order('sort_order', { ascending: true });

  if (cErr) throw cErr;

  // Load checklist items for progress calculation
  const { data: allItems, error: iErr } = await supabase
    .from('checklist_items')
    .select('id, trip_id, city_id, completed')
    .in('trip_id', tripIds);

  if (iErr) throw iErr;

  // Load schedule standalone items for progress
  const { data: allDays, error: dErr } = await supabase
    .from('schedule_days')
    .select('id, trip_id')
    .in('trip_id', tripIds);

  if (dErr) throw dErr;

  const dayIds = allDays.map(d => d.id);
  let allSlots = [];
  if (dayIds.length > 0) {
    const { data: sData, error: sErr } = await supabase
      .from('schedule_day_items')
      .select('id, day_id, done, checklist_item_id')
      .in('day_id', dayIds);
    if (sErr) throw sErr;
    allSlots = sData || [];
  }

  // Build trip lookup
  const cityByTrip = {};
  for (const city of allCities) {
    if (!cityByTrip[city.trip_id]) cityByTrip[city.trip_id] = [];
    cityByTrip[city.trip_id].push(city);
  }

  const itemByCity = {};
  for (const item of allItems) {
    if (!itemByCity[item.city_id]) itemByCity[item.city_id] = [];
    itemByCity[item.city_id].push({ done: item.completed });
  }

  const dayByTrip = {};
  for (const day of allDays) {
    if (!dayByTrip[day.trip_id]) dayByTrip[day.trip_id] = [];
    dayByTrip[day.trip_id].push(day.id);
  }

  // For standalone schedule slots, map by day
  const slotsByDay = {};
  for (const slot of allSlots) {
    if (!slotsByDay[slot.day_id]) slotsByDay[slot.day_id] = [];
    slotsByDay[slot.day_id].push(slot);
  }

  return trips.map(trip => {
    const cities = (cityByTrip[trip.id] || []).map(c => {
      const items = (itemByCity[c.id] || []).map(i => ({ done: i.done }));

      // Add standalone schedule slots to items for progress
      const dayIds = (dayByTrip[trip.id] || []);
      const standaloneSlots = dayIds
        .flatMap(dayId => slotsByDay[dayId] || [])
        .filter(s => !s.checklist_item_id)
        .map(s => ({ done: s.done }));

      const allCityItems = [...items, ...standaloneSlots];
      return {
        ...toCityLight(c),
        categories: buildMinimalCategories(allCityItems),
      };
    });

    const bookings = [];
    const transport = [];

    const result = toTripFormat(trip);
    result.cities = cities;
    result.bookings = bookings;
    result.transport = transport;
    return result;
  });
}

// Build minimal category structure just for progress calculation
function buildMinimalCategories(items) {
  return {
    _all: {
      icon: '',
      label: '',
      items: items.map((i, idx) => ({ id: String(idx), done: i.done })),
    },
  };
}

export async function getTripById(tripId) {
  const { data: trip, error: tErr } = await supabase
    .from('trips')
    .select('*')
    .eq('id', tripId)
    .single();

  if (tErr) throw tErr;

  const { data: cities, error: cErr } = await supabase
    .from('cities')
    .select('*')
    .eq('trip_id', tripId)
    .order('sort_order', { ascending: true });

  if (cErr) throw cErr;

  // Load checklist items for progress
  const { data: allItems } = await supabase
    .from('checklist_items')
    .select('id, city_id, completed')
    .eq('trip_id', tripId);

  const { data: bookingRows, error: bErr } = await supabase
    .from('bookings')
    .select('*')
    .eq('trip_id', tripId)
    .eq('is_transport', false)
    .order('sort_order', { ascending: true });

  if (bErr) throw bErr;

  const { data: transportRows, error: trErr } = await supabase
    .from('bookings')
    .select('*')
    .eq('trip_id', tripId)
    .eq('is_transport', true)
    .order('sort_order', { ascending: true });

  if (trErr) throw trErr;

  const itemByCity = {};
  for (const item of (allItems || [])) {
    if (!itemByCity[item.city_id]) itemByCity[item.city_id] = [];
    itemByCity[item.city_id].push({ done: item.completed });
  }

  const result = toTripFormat(trip);
  result.cities = cities.map(c => ({
    ...toCityLight(c),
    categories: buildMinimalCategories(itemByCity[c.id] || []),
  }));
  result.bookings = (bookingRows || []).map(toBookingFormat);
  result.transport = (transportRows || []).map(toTransportFormat);

  return result;
}

export async function createTrip(userId, tripData) {
  const { data: trip, error: tErr } = await supabase
    .from('trips')
    .insert({
      user_id: userId,
      title: tripData.name,
      emoji: tripData.coverEmoji || '✈️',
      start_date: tripData.startDate || null,
      end_date: tripData.endDate || null,
      archived: tripData.archived || false,
      trip_notes: tripData.tripNotes || '',
      crew: tripData.crew || [],
    })
    .select()
    .single();

  if (tErr) throw tErr;

  // Insert cities
  if (tripData.cities && tripData.cities.length > 0) {
    await insertCitiesForTrip(trip.id, tripData.cities);
  }

  return trip.id;
}

export async function updateTripMeta(tripId, updates) {
  const row = {};
  if ('name' in updates)       row.title      = updates.name;
  if ('coverEmoji' in updates) row.emoji      = updates.coverEmoji;
  if ('startDate' in updates)  row.start_date = updates.startDate;
  if ('endDate' in updates)    row.end_date   = updates.endDate;
  if ('archived' in updates)   row.archived   = updates.archived;
  if ('tripNotes' in updates)  row.trip_notes = updates.tripNotes;
  if ('crew' in updates)       row.crew       = updates.crew;

  const { error } = await supabase
    .from('trips')
    .update(row)
    .eq('id', tripId);

  if (error) throw error;
}

export async function deleteTrip(tripId) {
  const { error } = await supabase.from('trips').delete().eq('id', tripId);
  if (error) throw error;
}

// Full trip edit (replaces cities)
export async function saveTrip(tripId, userId, tripData) {
  // Update trip metadata
  await updateTripMeta(tripId, tripData);

  // Delete existing cities and re-insert (simplest approach for edit)
  // Due to ON DELETE CASCADE, this removes categories/items/schedule too
  const { error: dErr } = await supabase
    .from('cities')
    .delete()
    .eq('trip_id', tripId);

  if (dErr) throw dErr;

  if (tripData.cities && tripData.cities.length > 0) {
    await insertCitiesForTrip(tripId, tripData.cities);
  }
}

async function insertCitiesForTrip(tripId, cities) {
  for (let i = 0; i < cities.length; i++) {
    const city = cities[i];
    const { data: cityRow, error: cErr } = await supabase
      .from('cities')
      .insert({
        id: city.id || undefined,
        trip_id: tripId,
        name: city.name,
        country: city.country || '',
        flag_emoji: city.flag || '📍',
        start_date: city.startDate || null,
        end_date: city.endDate || null,
        color: city.color || '#457B9D',
        lat: city.lat || null,
        lng: city.lng || null,
        city_notes: city.notes || '',
        sort_order: i,
      })
      .select()
      .single();

    if (cErr) throw cErr;

    // Insert categories and items for pre-populated cities
    if (city.categories) {
      await insertCategoryData(cityRow.id, tripId, city.categories);
    }

    // Insert schedule
    if (city.schedule && city.schedule.length > 0) {
      await insertScheduleData(cityRow.id, tripId, city.schedule);
    }
  }
}

async function insertCategoryData(cityId, tripId, categories) {
  let catOrder = 0;
  for (const [key, cat] of Object.entries(categories)) {
    const { data: catRow, error: catErr } = await supabase
      .from('checklist_categories')
      .insert({
        city_id: cityId,
        name: cat.label,
        emoji: cat.icon,
        category_key: key,
        sort_order: catOrder++,
      })
      .select()
      .single();

    if (catErr) throw catErr;

    if (cat.items && cat.items.length > 0) {
      const itemRows = cat.items.map((item, idx) => ({
        id: item.id,
        category_id: catRow.id,
        city_id: cityId,
        trip_id: tripId,
        name: item.text,
        notes: item.note || '',
        completed: item.done || false,
        lat: item.lat || null,
        lng: item.lng || null,
        sort_order: idx,
      }));

      const { error: itemErr } = await supabase
        .from('checklist_items')
        .insert(itemRows);

      if (itemErr) throw itemErr;
    }
  }
}

async function insertScheduleData(cityId, tripId, schedule) {
  for (let dayIdx = 0; dayIdx < schedule.length; dayIdx++) {
    const day = schedule[dayIdx];
    const { data: dayRow, error: dayErr } = await supabase
      .from('schedule_days')
      .insert({
        city_id: cityId,
        trip_id: tripId,
        day_label: day.day,
        title: day.title,
        day_number: dayIdx + 1,
      })
      .select()
      .single();

    if (dayErr) throw dayErr;

    if (day.slots && day.slots.length > 0) {
      const slotRows = day.slots.map((slot, idx) => ({
        day_id: dayRow.id,
        checklist_item_id: slot.ref || null,
        name: slot.text,
        time: slot.time || '',
        notes: slot.notes || '',
        done: slot.done || false,
        sort_order: idx,
      }));

      const { error: slotErr } = await supabase
        .from('schedule_day_items')
        .insert(slotRows);

      if (slotErr) throw slotErr;
    }
  }
}

// ─────────────────────────────────────────────────────────────
// City Detail
// ─────────────────────────────────────────────────────────────

export async function getCityDetail(cityId) {
  const { data: city, error: cErr } = await supabase
    .from('cities')
    .select('*')
    .eq('id', cityId)
    .single();

  if (cErr) throw cErr;

  const { data: categories, error: catErr } = await supabase
    .from('checklist_categories')
    .select('*')
    .eq('city_id', cityId)
    .order('sort_order', { ascending: true });

  if (catErr) throw catErr;

  const { data: items, error: iErr } = await supabase
    .from('checklist_items')
    .select('*')
    .eq('city_id', cityId)
    .order('sort_order', { ascending: true });

  if (iErr) throw iErr;

  const { data: scheduleDays, error: dErr } = await supabase
    .from('schedule_days')
    .select('*')
    .eq('city_id', cityId)
    .order('day_number', { ascending: true });

  if (dErr) throw dErr;

  let scheduleItems = [];
  if (scheduleDays && scheduleDays.length > 0) {
    const dayIds = scheduleDays.map(d => d.id);
    const { data: sData, error: sErr } = await supabase
      .from('schedule_day_items')
      .select('*')
      .in('day_id', dayIds)
      .order('sort_order', { ascending: true });

    if (sErr) throw sErr;
    scheduleItems = sData || [];
  }

  return toCityFull(city, categories || [], items || [], scheduleDays || [], scheduleItems);
}

// ─────────────────────────────────────────────────────────────
// City update sync
// ─────────────────────────────────────────────────────────────

export async function updateCityNotes(cityId, notes) {
  const { error } = await supabase
    .from('cities')
    .update({ city_notes: notes })
    .eq('id', cityId);
  if (error) throw error;
}

// Sync checklist item toggle/edit to Supabase
export async function syncItemUpdate(itemId, updates) {
  const row = {};
  if ('done' in updates)    row.completed = updates.done;
  if ('text' in updates)    row.name      = updates.text;
  if ('note' in updates)    row.notes     = updates.note;
  if ('lat' in updates)     row.lat       = updates.lat;
  if ('lng' in updates)     row.lng       = updates.lng;

  const { error } = await supabase
    .from('checklist_items')
    .update(row)
    .eq('id', itemId);
  if (error) throw error;
}

export async function syncItemInsert(item, categoryId, cityId, tripId, sortOrder) {
  const { error } = await supabase
    .from('checklist_items')
    .insert({
      id: item.id,
      category_id: categoryId,
      city_id: cityId,
      trip_id: tripId,
      name: item.text,
      notes: item.note || '',
      completed: item.done || false,
      lat: item.lat || null,
      lng: item.lng || null,
      sort_order: sortOrder,
    });
  if (error) throw error;
}

export async function syncItemDelete(itemId) {
  const { error } = await supabase
    .from('checklist_items')
    .delete()
    .eq('id', itemId);
  if (error) throw error;
}

// Insert new checklist category + items
export async function syncCategoryInsert(cityId, tripId, catKey, cat, sortOrder) {
  const { data: catRow, error: cErr } = await supabase
    .from('checklist_categories')
    .insert({
      city_id: cityId,
      name: cat.label,
      emoji: cat.icon,
      category_key: catKey,
      sort_order: sortOrder,
    })
    .select()
    .single();

  if (cErr) throw cErr;
  return catRow.id;
}

export async function syncCategoryDelete(cityId, catKey) {
  const { error } = await supabase
    .from('checklist_categories')
    .delete()
    .eq('city_id', cityId)
    .eq('category_key', catKey);
  if (error) throw error;
}

// Sync schedule slot insert / update / delete
export async function syncSlotInsert(slot, dayId, sortOrder) {
  const { error } = await supabase
    .from('schedule_day_items')
    .insert({
      id: slot.id,
      day_id: dayId,
      checklist_item_id: slot.ref || null,
      name: slot.text,
      time: slot.time || '',
      notes: slot.notes || '',
      done: slot.done || false,
      sort_order: sortOrder,
    });
  if (error) throw error;
}

export async function syncSlotUpdate(slotId, updates) {
  const row = {};
  if ('time' in updates)  row.time = updates.time;
  if ('text' in updates)  row.name = updates.text;
  if ('done' in updates)  row.done = updates.done;
  if ('notes' in updates) row.notes = updates.notes;

  const { error } = await supabase
    .from('schedule_day_items')
    .update(row)
    .eq('id', slotId);
  if (error) throw error;
}

export async function syncSlotDelete(slotId) {
  const { error } = await supabase
    .from('schedule_day_items')
    .delete()
    .eq('id', slotId);
  if (error) throw error;
}

// ─────────────────────────────────────────────────────────────
// City diff sync (called when updateCity() fires)
// Compares old vs new city state and fires targeted Supabase ops
// ─────────────────────────────────────────────────────────────

export async function syncCityDiff(oldCity, newCity, tripId) {
  const errors = [];

  // ── notes ────────────────────────────────────────────────
  if (oldCity.notes !== newCity.notes) {
    try { await updateCityNotes(newCity.id, newCity.notes); } catch (e) { errors.push(e); }
  }

  const oldCats = oldCity.categories || {};
  const newCats = newCity.categories || {};
  const catKeyToId = newCity._catKeyToId || {};

  // ── deleted categories ────────────────────────────────────
  for (const key of Object.keys(oldCats)) {
    if (!newCats[key]) {
      try { await syncCategoryDelete(newCity.id, key); } catch (e) { errors.push(e); }
    }
  }

  // ── new categories ────────────────────────────────────────
  for (const [key, newCat] of Object.entries(newCats)) {
    if (!oldCats[key]) {
      try {
        const catId = await syncCategoryInsert(newCity.id, tripId, key, newCat, Object.keys(newCats).indexOf(key));
        // Update in-memory mapping so subsequent item inserts use correct catId
        newCity._catKeyToId = { ...newCity._catKeyToId, [key]: catId };
      } catch (e) { errors.push(e); }
    }
  }

  // ── items within existing categories ─────────────────────
  for (const [key, newCat] of Object.entries(newCats)) {
    const oldCat = oldCats[key];
    if (!oldCat) continue;

    const oldItems = oldCat.items || [];
    const newItems = newCat.items || [];
    const catId = catKeyToId[key];

    // New items
    for (let idx = 0; idx < newItems.length; idx++) {
      const newItem = newItems[idx];
      const exists = oldItems.find(i => i.id === newItem.id);
      if (!exists && catId) {
        try {
          await syncItemInsert(newItem, catId, newCity.id, tripId, idx);
        } catch (e) { errors.push(e); }
      }
    }

    // Deleted items
    for (const oldItem of oldItems) {
      if (!newItems.find(i => i.id === oldItem.id)) {
        try { await syncItemDelete(oldItem.id); } catch (e) { errors.push(e); }
      }
    }

    // Changed items
    for (const newItem of newItems) {
      const oldItem = oldItems.find(i => i.id === newItem.id);
      if (oldItem) {
        const changed = newItem.done !== oldItem.done ||
          newItem.text !== oldItem.text ||
          newItem.note !== oldItem.note;
        if (changed) {
          try {
            await syncItemUpdate(newItem.id, {
              done: newItem.done,
              text: newItem.text,
              note: newItem.note,
            });
          } catch (e) { errors.push(e); }
        }
      }
    }
  }

  // ── schedule diff ─────────────────────────────────────────
  const oldSched = oldCity.schedule || [];
  const newSched = newCity.schedule || [];

  for (let dI = 0; dI < newSched.length; dI++) {
    const newDay = newSched[dI];
    const oldDay = oldSched[dI];
    if (!oldDay || !newDay._id) continue;

    const oldSlots = oldDay.slots || [];
    const newSlots = newDay.slots || [];

    // New slots
    for (let sI = 0; sI < newSlots.length; sI++) {
      const newSlot = newSlots[sI];
      const exists = oldSlots.find(s => s.id === newSlot.id);
      if (!exists && newDay._id) {
        try { await syncSlotInsert(newSlot, newDay._id, sI); } catch (e) { errors.push(e); }
      }
    }

    // Deleted slots
    for (const oldSlot of oldSlots) {
      if (!newSlots.find(s => s.id === oldSlot.id) && oldSlot.id) {
        try { await syncSlotDelete(oldSlot.id); } catch (e) { errors.push(e); }
      }
    }

    // Changed slots
    for (const newSlot of newSlots) {
      const oldSlot = oldSlots.find(s => s.id === newSlot.id);
      if (oldSlot) {
        const changed = newSlot.done !== oldSlot.done ||
          newSlot.text !== oldSlot.text ||
          newSlot.time !== oldSlot.time;
        if (changed) {
          try {
            await syncSlotUpdate(newSlot.id, {
              done: newSlot.done,
              text: newSlot.text,
              time: newSlot.time,
            });
          } catch (e) { errors.push(e); }
        }
      }
    }
  }

  if (errors.length > 0) console.error('Sync errors:', errors);
}

// ─────────────────────────────────────────────────────────────
// Trip diff sync (for bookings, transport, notes, archived)
// ─────────────────────────────────────────────────────────────

export async function syncTripDiff(oldTrip, newTrip) {
  const errors = [];

  // ── metadata ──────────────────────────────────────────────
  const metaFields = ['name', 'coverEmoji', 'startDate', 'endDate', 'archived', 'tripNotes', 'crew'];
  const metaChanged = metaFields.some(k => JSON.stringify(oldTrip[k]) !== JSON.stringify(newTrip[k]));
  if (metaChanged) {
    try { await updateTripMeta(newTrip.id, newTrip); } catch (e) { errors.push(e); }
  }

  // ── bookings ──────────────────────────────────────────────
  await syncBookingListDiff(oldTrip.bookings || [], newTrip.bookings || [], newTrip.id, false, errors);
  await syncBookingListDiff(oldTrip.transport || [], newTrip.transport || [], newTrip.id, true, errors);

  if (errors.length > 0) console.error('Trip sync errors:', errors);
}

async function syncBookingListDiff(oldList, newList, tripId, isTransport, errors) {
  for (const newItem of newList) {
    const oldItem = oldList.find(b => b.id === newItem.id);
    if (!oldItem) {
      // New booking
      try {
        await supabase.from('bookings').insert({
          id: newItem.id,
          trip_id: tripId,
          name: newItem.text,
          notes: newItem.note || '',
          is_urgent: newItem.urgent || false,
          completed: newItem.done || false,
          is_transport: isTransport,
          sort_order: newList.indexOf(newItem),
        });
      } catch (e) { errors.push(e); }
    } else {
      const changed = newItem.done !== oldItem.done ||
        newItem.text !== oldItem.text ||
        newItem.note !== oldItem.note;
      if (changed) {
        try {
          await supabase.from('bookings').update({
            name: newItem.text,
            notes: newItem.note || '',
            completed: newItem.done,
            is_urgent: newItem.urgent || false,
          }).eq('id', newItem.id);
        } catch (e) { errors.push(e); }
      }
    }
  }

  for (const oldItem of oldList) {
    if (!newList.find(b => b.id === oldItem.id)) {
      try {
        await supabase.from('bookings').delete().eq('id', oldItem.id);
      } catch (e) { errors.push(e); }
    }
  }
}

// ─────────────────────────────────────────────────────────────
// Profile
// ─────────────────────────────────────────────────────────────

export async function getProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function updateProfile(userId, updates) {
  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId);
  if (error) throw error;
}

export async function upsertProfile(userId, data) {
  const { error } = await supabase
    .from('profiles')
    .upsert({ id: userId, ...data });
  if (error) throw error;
}
