const validateEnv = () => {
  const required = [
    "PORT",
    "MONGO_URI",
    "JWT_SECRET",
    "JWT_EXPIRES_IN",
    "CLIENT_URL",
  ];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error(`❌ Missing required environment variables: ${missing.join(", ")}`);
    process.exit(1);
  }

  // BACKEND_URL is optional — if not set, file URLs fall back to req.protocol + req.host
  if (!process.env.BACKEND_URL) {
    console.warn("⚠️  BACKEND_URL not set. File upload URLs will use req.host (may be wrong on Render). Set BACKEND_URL=https://your-api.onrender.com in Render environment variables.");
  }

  console.log("✅ Environment variables validated");
};

module.exports = validateEnv;
