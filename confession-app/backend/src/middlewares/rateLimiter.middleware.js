const rateLimitMap = new Map();

function getClientKey(req, suffix = "") {
  const forwarded = req.headers["x-forwarded-for"];
  const proxiedIp = Array.isArray(forwarded) ? forwarded[0] : forwarded?.split(",")[0];
  const ip = proxiedIp?.trim() || req.ip || req.connection.remoteAddress || "unknown";
  return `${ip}:${suffix || req.path}`;
}

function pruneExpiredEntries(now) {
  for (const [key, value] of rateLimitMap.entries()) {
    if (value.resetAt <= now) {
      rateLimitMap.delete(key);
    }
  }
}

export const rateLimiter = (options) => {
  const {
    windowMs = 60000,
    max = 5,
    message = 'Too many requests, please try again later.',
    keySuffix = ''
  } = options;

  return (req, res, next) => {
    const now = Date.now();
    pruneExpiredEntries(now);

    const key = getClientKey(req, keySuffix);
    const currentWindow = rateLimitMap.get(key);

    if (!currentWindow || currentWindow.resetAt <= now) {
      rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
      next();
      return;
    }

    if (currentWindow.count >= max) {
      const retryAfterSeconds = Math.ceil((currentWindow.resetAt - now) / 1000);
      res.setHeader("Retry-After", String(retryAfterSeconds));
      return res.status(429).json({
        status: 'fail',
        message
      });
    }

    currentWindow.count += 1;
    rateLimitMap.set(key, currentWindow);
    next();
  };
};
