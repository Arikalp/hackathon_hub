import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./client";

export interface Team {
  id: string;
  name: string;
  description?: string;
  ownerUid: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface TeamMember {
  uid: string;
  role: "owner" | "admin" | "member";
  joinedAt?: unknown;
  displayName?: string;
  email?: string;
  photoURL?: string;
}

export interface TeamInvitation {
  id: string;
  teamId: string;
  teamName: string;
  invitedEmail: string;
  role: "admin" | "member";
  status: "pending" | "accepted" | "rejected";
  createdBy: string;
  createdAt?: unknown;
}

// Create a new team
export async function createTeam(
  name: string,
  description: string,
  ownerUid: string
): Promise<string> {
  const teamRef = doc(collection(db, "teams"));
  const teamId = teamRef.id;

  const newTeam = {
    name,
    description,
    ownerUid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(teamRef, newTeam);

  // Add owner to members subcollection: `teams/{teamId}/members/{ownerUid}`
  const memberRef = doc(db, "teams", teamId, "members", ownerUid);
  await setDoc(memberRef, {
    role: "owner",
    joinedAt: serverTimestamp(),
  });

  return teamId;
}

// Fetch all teams a user belongs to
export async function getUserTeams(uid: string): Promise<Team[]> {
  try {
    // Check teams where user is owner
    const teamsQuery = query(
      collection(db, "teams"),
      where("ownerUid", "==", uid)
    );
    const snap = await getDocs(teamsQuery);
    const teams: Team[] = [];

    snap.forEach((d) => {
      teams.push({ id: d.id, ...d.data() } as Team);
    });

    return teams;
  } catch (error) {
    console.error("Error fetching user teams:", error);
    return [];
  }
}

// Fetch members of a team
export async function getTeamMembers(teamId: string): Promise<TeamMember[]> {
  try {
    const membersSnap = await getDocs(
      collection(db, "teams", teamId, "members")
    );
    const members: TeamMember[] = [];

    for (const memberDoc of membersSnap.docs) {
      const data = memberDoc.data();
      const userRef = doc(db, "users", memberDoc.id);
      const userSnap = await getDoc(userRef);

      members.push({
        uid: memberDoc.id,
        role: data.role || "member",
        joinedAt: data.joinedAt,
        displayName: userSnap.exists()
          ? userSnap.data()?.displayName
          : "Builder",
        email: userSnap.exists() ? userSnap.data()?.email : "",
        photoURL: userSnap.exists() ? userSnap.data()?.photoURL : "",
      });
    }

    return members;
  } catch (error) {
    console.error("Error fetching team members:", error);
    return [];
  }
}

// Send an invitation to a teammate
export async function inviteTeammate(
  teamId: string,
  teamName: string,
  invitedEmail: string,
  role: "admin" | "member" = "member",
  createdBy: string
): Promise<string> {
  const invRef = doc(collection(db, "teamInvitations"));
  await setDoc(invRef, {
    teamId,
    teamName,
    invitedEmail,
    role,
    status: "pending",
    createdBy,
    createdAt: serverTimestamp(),
  });
  return invRef.id;
}
