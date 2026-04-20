import { Redis } from "@upstash/redis";
import type { ServiceCatalogResponse } from "@/lib/server/service-catalog";

const CACHE_KEY = "sevam:service:catalog";
const CACHE_TTL_SECONDS = 3600; // 1 hour cache

// Lazy Redis init
const getRedis = () => {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
};

export async function getCachedCatalog(): Promise<ServiceCatalogResponse | null> {
  const redis = getRedis();
  if (!redis) return null;

  try {
    const cached = await redis.get<ServiceCatalogResponse>(CACHE_KEY);
    return cached;
  } catch {
    return null;
  }
}

export async function setCachedCatalog(catalog: ServiceCatalogResponse): Promise<void> {
  const redis = getRedis();
  if (!redis) return;

  try {
    await redis.setex(CACHE_KEY, CACHE_TTL_SECONDS, catalog);
  } catch {
    // Fail silently - caching is optional
  }
}
