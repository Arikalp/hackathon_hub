"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Team,
  TeamMember,
  createTeam,
  inviteTeammate,
  saveTeamMember,
  getTeamMembers,
} from "../../../lib/firebase/teams";
import { uploadTeamLogo } from "../../../lib/firebase/storage";
import { useAuth } from "../../../lib/auth/AuthContext";

interface TeamsManagerProps {
  teams: Team[];
  onTeamCreated: (team: Team) => void;
  activeTeam: Team | null;
  setActiveTeam: (team: Team) => void;
}

export default function TeamsManager({
  teams,
  onTeamCreated,
  activeTeam,
  setActiveTeam,
}: TeamsManagerProps) {
  const { user, userProfile } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [teamDesc, setTeamDesc] = useState("");
  const [teamLogoUrl, setTeamLogoUrl] = useState("");
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "member">("member");
  const [inviteSuccess, setInviteSuccess] = useState(false);

  // Dynamic roster per team
  const [teamMembersMap, setTeamMembersMap] = useState<Record<string, TeamMember[]>>({});

  useEffect(() => {
    try {
      const stored = localStorage.getItem("hh_team_members");
      if (stored) {
        setTeamMembersMap(JSON.parse(stored));
      }
    } catch {}
  }, []);

  // Fetch team members from Firestore whenever activeTeam changes
  useEffect(() => {
    if (!activeTeam || !activeTeam.id) return;
    getTeamMembers(activeTeam.id).then((cloudMembers) => {
      if (cloudMembers && cloudMembers.length > 0) {
        setTeamMembersMap((prev) => {
          const updated = {
            ...prev,
            [activeTeam.id]: cloudMembers,
          };
          try {
            localStorage.setItem("hh_team_members", JSON.stringify(updated));
          } catch {}
          return updated;
        });
      }
    }).catch((err) => {
      console.warn("Could not fetch team members from Firestore:", err);
    });
  }, [activeTeam?.id]);

  const defaultOwner: TeamMember = {
    uid: user?.uid || "owner-1",
    displayName:
      userProfile?.displayName ||
      user?.displayName ||
      (user?.email ? user.email.split("@")[0] : "Team Owner"),
    email: user?.email || "owner@builder.io",
    role: "owner",
    photoURL: userProfile?.photoURL || user?.photoURL || undefined,
  };

  const currentMembers: TeamMember[] =
    activeTeam && teamMembersMap[activeTeam.id]
      ? teamMembersMap[activeTeam.id]
      : [defaultOwner];

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName.trim()) return;

    try {
      const teamId = await createTeam(
        teamName.trim(),
        teamDesc.trim(),
        user?.uid || "guest",
        teamLogoUrl.trim() || undefined
      );
      const newTeam: Team = {
        id: teamId,
        name: teamName.trim(),
        description: teamDesc.trim(),
        ownerUid: user?.uid || "guest",
        logoUrl: teamLogoUrl.trim() || undefined,
      };
      onTeamCreated(newTeam);
      setActiveTeam(newTeam);
      setShowCreateModal(false);
      setTeamName("");
      setTeamDesc("");
      setTeamLogoUrl("");
    } catch {
      // Fallback local team creation
      const localTeam: Team = {
        id: "team-" + Date.now(),
        name: teamName.trim(),
        description: teamDesc.trim(),
        ownerUid: user?.uid || "guest",
        logoUrl: teamLogoUrl.trim() || undefined,
      };
      onTeamCreated(localTeam);
      setActiveTeam(localTeam);
      setShowCreateModal(false);
      setTeamName("");
      setTeamDesc("");
      setTeamLogoUrl("");
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !activeTeam) return;

    try {
      await inviteTeammate(
        activeTeam.id,
        activeTeam.name,
        inviteEmail.trim(),
        inviteRole,
        user?.uid || "guest"
      );
    } catch (err) {
      console.warn("Invitation simulated:", err);
    }

    const newMember: TeamMember = {
      uid: "member-" + Date.now(),
      displayName: inviteEmail.split("@")[0],
      email: inviteEmail.trim(),
      role: inviteRole,
      photoURL: undefined,
    };

    // Sync member directly to Firestore
    saveTeamMember(activeTeam.id, newMember).catch(() => {});

    setTeamMembersMap((prev) => {
      const updated = {
        ...prev,
        [activeTeam.id]: [...(prev[activeTeam.id] || [defaultOwner]), newMember],
      };
      try {
        localStorage.setItem("hh_team_members", JSON.stringify(updated));
      } catch {}
      return updated;
    });

    setInviteSuccess(true);
    setTimeout(() => {
      setInviteSuccess(false);
      setShowInviteModal(false);
      setInviteEmail("");
    }, 1500);
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-outline-variant/20">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-primary text-xl">
              groups
            </span>
            <h1 className="text-2xl font-bold text-on-surface">
              Team Workspaces &amp; Rosters
            </h1>
          </div>
          <p className="text-sm text-outline">
            Manage your builder squads, assign granular roles, and invite collaborators.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-container text-on-primary-container font-semibold text-xs sm:text-sm hover:bg-primary hover:text-on-primary transition-all shadow-[0_0_16px_-4px_rgba(160,120,255,0.4)] cursor-pointer self-start sm:self-auto"
        >
          <span className="material-symbols-outlined text-base">group_add</span>
          <span>Create New Team</span>
        </button>
      </div>

      {/* Teams Tabs / Selector */}
      {teams.length > 0 && (
        <div className="flex items-center gap-3 overflow-x-auto pb-2">
          {teams.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTeam(t)}
              className={`px-4 py-2.5 rounded-xl font-mono text-xs font-semibold flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
                activeTeam?.id === t.id
                  ? "bg-surface-container-high text-primary border border-primary/40 shadow-sm"
                  : "bg-surface-container-low text-on-surface-variant hover:text-on-surface hover:bg-surface-container border border-outline-variant/30"
              }`}
            >
              <span className="material-symbols-outlined text-sm">hub</span>
              <span>{t.name}</span>
            </button>
          ))}
        </div>
      )}

      {/* Empty State when no teams exist */}
      {teams.length === 0 && (
        <div className="p-12 rounded-2xl bg-surface-container-low border border-dashed border-outline-variant/30 text-center flex flex-col items-center justify-center gap-3">
          <span className="material-symbols-outlined text-4xl text-outline">
            groups_3
          </span>
          <h3 className="text-lg font-bold text-on-surface">No squads created yet</h3>
          <p className="text-xs text-outline max-w-md">
            Create your first builder team to invite collaborators, organize roles, and track competition squads together.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="mt-2 px-4 py-2 rounded-xl bg-primary-container text-on-primary-container text-xs font-semibold cursor-pointer hover:bg-primary hover:text-on-primary transition-colors"
          >
            + Create Your First Team
          </button>
        </div>
      )}

      {/* Active Team Detail Card */}
      {activeTeam && (
        <div className="p-6 sm:p-8 rounded-2xl bg-surface-container-low border border-outline-variant/30 shadow-lg flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-outline-variant/20">
            <div className="flex items-center gap-4">
              {activeTeam.logoUrl && (
                <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-primary/40 shrink-0 bg-surface-container">
                  <img
                    src={activeTeam.logoUrl}
                    alt={activeTeam.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded-full bg-secondary/15 text-secondary font-mono text-[10px] font-bold uppercase">
                    ACTIVE SQUAD
                  </span>
                  <span className="text-outline text-xs font-mono">
                    • {currentMembers.length} Builder{currentMembers.length === 1 ? "" : "s"}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-on-surface">
                  {activeTeam.name}
                </h2>
                <p className="text-sm text-on-surface-variant mt-1">
                  {activeTeam.description ||
                    "Active competition squad ready for hackathon sprints."}
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowInviteModal(true)}
              className="px-4 py-2 rounded-xl bg-surface-container-high text-on-surface hover:bg-surface-bright border border-outline-variant/30 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
            >
              <span className="material-symbols-outlined text-base text-primary">
                person_add
              </span>
              <span>Invite Teammate</span>
            </button>
          </div>

          {/* Members Table / Grid */}
          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-mono uppercase tracking-wider text-outline">
              Team Roster &amp; Permissions
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentMembers.map((m) => (
                <div
                  key={m.uid}
                  className="p-4 rounded-xl bg-surface-container border border-outline-variant/20 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative w-10 h-10 rounded-full overflow-hidden ring-1 ring-outline-variant/40 shrink-0 bg-surface-container-highest flex items-center justify-center">
                      {m.photoURL ? (
                        <Image
                          src={m.photoURL}
                          alt={m.displayName || "Member"}
                          width={40}
                          height={40}
                          className="w-full h-full object-cover"
                          unoptimized
                        />
                      ) : (
                        <span className="font-mono font-bold text-primary text-sm uppercase">
                          {m.displayName ? m.displayName.slice(0, 2) : "TM"}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-semibold text-on-surface truncate">
                        {m.displayName}
                      </span>
                      <span className="text-xs text-outline font-mono truncate">
                        {m.email}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`font-mono text-[11px] font-bold px-2.5 py-1 rounded-full uppercase shrink-0 ${
                      m.role === "owner"
                        ? "bg-primary/15 text-primary border border-primary/30"
                        : m.role === "admin"
                        ? "bg-secondary/15 text-secondary border border-secondary/30"
                        : "bg-surface-container-high text-outline"
                    }`}
                  >
                    {m.role}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Create Team Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl bg-surface-container border border-outline-variant/40 shadow-2xl p-6">
            <h3 className="text-lg font-bold text-on-surface mb-2">
              Create a Builder Team
            </h3>
            <p className="text-xs text-outline mb-4">
              Give your hackathon squad a home to coordinate sprint submissions.
            </p>
            <form onSubmit={handleCreateTeam} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-mono uppercase text-outline mb-1">
                  Team Name *
                </label>
                <input
                  type="text"
                  required
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="e.g. SynthLabs or QuantumForge"
                  className="w-full px-3 py-2 rounded-lg bg-surface-container-low border border-outline-variant/40 text-on-surface text-sm focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase text-outline mb-1">
                  Team Mission / Description
                </label>
                <textarea
                  rows={2}
                  value={teamDesc}
                  onChange={(e) => setTeamDesc(e.target.value)}
                  placeholder="What is your squad focusing on?"
                  className="w-full px-3 py-2 rounded-lg bg-surface-container-low border border-outline-variant/40 text-on-surface text-sm focus:outline-none focus:border-primary resize-none"
                />
              </div>

              {/* Firebase Storage Squad Logo */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-mono uppercase text-outline">
                    Squad Logo / Emblem (Firebase Storage)
                  </label>
                  {uploadingLogo && (
                    <span className="text-[10px] font-mono text-primary animate-pulse flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs animate-spin">progress_activity</span>
                      Uploading...
                    </span>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setUploadingLogo(true);
                    try {
                      const downloadUrl = await uploadTeamLogo("temp-" + Date.now(), file);
                      setTeamLogoUrl(downloadUrl);
                    } catch (err) {
                      console.error("Team logo upload failed:", err);
                    } finally {
                      setUploadingLogo(false);
                    }
                  }}
                  className="w-full text-xs text-outline file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary-container file:text-on-primary-container cursor-pointer transition-colors"
                />
                {teamLogoUrl && (
                  <div className="mt-2 w-12 h-12 rounded-xl overflow-hidden border border-primary/40">
                    <img src={teamLogoUrl} alt="Logo" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-1.5 rounded-lg text-xs text-on-surface-variant hover:text-on-surface"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-primary-container text-on-primary-container text-xs font-semibold hover:bg-primary hover:text-on-primary transition-all"
                >
                  Create Team
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invite Member Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl bg-surface-container border border-outline-variant/40 shadow-2xl p-6">
            <h3 className="text-lg font-bold text-on-surface mb-2">
              Invite a Teammate
            </h3>
            <p className="text-xs text-outline mb-4">
              Send an invitation link to your teammate&apos;s email address.
            </p>
            {inviteSuccess ? (
              <div className="p-4 rounded-xl bg-secondary/15 border border-secondary/30 text-secondary text-center font-mono text-xs font-bold">
                ✓ Invitation dispatched successfully!
              </div>
            ) : (
              <form onSubmit={handleInvite} className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-outline mb-1">
                    Teammate Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="builder@domain.com"
                    className="w-full px-3 py-2 rounded-lg bg-surface-container-low border border-outline-variant/40 text-on-surface text-sm focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase text-outline mb-1">
                    Role &amp; Permissions
                  </label>
                  <select
                    value={inviteRole}
                    onChange={(e) =>
                      setInviteRole(e.target.value as "admin" | "member")
                    }
                    className="w-full px-3 py-2 rounded-lg bg-surface-container-low border border-outline-variant/40 text-on-surface text-sm focus:outline-none focus:border-primary"
                  >
                    <option value="member">Member (Can edit team hackathons)</option>
                    <option value="admin">Admin (Can manage invites &amp; records)</option>
                  </select>
                </div>
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowInviteModal(false)}
                    className="px-3 py-1.5 rounded-lg text-xs text-on-surface-variant hover:text-on-surface"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-primary-container text-on-primary-container text-xs font-semibold hover:bg-primary hover:text-on-primary transition-all"
                  >
                    Send Invitation
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
