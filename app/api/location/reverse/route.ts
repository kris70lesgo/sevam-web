import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

type ReverseResult = {
  name: string;
  lat: number;
  lng: number;
};

const reverseCache = new Map<string, { expiresAt: number; data: ReverseResult }>();
const CACHE_TTL_MS = 5 * 60 * 1000;

function getMapboxKey() {
  return (
    process.env.MAPBOX_KEY ||
    process.env.MAPBOX_API_KEY ||
    process.env.MAPBOX_ACCESS_TOKEN ||
    process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN ||
    ""
  );
}

export async function GET(req: NextRequest) {
  try {
    const latRaw = req.nextUrl.searchParams.get("lat") ?? "";
    const lngRaw = req.nextUrl.searchParams.get("lng") ?? "";

    const lat = Number(latRaw);
    const lng = Number(lngRaw);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return NextResponse.json({ error: "Invalid coordinates" }, { status: 400 });
    }

    const cacheKey = `${lat.toFixed(5)},${lng.toFixed(5)}`;
    const cached = reverseCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return NextResponse.json(cached.data);
    }

    const mapboxKey = getMapboxKey();
    if (!mapboxKey) {
      return NextResponse.json({ error: "Mapbox key missing" }, { status: 500 });
    }

    const mapboxUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxKey}&country=IN,US&limit=1&language=en`;
    const response = await fetch(mapboxUrl, { method: "GET", cache: "no-store" });

    if (!response.ok) {
      return NextResponse.json({ error: "Mapbox request failed" }, { status: 502 });
    }

    const data = (await response.json()) as {
      features?: Array<{ place_name?: string }>;
    };

    const placeName = data.features?.[0]?.place_name ?? `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    const result: ReverseResult = { name: placeName, lat, lng };

    reverseCache.set(cacheKey, { expiresAt: Date.now() + CACHE_TTL_MS, data: result });

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Something failed" }, { status: 500 });
  }
}
