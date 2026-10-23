import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  UploadMetadata,
} from "firebase/storage";
import { storage } from "./client";

/**
 * Uploads a generic file to Firebase Storage under the given path and returns its public download URL.
 * Also provides a resilient fallback to a local DataURL if network or rules fail, so user experience is uninterrupted.
 */
export async function uploadFileToStorage(
  storagePath: string,
  file: File | Blob,
  metadata?: UploadMetadata
): Promise<string> {
  try {
    const storageRef = ref(storage, storagePath);
    const contentType = file.type || "image/jpeg";
    const uploadResult = await uploadBytes(storageRef, file, {
      contentType,
      ...metadata,
    });
    const downloadURL = await getDownloadURL(uploadResult.ref);
    return downloadURL;
  } catch (error) {
    console.warn("Firebase Storage direct upload warning:", error);
    // Graceful fallback to DataURL so offline/local updates still render immediately
    return new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.readAsDataURL(file);
    });
  }
}

/**
 * Upload a user profile picture to Firebase Storage
 */
export async function uploadUserProfileImage(
  userId: string,
  file: File
): Promise<string> {
  const extension = file.name.split(".").pop() || "png";
  const path = `users/${userId}/avatar_${Date.now()}.${extension}`;
  return uploadFileToStorage(path, file, {
    customMetadata: {
      userId,
      uploadedAt: new Date().toISOString(),
      type: "user_avatar",
    },
  });
}

/**
 * Upload a team logo or icon to Firebase Storage
 */
export async function uploadTeamLogo(
  teamId: string,
  file: File
): Promise<string> {
  const extension = file.name.split(".").pop() || "png";
  const path = `teams/${teamId}/logo_${Date.now()}.${extension}`;
  return uploadFileToStorage(path, file, {
    customMetadata: {
      teamId,
      uploadedAt: new Date().toISOString(),
      type: "team_logo",
    },
  });
}

/**
 * Upload a hackathon banner/project image to Firebase Storage
 */
export async function uploadHackathonBanner(
  hackathonId: string,
  file: File
): Promise<string> {
  const extension = file.name.split(".").pop() || "png";
  const path = `hackathons/${hackathonId}/banner_${Date.now()}.${extension}`;
  return uploadFileToStorage(path, file, {
    customMetadata: {
      hackathonId,
      uploadedAt: new Date().toISOString(),
      type: "hackathon_banner",
    },
  });
}

/**
 * Remove an existing file from Firebase Storage
 */
export async function deleteStorageFile(storagePathOrUrl: string): Promise<void> {
  try {
    if (storagePathOrUrl.startsWith("http")) {
      const storageRef = ref(storage, storagePathOrUrl);
      await deleteObject(storageRef);
    } else {
      const storageRef = ref(storage, storagePathOrUrl);
      await deleteObject(storageRef);
    }
  } catch (err) {
    console.warn("Storage deletion error:", err);
  }
}
