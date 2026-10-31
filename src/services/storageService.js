import { storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

/**
 * Uploads an image file to Firebase Storage.
 * Falls back gracefully to a client-side Base64 Data URL if Storage API is restricted or offline.
 */
export async function uploadProofImage(file, userId = 'guest') {
  if (!file) return null;

  const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
  const storagePath = `proofs/${userId}/${fileName}`;

  try {
    if (storage) {
      const storageRef = ref(storage, storagePath);
      const snapshot = await uploadBytes(storageRef, file, {
        contentType: file.type || 'image/jpeg'
      });
      const downloadUrl = await getDownloadURL(snapshot.ref);
      return {
        url: downloadUrl,
        storagePath: storagePath,
        isCloudStorage: true
      };
    }
  } catch (error) {
    console.warn("Firebase Storage cloud upload encountered error, using resilient client preview:", error.message);
  }

  // Graceful fallback to client Data URL
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve({
        url: reader.result,
        storagePath: `local/${fileName}`,
        isCloudStorage: false
      });
    };
    reader.readAsDataURL(file);
  });
}

