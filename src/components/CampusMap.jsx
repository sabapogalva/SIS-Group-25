import { Component, useEffect } from 'react';
import {
  ImageOverlay,
  MapContainer,
  Marker,
  Popup,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// ---------------------------------------------------------------------------
// 1. MAP IMAGE
// Files in /public are served from the site root, so the URL has no "/public".
// Put the file at:  public/uts-campus-map.avif
// ---------------------------------------------------------------------------
const CAMPUS_MAP_URL = '/uts-campus-map.avif';
const CAMPUS_MAP_URL =
  "/uts-campus-map.avif";

const IMAGE_WIDTH = 1824;
const IMAGE_HEIGHT = 1824;

// CRS.Simple uses [y, x] coordinates
const IMAGE_BOUNDS = L.latLngBounds([0, 0], [IMAGE_HEIGHT, IMAGE_WIDTH]);

// ---------------------------------------------------------------------------
// 2. CAMPUS POINTS — inline, so there is no second file to get wrong.
//    coords = [mapY, mapX] in image pixels (mapY = down, mapX = across).
//    Values below were read off the campus map artwork; nudge them freely.
// ---------------------------------------------------------------------------
const CAMPUS_POINTS = [
  { id: 'b01',  code: '01',   name: 'UTS Tower',                    description: 'Main administrative tower.',            coords: [1085, 959] },
  { id: 'b02',  code: '02',   name: 'Building 02',                  description: 'Faculty of Arts and Social Sciences.',  coords: [1164, 832] },
  { id: 'b03',  code: '03',   name: 'Building 03',                  description: 'UTS Business School.',                  coords: [1206, 1106] },
  { id: 'b04',  code: '04',   name: 'Building 04',                  description: 'Engineering and IT.',                   coords: [994, 1113] },
  { id: 'b05',  code: '05',   name: 'Building 05',                  description: 'Haymarket campus.',                     coords: [688, 1583] },
  { id: 'b06',  code: '06',   name: 'Building 06',                  description: 'Data Arena.',                           coords: [1078, 1242] },
  { id: 'b07',  code: '07',   name: 'Building 07',                  description: 'Library entrance area.',                coords: [925, 876] },
  { id: 'b08',  code: '08',   name: 'Building 08',                  description: 'Dr Chau Chak Wing Building.',           coords: [711, 1361] },
  { id: 'b09',  code: '09',   name: 'Building 09',                  description: 'Central courtyard building.',           coords: [1259, 1106] },
  { id: 'b10',  code: '10',   name: 'Building 10',                  description: 'Faculty of Science.',                   coords: [925, 631] },
  { id: 'b11',  code: '11',   name: 'UTS Library',                  description: 'Library and study spaces.',             coords: [1140, 631] },
  { id: 'b15',  code: '15',   name: 'Building 15',                  description: 'Postgraduate and research spaces.',     coords: [677, 1242] },
  { id: 'b18',  code: '18',   name: 'Building 18',                  description: 'Science labs.',                         coords: [1328, 1106] },
  { id: 'ca02', code: 'CA02', name: 'Bulga Ngurra Student Housing', description: 'UTS student accommodation.',            coords: [597, 217] },
  { id: 'ca03', code: 'CA03', name: 'Gumal Ngurra Student Housing', description: 'UTS student accommodation.',            coords: [1031, 378] },
  { id: 'ca06', code: 'CA06', name: 'Yura Mudang Student Housing',  description: 'UTS student accommodation.',            coords: [1012, 1370] },
  { id: 'ph01', code: 'PH01', name: 'Powerhouse Museum',            description: 'Adjacent cultural landmark.',           coords: [374, 1317] },
  { id: 'green', code: 'AG',  name: 'Alumni Green',                 description: 'Open lawn between buildings.',          coords: [1001, 830] },
];

/**
 * Flat teardrop pin matching the reference marker: solid fill, no border,
 * no shadow, sharp tip at the bottom. The path spans x 5..19 and y 2..22 of a
 * 24x24 box, so the viewBox is tightened to those bounds (14 x 20 = 0.7 ratio).
 */
function createPinIcon({ color = '#FF9124', width = 26 } = {}) {
  const height = Math.round(width / 0.7);

  return L.divIcon({
    // Replaces Leaflet's default 'leaflet-div-icon', which paints a white box
    className: 'campus-pin',
    html: `
      <svg class="campus-pin__svg" width="${width}" height="${height}"
           viewBox="5 2 14 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
              fill="${color}" />
      </svg>
    `,
    iconSize: [width, height],
    // Bottom tip of the pin sits exactly on the coordinate
    iconAnchor: [width / 2, height],
    popupAnchor: [0, -height],
  });
}

const orangePin = createPinIcon({ color: '#FF9124' });
const yellowPin = createPinIcon({ color: '#EAB308' });

/** Static map: fits the image once and on resize only. Never pans on its own. */
function FitImageToContainer() {
  const map = useMap();

  useEffect(() => {
    const container = map.getContainer();

    const fit = () => {
      map.invalidateSize();
      map.fitBounds(IMAGE_BOUNDS, { animate: false });
    };

    fit();

    const observer = new ResizeObserver(fit);
    observer.observe(container);

    return () => observer.disconnect();
  }, [map]);

  return null;
}

/** Shows the reason on screen instead of a blank white page. */
class MapErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error) {
    console.error('CampusMap crashed:', error);
  }

  render() {
    if (this.state.error) {
      return (
        <section className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          <p className="font-semibold">The campus map failed to render.</p>
          <pre className="mt-2 whitespace-pre-wrap text-xs">
            {String(this.state.error?.message ?? this.state.error)}
          </pre>
        </section>
      );
    }

    return this.props.children;
  }
}

