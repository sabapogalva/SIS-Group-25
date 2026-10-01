import { useState } from 'react';
import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet';
import { UTS_CENTER, OSM_TILE_URL, OSM_ATTRIBUTION, formatCoordinates, isValidCoordinates, wrapLongitude } from '../constants/map';
import { selectionIcon } from '../utils/mapIcons';

const inputClass = 'w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-orange-400';

function LocationPicker({ position, onChange }) {
  useMapEvents({ click: (event) => onChange([event.latlng.lat, wrapLongitude(event.latlng.lng)]) });
  return <Marker position={position} icon={selectionIcon} draggable title="Drag to choose the event location" alt="Selected event location" eventHandlers={{ dragend: (event) => {
    const { lat, lng } = event.target.getLatLng();
    onChange([lat, wrapLongitude(lng)]);
  } }} />;
}

export default function EventForm({ onSubmit, onCancel }) {
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [time, setTime] = useState('');
  const [position, setPosition] = useState(UTS_CENTER);
  const formIsInvalid = !title.trim() || !location.trim() || !isValidCoordinates(position[0], position[1]);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (formIsInvalid) return;
    onSubmit({ title: title.trim(), location: location.trim(), time: time.trim() || 'TBD', latitude: position[0], longitude: position[1] });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-orange-100 rounded-2xl p-4 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-neutral-900">Host an event</h2>
        <button type="button" onClick={onCancel} className="text-xs text-neutral-400 hover:text-neutral-700">Cancel</button>
      </div>
      <label className="block text-xs font-semibold text-neutral-700">
        <span className="mb-1 block">Event title</span>
        <input value={title} onChange={(event) => setTitle(event.target.value)} required maxLength={80} placeholder="React study session" className={inputClass} />
      </label>
      <label className="block text-xs font-semibold text-neutral-700">
        <span className="mb-1 block">Venue or meeting point</span>
        <input value={location} onChange={(event) => setLocation(event.target.value)} required maxLength={80} placeholder="UTS Building 11, Lab 302" className={inputClass} />
      </label>
      <label className="block text-xs font-semibold text-neutral-700">
        <span className="mb-1 block">Time (optional)</span>
        <input value={time} onChange={(event) => setTime(event.target.value)} maxLength={40} placeholder="Today, 2:00 PM" className={inputClass} />
      </label>
      <div>
        <p className="mb-1 text-xs font-semibold text-neutral-700">Choose the event location</p>
        <p className="mb-2 text-[11px] text-neutral-400">Click the map or drag the pin to adjust it.</p>
        <MapContainer center={UTS_CENTER} zoom={16} minZoom={2} maxZoom={19} worldCopyJump scrollWheelZoom={false} className="isolate z-0 h-64 w-full rounded-xl overflow-hidden" aria-label="Choose event location on map">
          <TileLayer attribution={OSM_ATTRIBUTION} url={OSM_TILE_URL} maxZoom={19} />
          <LocationPicker position={position} onChange={setPosition} />
        </MapContainer>
        <p aria-live="polite" className="mt-1 text-[11px] text-neutral-500">Selected: {formatCoordinates(position[0], position[1])}</p>
        <p className="mt-1 text-[11px] text-neutral-500">The pin sets the map location. The venue name is a separate label.</p>
      </div>
      <button type="submit" disabled={formIsInvalid} className="w-full rounded-xl bg-orange-600 py-2.5 text-xs font-semibold text-white hover:bg-orange-700 disabled:cursor-not-allowed disabled:bg-orange-200">Publish event</button>
    </form>
  );
}
