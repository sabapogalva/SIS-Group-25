export const UTS_CENTER = [-33.8835, 151.2005];

export const OSM_TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
export const OSM_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

export const isValidCoordinates = (latitude, longitude) =>
  Number.isFinite(latitude) && latitude >= -90 && latitude <= 90 &&
  Number.isFinite(longitude) && longitude >= -180 && longitude <= 180;

// Leaflet allows panning through repeated worlds; store one canonical longitude.
export const wrapLongitude = (longitude) => ((longitude + 180) % 360 + 360) % 360 - 180;

export const formatCoordinates = (latitude, longitude) =>
  `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
