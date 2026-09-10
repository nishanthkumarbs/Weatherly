interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

class InMemoryCache {
  private cache = new Map<string, CacheEntry<unknown>>();
  private maxEntries: number;

  constructor(maxEntries = 500) {
    this.maxEntries = maxEntries;
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  set<T>(key: string, data: T, ttlSeconds: number): void {
    if (this.cache.size >= this.maxEntries) {
      // Evict expired entries or first key (FIFO)
      const now = Date.now();
      let evicted = false;
      for (const [k, v] of this.cache.entries()) {
        if (now > v.expiresAt) {
          this.cache.delete(k);
          evicted = true;
          break;
        }
      }
      if (!evicted) {
        const firstKey = this.cache.keys().next().value;
        if (firstKey) this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, {
      data,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }
}

// Global singleton cache across Next.js API route invocations
const globalCache = globalThis as unknown as { __weatherly_cache?: InMemoryCache };
if (!globalCache.__weatherly_cache) {
  globalCache.__weatherly_cache = new InMemoryCache();
}

export const serverCache = globalCache.__weatherly_cache;
