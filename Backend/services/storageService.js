const admin = require('../config/firebase');
const fs = require('fs');

// Configure the bucket name either from env or auto-detect from initialized admin config
const bucketName = process.env.FIREBASE_STORAGE_BUCKET || (admin.apps && admin.apps.length > 0 && admin.app().options.projectId ? `${admin.app().options.projectId}.firebasestorage.app` : null);

let bucket;
if (admin.apps && admin.apps.length > 0 && bucketName) {
  try {
    bucket = admin.storage().bucket(bucketName);
    console.log(`Firebase Storage bucket initialized: ${bucketName}`);
  } catch (error) {
    console.error("Firebase Storage failed to initialize bucket:", error);
  }
}

/**
 * Uploads a local file to Firebase Storage.
 * @param {string} localFilePath - Path to the local file.
 * @param {string} destination - Path/name in the storage bucket.
 * @returns {Promise<string>} The public URL of the uploaded file.
 */
const uploadToFirebaseStorage = async (localFilePath, destination) => {
  if (!bucket) {
    throw new Error("Firebase Storage bucket is not initialized.");
  }

  // Upload the file
  const [file] = await bucket.upload(localFilePath, {
    destination: destination,
    metadata: {
      cacheControl: 'public, max-age=31536000',
    }
  });

  // Attempt to make the file public. This works if ACL is enabled on bucket.
  try {
    await file.makePublic();
  } catch (err) {
    // If Uniform Bucket-Level Access is enabled on Google Cloud Storage, makePublic() will fail.
    console.log("Uniform Bucket-Level Access enabled. Falling back to signed URL generation.");
  }

  // Generate a long-lasting signed URL (valid until 2099)
  try {
    const [signedUrl] = await file.getSignedUrl({
      action: 'read',
      expires: '12-31-2099'
    });
    return signedUrl;
  } catch (error) {
    console.error("Failed to generate signed URL. Falling back to direct URL:", error);
    // Fallback URL format (useful if rules permit public access or if signed URL generation fails)
    return `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(file.name)}?alt=media`;
  }
};

module.exports = {
  isStorageConfigured: () => !!bucket,
  uploadToFirebaseStorage
};
