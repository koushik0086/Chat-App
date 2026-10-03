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

  const optionalCloudinary = [
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET",
  ];

  const missingCloudinary = optionalCloudinary.filter((key) => !process.env[key]);

  if (missingCloudinary.length > 0) {
    console.warn(
      `⚠️ Cloudinary is not configured; file uploads will be disabled. Missing: ${missingCloudinary.join(", ")}`
    );
  }

  console.log("✅ Environment variables validated");
};

module.exports = validateEnv;