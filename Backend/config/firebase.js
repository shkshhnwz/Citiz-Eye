const admin = require("firebase-admin");

let serviceAccount;

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  try {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  } catch (error) {
    console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT env var:", error);
  }
}

if (!serviceAccount) {
  try {
    serviceAccount = require('../serviceAccountkey.json');
  } catch (error) {
    console.warn("serviceAccountkey.json not found, attempting to use separate Firebase environment variables.");
    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
      const formattedPrivateKey = process.env.FIREBASE_PRIVATE_KEY
        .trim()
        .replace(/^["']|["']$/g, "") // Remove leading/trailing quotes if present
        .replace(/\\n/g, "\n");       // Replace escaped \n with actual newlines

      serviceAccount = {
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: formattedPrivateKey
      };
    }
  }
}

if (serviceAccount) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  console.log("Firebase Admin initialized successfully.");
} else {
  console.error("Firebase Admin initialization failed: No service account credentials found.");
}

module.exports = admin;