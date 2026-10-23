"use client";

import { useState } from "react";
import WorkspaceSidebar from "./components/WorkspaceSidebar";
import WorkspaceHeader from "./components/WorkspaceHeader";
import WorkspaceContent from "./components/WorkspaceContent";
import TeamsManager from "./components/TeamsManager";
import NotificationsManager from "./components/NotificationsManager";
import SettingsManager from "./components/SettingsManager";
import AddHackathonModal, { HackathonRecord } from "./components/AddHackathonModal";
import { Team } from "../../lib/firebase/teams";

const initialHackathons: HackathonRecord[] = [
  {
    id: "hack-1",
    name: "Buildspace AI Sprint 2025",
    organizer: "Buildspace",
    mode: "Online / Global",
    status: "Registered & Ready",
    statusType: "urgent",
    dates: "Nov 15 - Nov 17, 2025",
    remainingDays: 2,
    deadlineText: "Registration closes today, 23:59 UTC",
    description:
      "Constructing autonomous multi-modal agent workflows integrated with local small language models and decentralized storage relays.",
    teamName: "NovaLogic Squad",
    teamCount: "4/4",
    tags: ["LLMs", "FullStack", "MultiModal"],
  },
  {
    id: "hack-2",
    name: "DevForge Global Challenge",
    organizer: "DevForge & AWS",
    mode: "Hybrid (San Francisco + Virtual)",
    status: "Team Forming (3/4)",
    statusType: "forming",
    dates: "Dec 01 - Dec 05, 2025",
    remainingDays: 16,
    deadlineText: "Deadline: Nov 26, 2025",
    description:
      "High-throughput event sourcing architectures and zero-knowledge identity integration for next-gen fintech rails.",
    teamName: "NovaLogic Squad",
    teamCount: "3/4",
    tags: ["Rust", "FinTech", "AWS", "ZK"],
  },
  {
    id: "hack-3",
    name: "ETHGlobal Synthesis",
    organizer: "ETHGlobal",
    mode: "Online",
    status: "Idea Brainstorming",
    statusType: "idea",
    dates: "Dec 12 - Dec 14, 2025",
    remainingDays: 27,
    deadlineText: "Dec 12 - Dec 14, 2025",
    description:
      "Exploring modular state sync, cryptographic proof aggregation, and decentralized AI verifier networks.",
    teamName: "NovaLogic Squad",
    teamCount: "2/4",
    tags: ["Web3", "Ethereum", "Solidity"],
  },
];

const defaultTeams: Team[] = [
  {
    id: "team-novalogic",
    name: "NovaLogic Squad",
    description:
      "Multimodal AI agents, zero-knowledge decentralized compute & rapid fullstack prototyping.",
    ownerUid: "alex_rivera",
  },
  {
    id: "team-synthlabs",
    name: "SynthLabs",
    description:
      "High throughput financial infrastructure, smart contracts and automated market makers.",
    ownerUid: "alex_rivera",
  },
];

export default function WorkspacePage() {
  const [currentTab, setCurrentTab] = useState("overview");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [hackathons, setHackathons] = useState<HackathonRecord[]>(initialHackathons);
  const [teams, setTeams] = useState<Team[]>(defaultTeams);
  const [activeTeam, setActiveTeam] = useState<Team>(defaultTeams[0]);

  const handleAddHackathon = (newHack: HackathonRecord) => {
    setHackathons((prev) => [newHack, ...prev]);
  };

  const handleTeamCreated = (newTeam: Team) => {
    setTeams((prev) => [...prev, newTeam]);
  };

  return (
    <div className="min-h-screen bg-background text-on-surface flex">
      {/* Fixed Left Sidebar */}
      <WorkspaceSidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        mobileOpen={mobileSidebarOpen}
        setMobileOpen={setMobileSidebarOpen}
        activeTeamName={activeTeam?.name}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* Fixed Header */}
        <WorkspaceHeader
          onOpenAddModal={() => setIsAddModalOpen(true)}
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        {/* Dashboard Body */}
        <main className="pt-20 px-4 sm:px-6 lg:px-8 pb-12 max-w-7xl mx-auto w-full">
          {currentTab === "overview" && (
            <WorkspaceContent
              onOpenAddModal={() => setIsAddModalOpen(true)}
              hackathons={hackathons}
              searchQuery={searchQuery}
            />
          )}

          {currentTab === "my-teams" && (
            <TeamsManager
              teams={teams}
              onTeamCreated={handleTeamCreated}
              activeTeam={activeTeam}
              setActiveTeam={setActiveTeam}
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
                  onClick={() => setIsAddModalOpen(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-primary-container text-on-primary-container text-xs font-semibold"
                >
                  + Log Past Hackathon
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30 text-center">
                  <span className="block text-2xl font-bold text-on-surface">14</span>
                  <span className="text-xs text-outline font-mono">Total Submissions</span>
                </div>
                <div className="p-4 rounded-xl bg-surface-container-low border border-secondary/40 text-center">
                  <span className="block text-2xl font-bold text-secondary">6x</span>
                  <span className="text-xs text-secondary font-mono">Podium Finishes</span>
                </div>
                <div className="p-4 rounded-xl bg-surface-container-low border border-primary/40 text-center">
                  <span className="block text-2xl font-bold text-primary">$45,000</span>
                  <span className="text-xs text-primary font-mono">Grants Awarded</span>
                </div>
              </div>

              {/* Hackathons Table Preview */}
              <div className="p-6 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex flex-col gap-4">
                <h3 className="text-xs font-mono uppercase tracking-wider text-outline">
                  Verified Competition Records
                </h3>
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
                      <span className="px-2.5 py-1 rounded-full font-mono text-[11px] font-bold bg-surface-container text-secondary border border-outline-variant/30">
                        {h.status}
                      </span>
                    </div>
                  ))}
                </div>
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
                    November - December 2025
                  </span>
                  <span className="text-xs text-outline font-mono">Local Timezone: UTC+5:30</span>
                </div>
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
                      <span className="text-xs text-secondary font-mono font-medium">
                        {h.remainingDays} days away
                      </span>
                    </div>
                  ))}
                </div>
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-surface-container-low border border-secondary/40 shadow-md flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-secondary/15 text-secondary flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-3xl">
                      military_tech
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-secondary font-bold">
                      1st Place Winner
                    </span>
                    <h3 className="text-base font-bold text-on-surface">
                      Global Open Source Hack 2024
                    </h3>
                    <p className="text-xs text-outline mt-1">
                      Project HyperAgent: Autonomous Edge Mesh ($20,000 Grand Prize)
                    </p>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-surface-container-low border border-primary/40 shadow-md flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-3xl">
                      workspace_premium
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-primary font-bold">
                      Finalist Podium
                    </span>
                    <h3 className="text-base font-bold text-on-surface">
                      ETHGlobal New York 2024
                    </h3>
                    <p className="text-xs text-outline mt-1">
                      Zero-Knowledge State Proof Aggregator ($15,000 Bounty)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentTab === "settings" && <SettingsManager />}
        </main>
      </div>

      {/* Add Hackathon Modal */}
      <AddHackathonModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddHackathon}
      />
    </div>
  );
}
