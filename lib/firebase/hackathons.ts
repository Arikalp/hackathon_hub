import {
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./client";

export interface FirestoreHackathon {
  id: string;
  name: string;
  organizer: string;
  startAt: string;
  endAt: string;
  registrationDeadline?: string;
  mode: string;
  location?: string;
  eventUrl?: string;
  registrationUrl?: string;
  participantUids?: string[];
  status:
    | "planned"
    | "registered"
    | "participating"
    | "submitted"
    | "completed"
    | "cancelled";
  projectName?: string;
  projectDescription?: string;
  submissionUrl?: string;
  repositoryUrl?: string;
  outcome?: "participant" | "finalist" | "winner" | "none";
  notes?: string;
  tags?: string[];
  createdBy?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

// Fetch all hackathons for a given team
export async function getTeamHackathons(
  teamId: string
): Promise<FirestoreHackathon[]> {
  try {
    const snap = await getDocs(
      collection(db, "teams", teamId, "hackathons")
    );
    const hackathons: FirestoreHackathon[] = [];
    snap.forEach((d) => {
      hackathons.push({ id: d.id, ...d.data() } as FirestoreHackathon);
    });
    return hackathons;
  } catch (error) {
    console.error("Error fetching team hackathons:", error);
    return [];
  }
}

// Helper to strip undefined values so Firestore setDoc never throws Unsupported field value
export function cleanFirestoreData<T extends Record<string, any>>(obj: T): Record<string, any> {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined) {
      continue;
    }
    if (
      value !== null &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      !(value instanceof Date) &&
      typeof (value as any).toMillis !== "function"
    ) {
      result[key] = cleanFirestoreData(value);
    } else {
      result[key] = value;
    }
  }
  return result;
}

// Create a new hackathon record under a team
export async function createTeamHackathon(
  teamId: string,
  data: Omit<FirestoreHackathon, "id" | "createdAt" | "updatedAt">
): Promise<string> {
  const ref = doc(collection(db, "teams", teamId, "hackathons"));
  const newHackathon = cleanFirestoreData({
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  await setDoc(ref, newHackathon);
  return ref.id;
}

// Update a hackathon record
export async function updateTeamHackathon(
  teamId: string,
  hackathonId: string,
  updates: Partial<FirestoreHackathon>
): Promise<void> {
  const ref = doc(db, "teams", teamId, "hackathons", hackathonId);
  const cleanUpdates = cleanFirestoreData({
    ...updates,
    updatedAt: serverTimestamp(),
  });
  await updateDoc(ref, cleanUpdates);
}

// Delete a hackathon record
export async function deleteTeamHackathon(
  teamId: string,
  hackathonId: string
): Promise<void> {
  const ref = doc(db, "teams", teamId, "hackathons", hackathonId);
  await deleteDoc(ref);
}

// -------------------------------------------------------------
// Workspace HackathonRecord Cloud Persistence & Synchronization
// -------------------------------------------------------------
import type { HackathonRecord } from "../../app/workspace/components/AddHackathonModal";

// Save or Update a HackathonRecord to Firestore under users/{uid}/hackathons/{id}
export async function saveHackathonRecord(
  uid: string,
  record: HackathonRecord
): Promise<void> {
  if (!uid || uid === "guest") return;
  try {
    const ref = doc(db, "users", uid, "hackathons", record.id);
    const cleanData = cleanFirestoreData({
      ...record,
      bannerUrl: record.bannerUrl || "",
      location: record.location || "",
      college: record.college || "",
      userId: uid,
      updatedAt: serverTimestamp(),
    });
    await setDoc(ref, cleanData, { merge: true });
  } catch (err) {
    console.warn("Firestore sync warning during hackathon save (local cache used):", err);
  }
}

// Fetch all HackathonRecords for a user from Firestore
export async function getUserHackathonRecords(
  uid: string
): Promise<HackathonRecord[]> {
  if (!uid || uid === "guest") return [];
  try {
    const snap = await getDocs(collection(db, "users", uid, "hackathons"));
    const records: HackathonRecord[] = [];
    snap.forEach((d) => {
      records.push({ id: d.id, ...d.data() } as HackathonRecord);
    });
    return records;
  } catch (err) {
    console.warn("Firestore sync warning during hackathon fetch (local cache used):", err);
    return [];
  }
}

// Delete a HackathonRecord from Firestore
export async function deleteHackathonRecord(
  uid: string,
  hackathonId: string
): Promise<void> {
  if (!uid || uid === "guest" || !hackathonId) return;
  try {
    const ref = doc(db, "users", uid, "hackathons", hackathonId);
    await deleteDoc(ref);
  } catch (err) {
    console.warn("Firestore sync warning during hackathon delete:", err);
  }
}
