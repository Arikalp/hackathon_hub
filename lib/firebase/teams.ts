import {
  collection,
  doc,
  setDoc,
  updateDoc,
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
  logoUrl?: string;
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
  inviterName?: string;
  createdAt?: unknown;
}

// Create a new team
export async function createTeam(
  name: string,
  description: string,
  ownerUid: string,
  logoUrl?: string
): Promise<string> {
  const teamRef = doc(collection(db, "teams"));
  const teamId = teamRef.id;

  const newTeam = {
    name,
    description,
    ownerUid,
    ...(logoUrl ? { logoUrl } : {}),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(teamRef, newTeam);

  // Add owner to members subcollection & bookmark under users/{ownerUid}/teams
  if (ownerUid && ownerUid !== "guest") {
    try {
      const memberRef = doc(db, "teams", teamId, "members", ownerUid);
      await setDoc(memberRef, {
        role: "owner",
        joinedAt: serverTimestamp(),
      });

      const userTeamRef = doc(db, "users", ownerUid, "teams", teamId);
      await setDoc(userTeamRef, {
        teamId,
        name,
        description,
        role: "owner",
        ...(logoUrl ? { logoUrl } : {}),
        joinedAt: serverTimestamp(),
      });
    } catch (e) {
      console.warn("User team bookmark warning:", e);
    }
  }

  return teamId;
}

// Save or sync a team member to Firestore under teams/{teamId}/members/{memberUid}
export async function saveTeamMember(
  teamId: string,
  member: TeamMember
): Promise<void> {
  if (!teamId || !member.uid) return;
  try {
    const memberRef = doc(db, "teams", teamId, "members", member.uid);
    await setDoc(
      memberRef,
      {
        role: member.role,
        displayName: member.displayName || "Builder",
        email: member.email || "",
        photoURL: member.photoURL || "",
        joinedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (e) {
    console.warn("Team member cloud sync warning:", e);
  }
}

// Fetch all teams a user belongs to
export async function getUserTeams(uid: string): Promise<Team[]> {
  if (!uid || uid === "guest") return [];
  try {
    const teams: Team[] = [];

    // 1. Check users/{uid}/teams (direct user ownership collection)
    try {
      const userTeamsSnap = await getDocs(collection(db, "users", uid, "teams"));
      userTeamsSnap.forEach((d) => {
        const data = d.data();
        teams.push({
          id: data.teamId || d.id,
          name: data.name || "Squad",
          description: data.description || "",
          ownerUid: uid,
        });
      });
    } catch {
      // ignore
    }

    // 2. Query collection 'teams' where ownerUid == uid
    try {
      const teamsQuery = query(
        collection(db, "teams"),
        where("ownerUid", "==", uid)
      );
      const snap = await getDocs(teamsQuery);
      snap.forEach((d) => {
        if (!teams.some((t) => t.id === d.id)) {
          teams.push({ id: d.id, ...d.data() } as Team);
        }
      });
    } catch {
      // ignore
    }

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

// Send an invitation to a teammate (Firestore record; email is sent via /api/invitations)
export async function inviteTeammate(
  teamId: string,
  teamName: string,
  invitedEmail: string,
  role: "admin" | "member" = "member",
  createdBy: string,
  inviterName?: string
): Promise<string> {
  // Skip duplicate pending invites for the same email + team
  try {
    const dupQuery = query(
      collection(db, "teamInvitations"),
      where("invitedEmail", "==", invitedEmail),
      where("teamId", "==", teamId)
    );
    const dupSnap = await getDocs(dupQuery);
    let existing: string | null = null;
    dupSnap.forEach((d) => {
      const data = d.data();
      if (data?.status === "pending" || data?.status === "accepted") {
        existing = (data.status as string) || "pending";
      }
    });
    if (existing === "pending") {
      return "duplicate-pending";
    }
    if (existing === "accepted") {
      return "duplicate-accepted";
    }
  } catch {
    // Duplicate check is best-effort only
  }

  const invRef = doc(collection(db, "teamInvitations"));
  await setDoc(invRef, {
    teamId,
    teamName,
    invitedEmail,
    role,
    status: "pending",
    createdBy,
    inviterName: inviterName || "A builder",
    createdAt: serverTimestamp(),
  });
  return invRef.id;
}

// Fetch pending invitations addressed to an email address
export async function getUserPendingInvitations(
  email: string
): Promise<TeamInvitation[]> {
  if (!email) return [];
  try {
    const invQuery = query(
      collection(db, "teamInvitations"),
      where("invitedEmail", "==", email)
    );
    const snap = await getDocs(invQuery);
    const invitations: TeamInvitation[] = [];
    snap.forEach((d) => {
      const data = d.data();
      if (data?.status === "pending") {
        invitations.push({ id: d.id, ...data } as TeamInvitation);
      }
    });
    return invitations;
  } catch (error) {
    console.error("Error fetching pending invitations:", error);
    return [];
  }
}

// Fetch pending invitations for a team
export async function getTeamPendingInvitations(
  teamId: string
): Promise<TeamInvitation[]> {
  if (!teamId) return [];
  try {
    const invQuery = query(
      collection(db, "teamInvitations"),
      where("teamId", "==", teamId)
    );
    const snap = await getDocs(invQuery);
    const invitations: TeamInvitation[] = [];
    snap.forEach((d) => {
      const data = d.data();
      if (data?.status === "pending") {
        invitations.push({ id: d.id, ...data } as TeamInvitation);
      }
    });
    return invitations;
  } catch (error) {
    console.error("Error fetching team invitations:", error);
    return [];
  }
}

// Update an invitation status (accepted / rejected)
export async function setInvitationStatus(
  invitationId: string,
  status: "accepted" | "rejected"
): Promise<void> {
  try {
    await updateDoc(doc(db, "teamInvitations", invitationId), {
      status,
      respondedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating invitation status:", error);
  }
}

// Look up a registered user's UID by their email (users are publicly readable)
export async function findUserUidByEmail(
  email: string
): Promise<string | null> {
  if (!email) return null;
  try {
    const userQuery = query(collection(db, "users"), where("email", "==", email));
    const snap = await getDocs(userQuery);
    let uid: string | null = null;
    snap.forEach((d) => {
      if (!uid) uid = d.id;
    });
    return uid;
  } catch (error) {
    console.warn("Could not lookup user by email:", error);
    return null;
  }
}

// Accept an invitation: join the team roster, bookmark under the user, mark accepted
export async function acceptTeamInvitation(
  invitation: TeamInvitation,
  uid: string,
  displayName?: string,
  photoURL?: string
): Promise<void> {
  await Promise.all([
    setDoc(
      doc(db, "teams", invitation.teamId, "members", uid),
      {
        role: invitation.role || "member",
        displayName: displayName || "Builder",
        email: invitation.invitedEmail,
        photoURL: photoURL || "",
        joinedAt: serverTimestamp(),
      },
      { merge: true }
    ),
    setDoc(
      doc(db, "users", uid, "teams", invitation.teamId),
      {
        teamId: invitation.teamId,
        name: invitation.teamName,
        role: invitation.role || "member",
        joinedAt: serverTimestamp(),
      },
      { merge: true }
    ),
    setInvitationStatus(invitation.id, "accepted"),
  ]);
}
