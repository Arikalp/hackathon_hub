import {
  collection,
  doc,
  setDoc,
  getDocs,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./client";

export interface AppNotification {
  id: string;
  type: "reminder" | "deadline" | "invite" | "update";
  title: string;
  message: string;
  teamId?: string;
  hackathonId?: string;
  readAt?: unknown;
  createdAt?: unknown;
}

// Fetch all notifications for a user
export async function getUserNotifications(
  uid: string
): Promise<AppNotification[]> {
  try {
    const snap = await getDocs(
      collection(db, "users", uid, "notifications")
    );
    const notifications: AppNotification[] = [];
    snap.forEach((d) => {
      notifications.push({ id: d.id, ...d.data() } as AppNotification);
    });
    return notifications;
  } catch (error) {
    console.error("Error fetching user notifications:", error);
    return [];
  }
}

// Mark notification as read
export async function markNotificationAsRead(
  uid: string,
  notificationId: string
): Promise<void> {
  const ref = doc(db, "users", uid, "notifications", notificationId);
  await updateDoc(ref, {
    readAt: serverTimestamp(),
  });
}

// Create a new notification for a user
export async function createUserNotification(
  uid: string,
  notification: Omit<AppNotification, "id" | "createdAt" | "readAt">
): Promise<string> {
  const ref = doc(collection(db, "users", uid, "notifications"));
  await setDoc(ref, {
    ...notification,
    createdAt: serverTimestamp(),
    readAt: null,
  });
  return ref.id;
}