function CampusMapInner({ events }) {
  const eventList = Array.isArray(events) ? events : [];

  const campusEvents = eventList.filter(
    event =>
      event?.type === 'event' &&
      typeof event.mapX === 'number' &&
      typeof event.mapY === 'number'
  );

  const totalPoints = CAMPUS_POINTS.length + campusEvents.length;

  return (
    <section className="overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-sm">
      <div className="border-b border-orange-100 bg-white px-5 py-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-orange-500">
          Live campus map
        </p>

        <div className="mt-1 flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-neutral-900">UTS events</h2>

          <span className="rounded-full bg-orange-50 px-2.5 py-1 text-xs font-medium text-orange-600">
            {totalPoints} {totalPoints === 1 ? 'point' : 'points'}
          </span>
        </div>

        <div className="mt-3 flex items-center gap-4 text-[11px] text-neutral-500">
          <div className="flex items-center gap-1.5">
            <svg width="10" height="14" viewBox="5 2 14 20" aria-hidden="true">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#FF9124" />
            </svg>
            Event
          </div>

          <div className="flex items-center gap-1.5">
            <svg width="10" height="14" viewBox="5 2 14 20" aria-hidden="true">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#EAB308" />
            </svg>
            Campus location
          </div>
        </div>
      </div>

      {/* Square container, matching the square 1824 x 1824 image */}
      <div className="relative aspect-square w-full bg-neutral-100">
        <MapContainer
          crs={L.CRS.Simple}
          center={[IMAGE_HEIGHT / 2, IMAGE_WIDTH / 2]}
          zoom={0}
          zoomSnap={0}
          minZoom={-5}
          maxZoom={5}
          dragging={false}
          zoomControl={false}
          scrollWheelZoom={false}
          doubleClickZoom={false}
          boxZoom={false}
          keyboard={false}
          touchZoom={false}
          attributionControl={false}
          className="h-full w-full"
        >
          <ImageOverlay url={CAMPUS_MAP_URL} bounds={IMAGE_BOUNDS} />

          <FitImageToContainer />

          {CAMPUS_POINTS.map(point => (
            <Marker key={point.id} position={point.coords} icon={yellowPin}>
              <Popup>
                <div className="min-w-[180px]">
                  <h3 className="font-semibold text-neutral-900">{point.name}</h3>

                  <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                    Building {point.code}
                  </p>

                  <p className="mt-1 text-sm text-neutral-600">{point.description}</p>
                </div>
              </Popup>
            </Marker>
          ))}

          {campusEvents.map(event => (
            <Marker
              key={event.id}
              position={[event.mapY, event.mapX]}
              icon={orangePin}
            >
              <Popup>
                <div className="min-w-[180px]">
                  <h3 className="font-semibold text-neutral-900">{event.title}</h3>

                  <p className="mt-1 text-sm text-neutral-600">{event.location}</p>

                  <p className="mt-1 text-xs text-neutral-500">{event.time}</p>

                  <p className="mt-2 text-xs text-neutral-400">
                    Posted by {event.author}
                  </p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </section>
  );
}

export default function CampusMap(props) {
  return (
    <MapErrorBoundary>
      <CampusMapInner {...props} />
    </MapErrorBoundary>
  );
}
