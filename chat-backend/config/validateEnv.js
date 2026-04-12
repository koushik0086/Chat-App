const validateEnv = () => {
  const required = [
    "PORT",
    "MONGO_URI",
    "JWT_SECRET",
    "JWT_EXPIRES_IN",
    "CLIENT_URL",
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET",
  ];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error(`❌ Missing required environment variables: ${missing.join(", ")}`);
    process.exit(1);
  }

  console.log("✅ Environment variables validated");
};

module.exports = validateEnv;