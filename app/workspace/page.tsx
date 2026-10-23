"use client";

import { useState } from "react";
import WorkspaceSidebar from "./components/WorkspaceSidebar";
import WorkspaceHeader from "./components/WorkspaceHeader";
import WorkspaceContent from "./components/WorkspaceContent";
import AddHackathonModal, { HackathonRecord } from "./components/AddHackathonModal";

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
    teamName: "Team NovaLogic",
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
    teamName: "Team NovaLogic",
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
    teamName: "Team NovaLogic",
    teamCount: "2/4",
    tags: ["Web3", "Ethereum", "Solidity"],
  },
];

export default function WorkspacePage() {
  const [currentTab, setCurrentTab] = useState("overview");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [hackathons, setHackathons] = useState<HackathonRecord[]>(initialHackathons);

  const handleAddHackathon = (newHack: HackathonRecord) => {
    setHackathons((prev) => [newHack, ...prev]);
  };

  return (
    <div className="min-h-screen bg-background text-on-surface flex">
      {/* Fixed Left Sidebar */}
      <WorkspaceSidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        mobileOpen={mobileSidebarOpen}
        setMobileOpen={setMobileSidebarOpen}
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
            <div className="p-8 rounded-2xl bg-surface-container-low border border-outline-variant/30 text-center">
              <span className="material-symbols-outlined text-4xl text-primary mb-2">
                groups
              </span>
              <h2 className="text-xl font-bold text-on-surface mb-2">
                Team Rosters &amp; Builder Invites
              </h2>
              <p className="text-sm text-outline max-w-md mx-auto mb-4">
                Manage your active squad rosters, invite collaborators, and assign builder roles (Frontend, AI, Rust, UX).
              </p>
              <button
                onClick={() => setCurrentTab("overview")}
                className="px-4 py-2 rounded-xl bg-surface-container-high text-on-surface text-xs font-semibold"
              >
                Back to Overview
              </button>
            </div>
          )}

          {currentTab === "hackathon-tracker" && (
            <div className="p-8 rounded-2xl bg-surface-container-low border border-outline-variant/30 text-center">
              <span className="material-symbols-outlined text-4xl text-secondary mb-2">
                trophy
              </span>
              <h2 className="text-xl font-bold text-on-surface mb-2">
                Competition History &amp; Podiums
              </h2>
              <p className="text-sm text-outline max-w-md mx-auto mb-4">
                Review your 14 verified submissions, 6 podium wins, and devpost links.
              </p>
              <button
                onClick={() => setCurrentTab("overview")}
                className="px-4 py-2 rounded-xl bg-surface-container-high text-on-surface text-xs font-semibold"
              >
                Back to Overview
              </button>
            </div>
          )}

          {currentTab === "calendar" && (
            <div className="p-8 rounded-2xl bg-surface-container-low border border-outline-variant/30 text-center">
              <span className="material-symbols-outlined text-4xl text-tertiary mb-2">
                calendar_month
              </span>
              <h2 className="text-xl font-bold text-on-surface mb-2">
                Full Sprint Schedule
              </h2>
              <p className="text-sm text-outline max-w-md mx-auto mb-4">
                Interactive master calendar showing all registration cutoffs, hacking windows, and submission deadlines.
              </p>
              <button
                onClick={() => setCurrentTab("overview")}
                className="px-4 py-2 rounded-xl bg-surface-container-high text-on-surface text-xs font-semibold"
              >
                Back to Overview
              </button>
            </div>
          )}

          {currentTab === "notifications" && (
            <div className="p-8 rounded-2xl bg-surface-container-low border border-outline-variant/30 text-center">
              <span className="material-symbols-outlined text-4xl text-error mb-2">
                notifications_active
              </span>
              <h2 className="text-xl font-bold text-on-surface mb-2">
                Notification Feed
              </h2>
              <p className="text-sm text-outline max-w-md mx-auto mb-4">
                Critical deadline cutoffs, team member invitations, and webhook alerts.
              </p>
              <button
                onClick={() => setCurrentTab("overview")}
                className="px-4 py-2 rounded-xl bg-surface-container-high text-on-surface text-xs font-semibold"
              >
                Back to Overview
              </button>
            </div>
          )}

          {currentTab === "achievements" && (
            <div className="p-8 rounded-2xl bg-surface-container-low border border-outline-variant/30 text-center">
              <span className="material-symbols-outlined text-4xl text-primary mb-2">
                military_tech
              </span>
              <h2 className="text-xl font-bold text-on-surface mb-2">
                Badges &amp; Trophy Vault
              </h2>
              <p className="text-sm text-outline max-w-md mx-auto mb-4">
                Showcase of 1st place prizes, open-source bounties, and verified hackathon credentials.
              </p>
              <button
                onClick={() => setCurrentTab("overview")}
                className="px-4 py-2 rounded-xl bg-surface-container-high text-on-surface text-xs font-semibold"
              >
                Back to Overview
              </button>
            </div>
          )}

          {currentTab === "settings" && (
            <div className="p-8 rounded-2xl bg-surface-container-low border border-outline-variant/30 text-center">
              <span className="material-symbols-outlined text-4xl text-outline mb-2">
                tune
              </span>
              <h2 className="text-xl font-bold text-on-surface mb-2">
                Workspace Preferences
              </h2>
              <p className="text-sm text-outline max-w-md mx-auto mb-4">
                Configure Discord/Slack webhook URLs, email notifications, and GitHub repository synchronization.
              </p>
              <button
                onClick={() => setCurrentTab("overview")}
                className="px-4 py-2 rounded-xl bg-surface-container-high text-on-surface text-xs font-semibold"
              >
                Back to Overview
              </button>
            </div>
          )}
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
