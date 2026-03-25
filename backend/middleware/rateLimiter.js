// Simple in-memory rate limiter (no external dependency required)

const rateLimit = (options = {}) => {
  const store = new Map();
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes
    max = 100,                  // max requests per window
    message = 'Too many requests, please try again later'
  } = options;

  // Cleanup old entries every 5 minutes
  setInterval(() => {
    const now = Date.now();
    for (const [key, value] of store.entries()) {
      if (now - value.startTime > windowMs) {
        store.delete(key);
      }
    }
  }, 5 * 60 * 1000);

  return (req, res, next) => {
    const key = req.ip || req.connection.remoteAddress;
    const now = Date.now();

    if (!store.has(key)) {
      store.set(key, { count: 1, startTime: now });
      return next();
    }

    const record = store.get(key);

    if (now - record.startTime > windowMs) {
      // Window expired, reset
      record.count = 1;
      record.startTime = now;
      return next();
    }

    record.count++;
    if (record.count > max) {
      return res.status(429).json({ error: message });
    }

    next();
  };
};

// Strict limiter for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: 'Too many login attempts, please try again after 15 minutes'
});

// General API limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500
});

// AI endpoint limiter (more generous for chat stability)
const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  message: 'AI request limit reached. Please wait a moment.'
});

module.exports = { rateLimit, authLimiter, apiLimiter, aiLimiter };
