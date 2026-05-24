const store = new Map();

/**
 * @param {Request} req
 * @param {Object} options
 * @param {number} options.limit - max requests allowed
 * @param {number} options.windowMs - time window in milliseconds
 * @param {string} options.key - unique key for this route (e.g. "login")
 */
export function rateLimit(req, { limit, windowMs, key }) {

      const ip =
            req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
            req.headers.get("x-real-ip") ||
            "unknown";

      const storeKey = `${key}:${ip}`;
      const now = Date.now();

      const record = store.get(storeKey);

      // First request from this IP for this route
      if (!record) {
            store.set(storeKey, { count: 1, start: now });
            return null;
      }

      // Window expired — reset
      if (now - record.start > windowMs) {
            store.set(storeKey, { count: 1, start: now });
            return null;
      }

      // Within window — increment
      record.count += 1;

      // Limit exceeded
      if (record.count > limit) {
            const retryAfter = Math.ceil(
                  (record.start + windowMs - now) / 1000
            );

            return {
                  limited: true,
                  retryAfter,
            };
      }

      return null;
}