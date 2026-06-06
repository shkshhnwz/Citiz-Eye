const cloudinary = require('cloudinary').v2;
require("dotenv").config();
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})
/**
 * Uploads a local file to Cloudinary.
 * @param {string} localFilePath - Path to the local file.
 * @returns {Promise<string>} The secure HTTPS URL of the uploaded image.
 */
const uploadToCloudinary = async (localFilePath) => {
  try {
    const result = await cloudinary.uploader.upload(localFilePath, {
      folder: 'citizeye_reports', // Saves images in a specific folder inside Cloudinary
    });
    return result.secure_url; // Returns the permanent secure HTTPS url
  } catch (error) {
    console.error("Cloudinary Upload Error:", error);
    throw error;
  }
};
const isStorageConfigured = () => {
  return !!process.env.CLOUDINARY_NAME && !!process.env.CLOUDINARY_API_KEY && !!process.env.CLOUDINARY_API_SECRET;
}
module.exports = {
  uploadToCloudinary,
  isStorageConfigured
};

