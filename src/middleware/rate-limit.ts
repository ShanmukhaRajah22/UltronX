import type { RequestHandler } from "express";

const buckets = new Map<string, { count: number; resetAt: number }>();
export const rateLimit = (windowMs: number, max: number): RequestHandler => (req, res, next) => {
    const now = Date.now();
    const key = `${req.ip}:${req.path}`;
    const current = buckets.get(key);
    const bucket = !current || current.resetAt <= now ? { count: 0, resetAt: now + windowMs } : current;
    bucket.count += 1;
    buckets.set(key, bucket);
    res.setHeader("X-RateLimit-Limit", max);
    res.setHeader("X-RateLimit-Remaining", Math.max(0, max - bucket.count));
    if (bucket.count > max) {
        res.setHeader("Retry-After", Math.ceil((bucket.resetAt - now) / 1000));
        res.status(429).json({ success: false, statusCode: 429, message: "Too many requests", requestId: req.requestId });
        return;
    }
    next();
};
