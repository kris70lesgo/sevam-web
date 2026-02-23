/** Earth radius in km */
const R = 6371;

function toRad(deg: number) {
  return (deg * Math.PI) / 180;
}

/**
 * Haversine formula — great-circle distance between two lat/lng points.
 * Returns distance in kilometres.
 */
export function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;

  return 2 * R * Math.asin(Math.sqrt(a));
}

/**
 * Returns a bounding box [minLat, maxLat, minLng, maxLng] for a given centre
 * and radius in km — useful to pre-filter DB rows before Haversine.
 */
export function boundingBox(
  lat: number,
  lng: number,
  radiusKm: number
): { minLat: number; maxLat: number; minLng: number; maxLng: number } {
  const latDelta = radiusKm / R * (180 / Math.PI);
  // Longitude delta varies by latitude
  const lngDelta = (radiusKm / (R * Math.cos((lat * Math.PI) / 180))) * (180 / Math.PI);

  return {
    minLat: lat - latDelta,
    maxLat: lat + latDelta,
    minLng: lng - lngDelta,
    maxLng: lng + lngDelta,
  };
}

/** Format km distance for display: "<1 km" or "3.2 km" */
export function formatDistance(km: number): string {
  if (km < 1) return "<1 km";
  return `${km.toFixed(1)} km`;
}
