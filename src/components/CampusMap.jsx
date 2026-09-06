import { useEffect } from 'react';
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet marker icons when using React/Vite
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const UTS_CENTER = [-33.8832, 151.2006];

function MapUpdater({ events }) {
  const map = useMap();

  useEffect(() => {
    if (events.length === 0) return;

    const bounds = events.map(event => [
      event.latitude,
      event.longitude,
    ]);

    map.fitBounds(bounds, {
      padding: [40, 40],
      maxZoom: 17,
    });
  }, [events, map]);

  return null;
}

export default function CampusMap({ events = [] }) {
  const eventLocations = events.filter(
    event =>
      event.type === 'event' &&
      typeof event.latitude === 'number' &&
      typeof event.longitude === 'number'
  );

  return (
    <section className="overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-sm">
      <div className="border-b border-orange-100 bg-white px-5 py-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-orange-500">
          Live campus map
        </p>

        <div className="mt-1 flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-neutral-900">
            UTS events
          </h2>

          <span className="rounded-full bg-orange-50 px-2.5 py-1 text-xs font-medium text-orange-600">
            {eventLocations.length}{' '}
            {eventLocations.length === 1 ? 'event' : 'events'}
          </span>
        </div>
      </div>

      <div className="h-[520px]">
        <MapContainer
          center={UTS_CENTER}
          zoom={16}
          scrollWheelZoom
          className="h-full w-full"
        >
          {/* Aerial/satellite imagery */}
          <TileLayer
            attribution="Tiles &copy; Esri"
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          />

          <MapUpdater events={eventLocations} />

          {eventLocations.map(event => (
            <Marker
              key={event.id}
              position={[event.latitude, event.longitude]}
            >
              <Popup>
                <div className="min-w-[180px]">
                  <h3 className="font-semibold text-neutral-900">
                    {event.title}
                  </h3>

                  <p className="mt-1 text-sm text-neutral-600">
                    {event.location}
                  </p>

                  <p className="mt-1 text-xs text-neutral-500">
                    {event.time}
                  </p>

                  <p className="mt-2 text-xs text-neutral-400">
                    Posted by {event.author}
                  </p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {eventLocations.length === 0 && (
        <p className="border-t border-orange-100 px-5 py-3 text-center text-xs text-neutral-400">
          No events have been placed on the map yet.
        </p>
      )}
    </section>
  );
}
