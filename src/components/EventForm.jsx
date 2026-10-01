import { useState } from 'react';
import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet';
import {
  OSM_ATTRIBUTION,
  OSM_TILE_URL,
  UTS_CENTER,
  formatCoordinates,
  isValidCoordinates,
  wrapLongitude,
} from '../constants/map';
import { selectionIcon } from '../utils/mapIcons';

const inputClass = 'w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-orange-400';
const categories = [
  ['study_session', 'Study session'],
  ['coffee_break', 'Coffee break'],
  ['lunch', 'Lunch'],
  ['walk', 'Walk'],
  ['casual_game', 'Casual game'],
  ['group_discussion', 'Group discussion'],
  ['other', 'Other'],
];

function toLocalDateTime(date) {
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function LocationPicker({ position, onChange }) {
  useMapEvents({
    click: (event) => onChange([event.latlng.lat, wrapLongitude(event.latlng.lng)]),
  });

  return (
    <Marker
      position={position}
      icon={selectionIcon}
      draggable
      title="Drag to choose the event location"
      alt="Selected event location"
      eventHandlers={{
        dragend: (event) => {
          const { lat, lng } = event.target.getLatLng();
          onChange([lat, wrapLongitude(lng)]);
        },
      }}
    />
  );
}

export default function EventForm({ areas = [], onSubmit, onCancel, submitting = false }) {
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('study_session');
  const [participantLimit, setParticipantLimit] = useState('3');
  const [areaId, setAreaId] = useState('');
  const [startTime, setStartTime] = useState(() => toLocalDateTime(new Date(Date.now() + 30 * 60 * 1000)));
  const [endTime, setEndTime] = useState(() => toLocalDateTime(new Date(Date.now() + 90 * 60 * 1000)));
  const [position, setPosition] = useState(UTS_CENTER);

  const effectiveAreaId = areaId || areas[0]?.id || '';
  const selectedArea = areas.find((area) => area.id === effectiveAreaId);
  const formIsInvalid = !title.trim()
    || title.trim().length < 3
    || !location.trim()
    || !effectiveAreaId
    || !startTime
    || !endTime
    || new Date(endTime) <= new Date(startTime)
    || !isValidCoordinates(position[0], position[1]);

  const handleAreaChange = (event) => {
    const nextAreaId = event.target.value;
    setAreaId(nextAreaId);
    const nextArea = areas.find((area) => area.id === nextAreaId);
    const latitude = nextArea?.locations?.latitude;
    const longitude = nextArea?.locations?.longitude;
    if (isValidCoordinates(latitude, longitude)) setPosition([latitude, longitude]);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (formIsInvalid) return;
    onSubmit({
      title: title.trim(),
      location: location.trim(),
      description: description.trim() || null,
      category,
      participantLimit: Number(participantLimit),
      areaId: effectiveAreaId,
      startTime: new Date(startTime).toISOString(),
      endTime: new Date(endTime).toISOString(),
      latitude: position[0],
      longitude: position[1],
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-orange-100 rounded-2xl p-4 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-neutral-900">Host an event</h2>
          <p className="text-[11px] text-neutral-400">Create a public meetup for verified Recess users.</p>
        </div>
        <button type="button" onClick={onCancel} className="text-xs text-neutral-400 hover:text-neutral-700">Cancel</button>
      </div>

      <label className="block text-xs font-semibold text-neutral-700">
        <span className="mb-1 block">Event title</span>
        <input value={title} onChange={(event) => setTitle(event.target.value)} required minLength={3} maxLength={80} placeholder="React study session" className={inputClass} />
      </label>

      <label className="block text-xs font-semibold text-neutral-700">
        <span className="mb-1 block">Venue or meeting point</span>
        <input value={location} onChange={(event) => setLocation(event.target.value)} required maxLength={120} placeholder="UTS Building 11, Lab 302" className={inputClass} />
      </label>

      <label className="block text-xs font-semibold text-neutral-700">
        <span className="mb-1 block">Area</span>
        <select value={effectiveAreaId} onChange={handleAreaChange} required className={inputClass}>
          <option value="">Select an approved campus area</option>
          {areas.map((area) => <option key={area.id} value={area.id}>{area.name}</option>)}
        </select>
      </label>

      <div className="grid grid-cols-2 gap-2">
        <label className="block text-xs font-semibold text-neutral-700">
          <span className="mb-1 block">Category</span>
          <select value={category} onChange={(event) => setCategory(event.target.value)} className={inputClass}>
            {categories.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
        <label className="block text-xs font-semibold text-neutral-700">
          <span className="mb-1 block">Places available</span>
          <select value={participantLimit} onChange={(event) => setParticipantLimit(event.target.value)} className={inputClass}>
            {[1, 2, 3, 4, 5].map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
        </label>
      </div>

      <label className="block text-xs font-semibold text-neutral-700">
        <span className="mb-1 block">Description (optional)</span>
        <textarea value={description} onChange={(event) => setDescription(event.target.value)} maxLength={500} rows={2} placeholder="What should people know before joining?" className={`${inputClass} resize-none`} />
      </label>

      <div className="grid grid-cols-2 gap-2">
        <label className="block text-xs font-semibold text-neutral-700">
          <span className="mb-1 block">Starts</span>
          <input type="datetime-local" value={startTime} onChange={(event) => setStartTime(event.target.value)} required className={inputClass} />
        </label>
        <label className="block text-xs font-semibold text-neutral-700">
          <span className="mb-1 block">Ends</span>
          <input type="datetime-local" value={endTime} onChange={(event) => setEndTime(event.target.value)} required className={inputClass} />
        </label>
      </div>

      <div>
        <p className="mb-1 text-xs font-semibold text-neutral-700">Choose the event location</p>
        <p className="mb-2 text-[11px] text-neutral-400">Click the map or drag the pin. The pin is a public meeting point, not your live location.</p>
        <MapContainer center={position} zoom={16} minZoom={2} maxZoom={19} worldCopyJump scrollWheelZoom={false} className="isolate z-0 h-64 w-full rounded-xl overflow-hidden" aria-label="Choose event location on map">
          <TileLayer attribution={OSM_ATTRIBUTION} url={OSM_TILE_URL} maxZoom={19} />
          <LocationPicker position={position} onChange={setPosition} />
        </MapContainer>
        <p aria-live="polite" className="mt-1 text-[11px] text-neutral-500">Selected: {formatCoordinates(position[0], position[1])}</p>
        <p className="mt-1 text-[11px] text-neutral-500">Approved area: {selectedArea?.name ?? 'Select an area'}</p>
      </div>

      <button type="submit" disabled={formIsInvalid || submitting} className="w-full rounded-xl bg-orange-600 py-2.5 text-xs font-semibold text-white hover:bg-orange-700 disabled:cursor-not-allowed disabled:bg-orange-200">
        {submitting ? 'Publishing…' : 'Publish event'}
      </button>
    </form>
  );
}
