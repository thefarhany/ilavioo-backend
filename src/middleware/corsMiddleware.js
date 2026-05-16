const corsMiddleware = (req, res, next) => {
  const allowedOrigins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    process.env.CORS_ORIGIN,
  ].filter(Boolean);

  const origin = req.headers.origin;

  // Allow requests with no origin (like mobile apps or curl requests)
  if (!origin || allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin || allowedOrigins[0] || "*");
    res.setHeader("Access-Control-Allow-Credentials", "true");
  }

  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS, PATCH"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-CSRF-Token"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  next();
};

module.exports = corsMiddleware;
