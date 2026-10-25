"use client";

import { useState, useEffect } from "react";
import WorkspaceSidebar from "./components/WorkspaceSidebar";
import WorkspaceHeader from "./components/WorkspaceHeader";
import WorkspaceContent from "./components/WorkspaceContent";
import TeamsManager from "./components/TeamsManager";
import NotificationsManager from "./components/NotificationsManager";
import SettingsManager from "./components/SettingsManager";
import AddHackathonModal, { HackathonRecord } from "./components/AddHackathonModal";
import { Team, getUserTeams } from "../../lib/firebase/teams";
import {
  saveHackathonRecord,
  getUserHackathonRecords,
  deleteHackathonRecord,
} from "../../lib/firebase/hackathons";
import { useAuth } from "../../lib/auth/AuthContext";
import { createUserNotification } from "../../lib/firebase/notifications";

// Thresholds (in days) at which a deadline reminder email is dispatched
const REMINDER_THRESHOLDS = [7, 3, 1];

export default function WorkspacePage() {
  const { user, userProfile } = useAuth();
  const [currentTab, setCurrentTab] = useState("overview");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingHackathon, setEditingHackathon] = useState<HackathonRecord | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [hackathons, setHackathons] = useState<HackathonRecord[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [activeTeam, setActiveTeam] = useState<Team | null>(null);

  const hacksKey = user?.uid ? `hh_hacks_${user.uid}` : "hh_hacks_guest";
  const teamsKey = user?.uid ? `hh_teams_${user.uid}` : "hh_teams_guest";
  const activeTeamKey = user?.uid ? `hh_active_team_${user.uid}` : "hh_active_team_guest";

  // 1. Initial immediate restore from local storage so page refresh NEVER vanishes data
  useEffect(() => {
    try {
      const cachedHacks = localStorage.getItem(hacksKey);
      if (cachedHacks) {
        const parsed = JSON.parse(cachedHacks);
        if (Array.isArray(parsed)) setHackathons(parsed);
      }

      const cachedTeams = localStorage.getItem(teamsKey);
      if (cachedTeams) {
        const parsedTeams = JSON.parse(cachedTeams);
        if (Array.isArray(parsedTeams) && parsedTeams.length > 0) {
          setTeams(parsedTeams);
          const cachedActiveTeamId = localStorage.getItem(activeTeamKey);
          const found = parsedTeams.find((t: Team) => t.id === cachedActiveTeamId);
          setActiveTeam(found || parsedTeams[0] || null);
        }
      }
    } catch {
      // ignore
    }
  }, [hacksKey, teamsKey, activeTeamKey]);

  // 2. Cloud synchronization with Firestore
  useEffect(() => {
    if (!user?.uid) return;
    const currentUid = user.uid;

    let isMounted = true;

    async function syncFromFirestore() {
      try {
        const [cloudHacks, cloudTeams] = await Promise.all([
          getUserHackathonRecords(currentUid),
          getUserTeams(currentUid),
        ]);

        if (!isMounted) return;

        if (cloudHacks && cloudHacks.length > 0) {
          setHackathons((prev) => {
            const mergedMap = new Map<string, HackathonRecord>();
            cloudHacks.forEach((h) => mergedMap.set(h.id, h));
            prev.forEach((h) => {
              if (!mergedMap.has(h.id)) mergedMap.set(h.id, h);
            });
            const merged = Array.from(mergedMap.values());
            try {
              localStorage.setItem(hacksKey, JSON.stringify(merged));
            } catch {}
            return merged;
          });
        }

        if (cloudTeams && cloudTeams.length > 0) {
          setTeams((prev) => {
            const mergedMap = new Map<string, Team>();
            cloudTeams.forEach((t) => mergedMap.set(t.id, t));
            prev.forEach((t) => {
              if (!mergedMap.has(t.id)) mergedMap.set(t.id, t);
            });
            const merged = Array.from(mergedMap.values());
            try {
              localStorage.setItem(teamsKey, JSON.stringify(merged));
            } catch {}
            return merged;
          });

          setActiveTeam((prev) => {
            if (prev) return prev;
            return cloudTeams[0];
          });
        }
      } catch (err) {
        console.warn("Firestore sync warning:", err);
      }
    }

    syncFromFirestore();

    return () => {
      isMounted = false;
    };
  }, [user?.uid, hacksKey, teamsKey]);

  // 3. Automatic email reminders: when a tracked hackathon's deadline is
  // 7, 3 or 1 days away, dispatch an email (respects notification preferences
  // and never sends the same reminder twice via a localStorage idempotency key).
  useEffect(() => {
    if (!user?.uid || hackathons.length === 0) return;

    const prefs = userProfile?.notificationPreferences;
    if (
      prefs &&
      prefs.emailReminders === false &&
      prefs.deadlineAlerts === false
    ) {
      return;
    }

    const dispatchDueReminders = async () => {
      for (const hack of hackathons) {
        const days = Number(hack.remainingDays);
        const status = (hack.status || "").toLowerCase();

        if (!REMINDER_THRESHOLDS.includes(days)) continue;
        if (status === "cancelled" || status === "completed") continue;

        const dedupeKey = `hh_reminder_${user.uid}_${hack.id}_${days}`;
        try {
          if (localStorage.getItem(dedupeKey)) continue;
        } catch {}

        try {
          const res = await fetch("/api/reminders", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: user.email || "",
              name:
                userProfile?.displayName ||
                user.displayName ||
                (user.email ? user.email.split("@")[0] : "Builder"),
              hackathonName: hack.name,
              deadlineText: hack.deadlineText || hack.dates,
              daysLeft: days,
            }),
          });

          if (res.ok) {
            try {
              localStorage.setItem(dedupeKey, "1");
            } catch {}
            try {
              await createUserNotification(user.uid, {
                type: "deadline",
                title: `Reminder sent: ${hack.name}`,
                message: `An email reminder was dispatched for the ${hack.name} deadline in ${days} day${days === 1 ? "" : "s"}.`,
              });
            } catch {}
          }
        } catch (err) {
          console.warn("Reminder dispatch failed:", err);
        }
      }
    };

    dispatchDueReminders();
  }, [user?.uid, userProfile?.notificationPreferences, hackathons]);

  const handleOpenAddModal = () => {
    setEditingHackathon(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (hack: HackathonRecord) => {
    setEditingHackathon(hack);
    setIsAddModalOpen(true);
  };

  const handleSaveHackathon = async (record: HackathonRecord) => {
    const updated = (() => {
      const idx = hackathons.findIndex((h) => h.id === record.id);
      if (idx !== -1) {
        const copy = [...hackathons];
        copy[idx] = record;
        return copy;
      }
      return [record, ...hackathons];
    })();

    setHackathons(updated);
    try {
      localStorage.setItem(hacksKey, JSON.stringify(updated));
    } catch {}

    // Cloud Firestore persistence
    if (user?.uid) {
      await saveHackathonRecord(user.uid, record);
    }
  };

  const handleDeleteHackathon = async (id: string) => {
    const updated = hackathons.filter((h) => h.id !== id);
    setHackathons(updated);
    try {
      localStorage.setItem(hacksKey, JSON.stringify(updated));
    } catch {}

    // Cloud Firestore deletion
    if (user?.uid) {
      await deleteHackathonRecord(user.uid, id);
    }
  };

  const handleTeamCreated = (newTeam: Team) => {
    setTeams((prev) => {
      const updated = [...prev, newTeam];
      try {
        localStorage.setItem(teamsKey, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    setActiveTeam(newTeam);
    try {
      localStorage.setItem(activeTeamKey, newTeam.id);
    } catch {}
  };

  const handleSetActiveTeam = (team: Team) => {
    setActiveTeam(team);
    try {
      localStorage.setItem(activeTeamKey, team.id);
    } catch {}
  };

  return (
    <div className="min-h-screen bg-background text-on-surface flex">
      {/* Fixed Left Sidebar */}
      <WorkspaceSidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        mobileOpen={mobileSidebarOpen}
        setMobileOpen={setMobileSidebarOpen}
        activeTeamName={activeTeam ? activeTeam.name : "No Team Selected"}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* Fixed Header */}
        <WorkspaceHeader
          onOpenAddModal={handleOpenAddModal}
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        {/* Dashboard Body */}
        <main className="pt-20 px-4 sm:px-6 lg:px-8 pb-12 max-w-7xl mx-auto w-full">
          {currentTab === "overview" && (
            <WorkspaceContent
              onOpenAddModal={handleOpenAddModal}
              onEditHackathon={handleOpenEditModal}
              hackathons={hackathons}
              searchQuery={searchQuery}
              teamsCount={teams.length}
            />
          )}

          {currentTab === "my-teams" && (
            <TeamsManager
              teams={teams}
              onTeamCreated={handleTeamCreated}
              activeTeam={activeTeam}
              setActiveTeam={handleSetActiveTeam}
            />
          )}

          {currentTab === "hackathon-tracker" && (
            <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto">
              <div className="flex items-center justify-between pb-4 border-b border-outline-variant/20">
                <div>
                  <h1 className="text-2xl font-bold text-on-surface">
                    Competition Vault &amp; Results
                  </h1>
                  <p className="text-sm text-outline">
                    Searchable archive of all submitted hacks, repos, demos, and podium placements.
                  </p>
                </div>
                <button
                  onClick={handleOpenAddModal}
                  className="px-3.5 py-1.5 rounded-xl bg-primary-container text-on-primary-container text-xs font-semibold cursor-pointer hover:bg-primary hover:text-on-primary transition-all flex items-center gap-1.5 shadow-[0_0_12px_rgba(160,120,255,0.4)]"
                >
                  <span className="material-symbols-outlined text-sm">add</span>
                  <span>Log Hackathon</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30 text-center">
                  <span className="block text-2xl font-bold text-on-surface">
                    {hackathons.length}
                  </span>
                  <span className="text-xs text-outline font-mono">Total Tracked</span>
                </div>
                <div className="p-4 rounded-xl bg-surface-container-low border border-secondary/40 text-center">
                  <span className="block text-2xl font-bold text-secondary">
                    {hackathons.filter(h => h.status.includes("Winner") || h.status.includes("Podium")).length}x
                  </span>
                  <span className="text-xs text-secondary font-mono">Podium Finishes</span>
                </div>
                <div className="p-4 rounded-xl bg-surface-container-low border border-primary/40 text-center">
                  <span className="block text-2xl font-bold text-primary">$0</span>
                  <span className="text-xs text-primary font-mono">Grants Awarded</span>
                </div>
              </div>

              {/* Hackathons Table Preview */}
              <div className="p-6 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-outline">
                    Competition Records ({hackathons.length})
                  </h3>
                  <span className="text-[11px] font-mono text-outline">Click &quot;Update&quot; to change status or details</span>
                </div>
                {hackathons.length > 0 ? (
                  <div className="divide-y divide-outline-variant/20">
                    {hackathons.map((h) => (
                      <div
                        key={h.id}
                        className="py-3.5 flex items-center justify-between gap-4 first:pt-0 last:pb-0"
                      >
                        <div className="flex flex-col">
                          <span className="font-semibold text-sm text-on-surface">
                            {h.name}
                          </span>
                          <span className="text-xs text-outline font-mono">
                            {h.organizer} • {h.dates}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded-full font-mono text-[11px] font-bold bg-surface-container text-secondary border border-outline-variant/30">
                            {h.status}
                          </span>
                          <button
                            onClick={() => handleOpenEditModal(h)}
                            className="px-2.5 py-1 rounded-lg bg-surface-container-high text-primary hover:bg-primary hover:text-on-primary text-xs font-mono font-medium transition-colors flex items-center gap-1 cursor-pointer"
                            title="Update hackathon record"
                          >
                            <span className="material-symbols-outlined text-xs">edit</span>
                            <span>Update</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-outline text-xs">
                    No hackathons recorded yet. Click &quot;+ Log Hackathon&quot; to add your first record.
                  </div>
                )}
              </div>
            </div>
          )}

          {currentTab === "calendar" && (
            <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto">
              <div className="pb-4 border-b border-outline-variant/20">
                <h1 className="text-2xl font-bold text-on-surface">
                  Master Sprint Timeline
                </h1>
                <p className="text-sm text-outline">
                  Synchronized schedule for all team registration cutoffs and hacking sprints.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm font-bold text-primary">
                    Sprint Timeline
                  </span>
                  <span className="text-xs text-outline font-mono">Real-time local schedule</span>
                </div>
                {hackathons.length > 0 ? (
                  <div className="flex flex-col gap-3">
                    {hackathons.map((h, i) => (
                      <div
                        key={i}
                        className="p-4 rounded-xl bg-surface-container border border-outline-variant/30 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <span className="material-symbols-outlined text-secondary">
                            event
                          </span>
                          <div>
                            <div className="text-sm font-bold text-on-surface">
                              {h.name}
                            </div>
                            <div className="text-xs text-outline font-mono">
                              {h.dates}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-secondary font-mono font-medium">
                            {h.remainingDays} days away
                          </span>
                          <button
                            onClick={() => handleOpenEditModal(h)}
                            className="p-1 rounded text-outline hover:text-primary hover:bg-surface-container-high transition-colors cursor-pointer"
                            title="Update schedule"
                          >
                            <span className="material-symbols-outlined text-sm">edit</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 text-outline text-xs">
                    No scheduled hackathons found. When you add hackathons, their dates and cutoffs will appear here.
                  </div>
                )}
              </div>
            </div>
          )}

          {currentTab === "notifications" && <NotificationsManager />}

          {currentTab === "achievements" && (
            <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto">
              <div className="pb-4 border-b border-outline-variant/20">
                <h1 className="text-2xl font-bold text-on-surface">
                  Hall of Trophies &amp; Credentials
                </h1>
                <p className="text-sm text-outline">
                  Verified badges, winner certificates, and open-source bounties earned by your team.
                </p>
              </div>

              <div className="p-8 rounded-2xl bg-surface-container-low border border-dashed border-outline-variant/30 text-center">
                <span className="material-symbols-outlined text-4xl text-outline mb-2">
                  military_tech
                </span>
                <h3 className="text-base font-bold text-on-surface mb-1">
                  No Trophies Recorded Yet
                </h3>
                <p className="text-xs text-outline max-w-sm mx-auto mb-4">
                  Complete hackathon sprints and log podium finishes to display your squad&apos;s verified credentials here.
                </p>
                <button
                  onClick={handleOpenAddModal}
                  className="px-4 py-2 rounded-xl bg-primary-container text-on-primary-container text-xs font-semibold cursor-pointer hover:bg-primary hover:text-on-primary transition-all"
                >
                  Log Hackathon Outcome
                </button>
              </div>
            </div>
          )}

          {currentTab === "settings" && <SettingsManager />}
        </main>
      </div>

      {/* Add / Edit Hackathon Modal */}
      <AddHackathonModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleSaveHackathon}
        onDelete={handleDeleteHackathon}
        initialData={editingHackathon}
        activeTeamName={activeTeam ? activeTeam.name : "Solo Squad"}
      />
    </div>
  );
}
