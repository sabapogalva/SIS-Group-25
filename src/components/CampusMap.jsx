import { useEffect, useRef } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import { UTS_CENTER, OSM_TILE_URL, OSM_ATTRIBUTION, isValidCoordinates } from '../constants/map';
import { eventIcon } from '../utils/mapIcons';

function FitToEvents({ events }) {
  const map = useMap();
  const previousPoints = useRef(null);
  useEffect(() => {
    const points = events.map((event) => [event.latitude, event.longitude]);
    const pointsKey = JSON.stringify(points);
    // Opening the form or posting a status must not reset the user's map view.
    if (pointsKey === previousPoints.current) return;
    previousPoints.current = pointsKey;
    if (points.length > 1) map.fitBounds(points, { padding: [32, 32], maxZoom: 17 });
    else if (points.length === 1) map.setView(points[0], 17);
    else map.setView(UTS_CENTER, 16);
  }, [events, map]);
  return null;
}

export default function CampusMap({ events = [] }) {
  const visibleEvents = events.filter((event) => isValidCoordinates(event.latitude, event.longitude));
  return (
    <div className="bg-white border border-neutral-100 rounded-2xl overflow-hidden shadow-sm">
      <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100">
        <div>
          <p className="text-sm font-bold text-neutral-900">Campus event map</p>
          <p className="text-[11px] text-neutral-400">Pan and zoom to explore meeting points</p>
        </div>
        <span className="text-[11px] font-semibold text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
          {visibleEvents.length} event{visibleEvents.length === 1 ? '' : 's'}
        </span>
      </div>
      <MapContainer center={UTS_CENTER} zoom={16} minZoom={2} maxZoom={19} worldCopyJump scrollWheelZoom className="isolate z-0 h-[520px] w-full" aria-label="Campus event map">
        <TileLayer
          attribution={OSM_ATTRIBUTION}
          url={OSM_TILE_URL}
          maxZoom={19}
        />
        <FitToEvents events={visibleEvents} />
        {visibleEvents.map((event) => (
          <Marker key={event.id} position={[event.latitude, event.longitude]} icon={eventIcon} title={event.title} alt={event.title}>
            <Popup>
              <div className="min-w-[170px]">
                <p className="font-bold text-neutral-900">{event.title}</p>
                <p className="mt-1 text-xs text-neutral-500">{event.location}</p>
                <p className="mt-1 text-xs text-neutral-400">{event.time}</p>
                <p className="mt-2 text-xs text-neutral-400">Posted by {event.author}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
