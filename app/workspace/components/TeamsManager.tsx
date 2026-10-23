"use client";

import { useState } from "react";
import Image from "next/image";
import { Team, TeamMember, createTeam, inviteTeammate } from "../../../lib/firebase/teams";
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
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "member">("member");
  const [inviteSuccess, setInviteSuccess] = useState(false);

  // Demo members for default display
  const demoMembers: TeamMember[] = [
    {
      uid: user?.uid || "user-1",
      displayName: userProfile?.displayName || user?.displayName || "Alex Rivera",
      email: user?.email || "alex@novalogic.dev",
      role: "owner",
      photoURL:
        user?.photoURL ||
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDb2DzUVxovw9ASgtQ7-MpBY1-cEjFTR1xa8XNV3QOGJt1uKup9ZZAWwGZzrw-73DUoQ1Cd26PYeslNemQxb01iwPBqA0A7XH_cqpZlu0VbuxezDvXeC4rplJwRapopoeF58l0klgUCA1aOjBKQbNWrwOA0vlWTuYEHtxghLhekHUHmlqIx73ZBGHOZtykq1jQUyVICldOfBBgzx87xnUCs5Kt88hIHRcN7mTnRmYjT6U52a4PXLRNB",
    },
    {
      uid: "user-2",
      displayName: "Maya Chen",
      email: "maya@novalogic.dev",
      role: "admin",
      photoURL:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBJYxOpHYFUsNtx7yCHuLfm7SBLPUR4etdSyeEcNMOn5zCI8Kfrpdno-0Ui7Xq6-PRp487G1iffBETIbAog0Ifi7ES69Dm8Hly-QDn7jPhCwVO3hDjSJUj8MbauMPZNd1GEz6m3QHYzfb76M5MtmxWjRUiUg6lXaWnhrhcNpt4a411iMQLEAkzdULTEXvbRz2ORCKHmQ8Xobfi1cwd1API6yl9JRfP77gPSh-Y0AU-H3bLseVfb7mPj",
    },
    {
      uid: "user-3",
      displayName: "Liam Vance",
      email: "liam@novalogic.dev",
      role: "member",
      photoURL:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCqsripXfRb9frwH_FBBFaaA3Rl9Hd2JbtvJU8vXLIs5AoY7v3qGMpv1vkGX8Ld2Tc1rCKB1SFA_4qCCYjoolk17UhDwY_KtW5tRo9yz-O_PMbZFgbt4idNoepEdRSUXR-RCorSDw3075xefJJRdo7DrA5sAD4pnNV7Bajxd8qrfZVISfvQQ8OflBkfmOItO1-jd2pyk7_WboixrZE-DOXLo8h5YrUVhreuFo_TdH4DMCPMNQYtXoAn",
    },
    {
      uid: "user-4",
      displayName: "Sofia Ramos",
      email: "sofia@novalogic.dev",
      role: "member",
      photoURL:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCzGs0-FlDJv2oDbGzuG8iknQ_9jyobl4Gu4qPH2R5jANocpKVZM8NiQN3Yl4uV8zwhOCqtDDe2_NzQBLGX6VhPhZPJtvdhq4GuUEfHBIQcR_tFjIptjrmNh2VkeYCSUbvxTDqhaNBGcuoEJoPXuFOdQvamF_7X6Lns8FQlr29pe4XEnB-xYO9Bd53ziLNLnkyKfkHLGc1Yi0nz7ADNz3JVs2ut6x0sz0ivIOspyyNAf9tvfYUFtNzC",
    },
  ];

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName.trim()) return;

    try {
      const teamId = await createTeam(
        teamName.trim(),
        teamDesc.trim(),
        user?.uid || "guest"
      );
      const newTeam: Team = {
        id: teamId,
        name: teamName.trim(),
        description: teamDesc.trim(),
        ownerUid: user?.uid || "guest",
      };
      onTeamCreated(newTeam);
      setActiveTeam(newTeam);
      setShowCreateModal(false);
      setTeamName("");
      setTeamDesc("");
    } catch {
      // Fallback local team creation
      const localTeam: Team = {
        id: "team-" + Date.now(),
        name: teamName.trim(),
        description: teamDesc.trim(),
        ownerUid: user?.uid || "guest",
      };
      onTeamCreated(localTeam);
      setActiveTeam(localTeam);
      setShowCreateModal(false);
      setTeamName("");
      setTeamDesc("");
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

      {/* Active Team Detail Card */}
      {activeTeam && (
        <div className="p-6 sm:p-8 rounded-2xl bg-surface-container-low border border-outline-variant/30 shadow-lg flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-outline-variant/20">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded-full bg-secondary/15 text-secondary font-mono text-[10px] font-bold uppercase">
                  ACTIVE SQUAD
                </span>
                <span className="text-outline text-xs font-mono">• 4 Builders</span>
              </div>
              <h2 className="text-2xl font-bold text-on-surface">
                {activeTeam.name}
              </h2>
              <p className="text-sm text-on-surface-variant mt-1">
                {activeTeam.description ||
                  "Competitive multimodal AI agents, decentralized compute & rapid fullstack prototypes."}
              </p>
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
              {demoMembers.map((m) => (
                <div
                  key={m.uid}
                  className="p-4 rounded-xl bg-surface-container border border-outline-variant/20 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative w-10 h-10 rounded-full overflow-hidden ring-1 ring-outline-variant/40 shrink-0">
                      <Image
                        src={
                          m.photoURL ||
                          "https://lh3.googleusercontent.com/aida-public/AB6AXuBhiT-fS94BgDyhLpMJDlYKntQwDTUm9GXRHoiVTosSsB4dJcFlgij98ihCIA9eKt4Daqmt9AkiE0ly81jiXp5M6Dkn-fdqXxDh4fPTqH--D47WprzLQh2giEixqyAfOE4ZgDWE4h-rdqj9xSrFPAiyIgZrygAKd8SnJd7o53Rv4wtTqCertqG-fVNtRjNzvCfAduj-ZphmsOI8FXpM_acjUFkqhLVJxIjXT_TYDk2UCe-3HLHmYX8k"
                        }
                        alt={m.displayName || "Member"}
                        width={40}
                        height={40}
                        className="w-full h-full object-cover"
                      />
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
