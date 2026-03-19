const rateLimitMap = new Map();

// Clear the map every minute to reset limits
setInterval(() => {
  rateLimitMap.clear();
}, 60000);

export const rateLimiter = (options) => {
  const { windowMs = 60000, max = 5, message = 'Too many requests, please try again later.' } = options;

  return (req, res, next) => {
    const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const current = rateLimitMap.get(ip) || 0;

    if (current >= max) {
      return res.status(429).json({
        status: 'fail',
        message
      });
    }

    rateLimitMap.set(ip, current + 1);
    next();
  };
};
