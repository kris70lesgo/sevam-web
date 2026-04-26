import { NextResponse } from "next/server";
import { getServiceCatalog } from "@/lib/server/service-catalog";
import { getCachedCatalog, setCachedCatalog } from "@/lib/utils/catalog-cache";

// Cache configuration
const CACHE_TAG = "service-catalog";
const CACHE_DURATION = 3600; // 1 hour in seconds

export async function GET() {
  try {
    // Try to get cached catalog first
    const cached = await getCachedCatalog();
    if (cached) {
      // Return cached data immediately - no database hit
      return NextResponse.json(cached, {
        headers: {
          "X-Cache": "HIT",
          "Cache-Control": `public, max-age=${CACHE_DURATION}, s-maxage=${CACHE_DURATION}`,
        },
      });
    }

    // Cache miss - fetch from database
    const catalog = await getServiceCatalog();

    // Store in Redis cache
    await setCachedCatalog(catalog);

    return NextResponse.json(catalog, {
      headers: {
        "X-Cache": "MISS",
        "Cache-Control": `public, max-age=${CACHE_DURATION}, s-maxage=${CACHE_DURATION}`,
      },
    });
  } catch (error) {
    console.error("[catalog] Error:", error instanceof Error ? error.message : error);
    console.error("[catalog] Stack:", error instanceof Error ? error.stack : "N/A");
    return NextResponse.json(
      { error: "Unable to load service catalog", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
