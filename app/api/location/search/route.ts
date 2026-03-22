import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

type SearchResult = {
  name: string;
  lat: number;
  lng: number;
};

const searchCache = new Map<string, { expiresAt: number; data: SearchResult[] }>();
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
    const query = req.nextUrl.searchParams.get("q")?.trim() ?? "";

    if (query.length < 3) {
      return NextResponse.json([]);
    }

    const cacheKey = query.toLowerCase();
    const cached = searchCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return NextResponse.json(cached.data);
    }

    const mapboxKey = getMapboxKey();
    if (!mapboxKey) {
      return NextResponse.json({ error: "Mapbox key missing" }, { status: 500 });
    }

    const encodedQuery = encodeURIComponent(query);
    const mapboxUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedQuery}.json?access_token=${mapboxKey}&autocomplete=true&country=IN,US&types=address,place,locality,neighborhood,poi&limit=10&language=en`;

    const response = await fetch(mapboxUrl, { method: "GET", cache: "no-store" });
    if (!response.ok) {
      return NextResponse.json({ error: "Mapbox request failed" }, { status: 502 });
    }

    const data = (await response.json()) as {
      features?: Array<{ place_name?: string; center?: [number, number] }>;
    };

    const results: SearchResult[] = (data.features ?? [])
      .map((place) => ({
        name: place.place_name ?? "",
        lat: place.center?.[1] ?? 0,
        lng: place.center?.[0] ?? 0,
      }))
      .filter((place) => Boolean(place.name) && Number.isFinite(place.lat) && Number.isFinite(place.lng));

    searchCache.set(cacheKey, { expiresAt: Date.now() + CACHE_TTL_MS, data: results });

    return NextResponse.json(results);
  } catch {
    return NextResponse.json({ error: "Something failed" }, { status: 500 });
  }
}
