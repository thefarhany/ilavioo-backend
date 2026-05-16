const { v2: cloudinary } = require("cloudinary");
// Ensure the Cloudinary configuration is present at startup.
if (!process.env.CLOUDINARY_URL) {
  throw new Error(
    "CLOUDINARY_URL environment variable is missing – required for image handling."
  );
}
// Parse cloud_name, api_key, api_secret from CLOUDINARY_URL
const cloudinaryUrlMatch = process.env.CLOUDINARY_URL.match(
  /cloudinary:\/\/([^:]+):([^@]+)@([^/]+)/
);
if (!cloudinaryUrlMatch) {
  throw new Error(
    "CLOUDINARY_URL format invalid – expected cloudinary://api_key:api_secret@cloud_name"
  );
}
cloudinary.config({
  cloud_name: cloudinaryUrlMatch[3],
  api_key: cloudinaryUrlMatch[1],
  api_secret: cloudinaryUrlMatch[2],
});
module.exports = { cloudinary };
