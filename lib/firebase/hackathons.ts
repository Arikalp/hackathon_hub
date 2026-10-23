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

// Create a new hackathon record under a team
export async function createTeamHackathon(
  teamId: string,
  data: Omit<FirestoreHackathon, "id" | "createdAt" | "updatedAt">
): Promise<string> {
  const ref = doc(collection(db, "teams", teamId, "hackathons"));
  const newHackathon = {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
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
  await updateDoc(ref, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

// Delete a hackathon record
export async function deleteTeamHackathon(
  teamId: string,
  hackathonId: string
): Promise<void> {
  const ref = doc(db, "teams", teamId, "hackathons", hackathonId);
  await deleteDoc(ref);
}
