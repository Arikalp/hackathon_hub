"use client";

import { useState } from "react";
import Image from "next/image";
import { HackathonRecord } from "./AddHackathonModal";
import { useAuth } from "../../../lib/auth/AuthContext";

interface WorkspaceContentProps {
  onOpenAddModal: () => void;
  hackathons: HackathonRecord[];
  searchQuery: string;
  teamsCount?: number;
  onEditHackathon?: (hackathon: HackathonRecord) => void;
}

export default function WorkspaceContent({
  onOpenAddModal,
  hackathons,
  searchQuery,
  teamsCount = 0,
  onEditHackathon,
}: WorkspaceContentProps) {
  const { user, userProfile } = useAuth();
  const [filter, setFilter] = useState<"all" | "active" | "upcoming">("all");

  const displayName =
    userProfile?.displayName ||
    user?.displayName ||
    (user?.email ? user.email.split("@")[0] : "Builder");
  const username =
    userProfile?.username ||
    (user?.email ? user.email.split("@")[0] : "builder");

  // Checklist state for Sprint Launch Protocol
  const [checklist, setChecklist] = useState([
    {
      id: 1,
      text: "Anthropic & OpenAI API keys configured",
      checked: false,
    },
    {
      id: 2,
      text: "Hackathon project repository initialized",
      checked: false,
    },
    {
      id: 3,
      text: "Discord war room & communication link set up",
      checked: false,
    },
    {
      id: 4,
      text: "Production deployment & staging verified",
      checked: false,
    },
  ]);

  const toggleChecklistItem = (id: number) => {
    setChecklist((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const completedCount = checklist.filter((item) => item.checked).length;

  // Filter hackathons
  const filteredHackathons = hackathons.filter((h) => {
    const matchesSearch =
      h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.organizer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.description.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filter === "active") return h.statusType === "urgent" || h.statusType === "registered";
    if (filter === "upcoming") return h.statusType === "forming" || h.statusType === "idea";
    return true;
  });

  const urgentCount = hackathons.filter(
    (h) => h.statusType === "urgent" || h.remainingDays <= 3
  ).length;

  return (
    <div className="flex flex-col w-full gap-8">
      {/* Top Bar / Command Context */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-outline-variant/20">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-on-surface tracking-tight">
              Ready to build, {displayName}?
            </h1>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-high border border-outline-variant/30 text-on-surface-variant font-mono text-xs">
              <span className="inline-block w-2 h-2 rounded-full bg-secondary shadow-[0_0_8px_rgba(168,213,76,0.8)]"></span>
              <span>@{username}</span>
            </div>
            <span className="px-2.5 py-1 rounded-md bg-primary-container/20 text-primary border border-primary/30 font-mono text-xs uppercase tracking-wider font-semibold">
              Builder OS
            </span>
          </div>
          <p className="text-sm sm:text-base text-outline">
            {hackathons.length > 0 ? (
              <span>
                You have <span className="text-secondary font-medium">{hackathons.length} sprint{hackathons.length === 1 ? "" : "s"}</span> tracked in your builder pipeline.
              </span>
            ) : (
              <span>No active hackathons tracked yet. Click &quot;Add Hackathon&quot; to log your upcoming competitions.</span>
            )}
          </p>
        </div>

        {/* Quick Action & Filter Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center p-1 rounded-xl bg-surface-container-low border border-outline-variant/30">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1.5 text-xs font-mono rounded-lg transition-all ${
                filter === "all"
                  ? "bg-surface-container-highest text-on-surface font-semibold shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              All Events ({hackathons.length})
            </button>
            <button
              onClick={() => setFilter("active")}
              className={`px-3 py-1.5 text-xs font-mono rounded-lg transition-all ${
                filter === "active"
                  ? "bg-surface-container-highest text-on-surface font-semibold shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              Active Sprints
            </button>
            <button
              onClick={() => setFilter("upcoming")}
              className={`px-3 py-1.5 text-xs font-mono rounded-lg transition-all ${
                filter === "upcoming"
                  ? "bg-surface-container-highest text-on-surface font-semibold shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              Upcoming Deadlines
            </button>
          </div>

          <button
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-primary-container text-on-primary-container hover:bg-primary hover:text-on-primary transition-all text-xs font-semibold shadow-[0_0_16px_-4px_rgba(160,120,255,0.4)] active:scale-[0.98] cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">add</span>
            <span>Add Hackathon</span>
            <kbd className="font-mono text-[10px] bg-on-primary-container/20 px-1 rounded text-on-primary-container border border-on-primary-container/30">
              N
            </kbd>
          </button>
        </div>
      </div>

      {/* Overview Metrics Grid (5 Monospace Density Cards) */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
        {/* Card 1 */}
        <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30 flex flex-col justify-between hover:border-outline-variant/70 transition-colors group">
          <div className="flex items-center justify-between text-outline text-xs font-mono mb-2 uppercase tracking-wider">
            <span>Upcoming Hackathons</span>
            <span className="material-symbols-outlined text-sm group-hover:text-primary transition-colors">
              event_available
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-mono text-2xl font-bold text-on-surface">
              {String(hackathons.length).padStart(2, "0")}
            </span>
            <span className="font-mono text-xs text-outline">Active</span>
          </div>
          <div className="mt-2 font-mono text-xs text-secondary flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
            <span>{hackathons.length} active in pipeline</span>
          </div>
        </div>

        {/* Card 2 (Critical / Urgent) */}
        <div className="p-4 rounded-xl bg-surface-container-low border border-secondary/40 shadow-[0_0_12px_-4px_rgba(168,213,76,0.15)] flex flex-col justify-between hover:border-secondary transition-colors group">
          <div className="flex items-center justify-between text-secondary text-xs font-mono mb-2 uppercase tracking-wider">
            <span className="font-semibold">Registration Deadlines</span>
            <span className="inline-block w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-mono text-2xl font-bold text-on-surface">
              {String(urgentCount).padStart(2, "0")}
            </span>
            <span className="font-mono text-xs text-error font-medium">Critical</span>
          </div>
          <div className="mt-2 font-mono text-xs text-secondary flex items-center gap-1 font-medium">
            <span className="material-symbols-outlined text-xs">timer</span>
            <span>{urgentCount > 0 ? `${urgentCount} urgent cutoff(s)` : "No urgent cutoffs"}</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30 flex flex-col justify-between hover:border-outline-variant/70 transition-colors group">
          <div className="flex items-center justify-between text-outline text-xs font-mono mb-2 uppercase tracking-wider">
            <span>Active Squads</span>
            <span className="material-symbols-outlined text-sm group-hover:text-primary transition-colors">
              group_work
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-mono text-2xl font-bold text-on-surface">
              {String(teamsCount).padStart(2, "0")}
            </span>
            <span className="font-mono text-xs text-outline">Rosters</span>
          </div>
          <div className="mt-2 font-mono text-xs text-outline truncate">
            {teamsCount > 0 ? `${teamsCount} registered squad${teamsCount === 1 ? "" : "s"}` : "No squads created"}
          </div>
        </div>

        {/* Card 4 */}
        <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30 flex flex-col justify-between hover:border-outline-variant/70 transition-colors group">
          <div className="flex items-center justify-between text-outline text-xs font-mono mb-2 uppercase tracking-wider">
            <span>Completed</span>
            <span className="material-symbols-outlined text-sm group-hover:text-primary transition-colors">
              history_edu
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-mono text-2xl font-bold text-on-surface">00</span>
            <span className="font-mono text-xs text-outline">Events</span>
          </div>
          <div className="mt-2 font-mono text-xs text-on-surface-variant flex items-center gap-1">
            <span className="material-symbols-outlined text-xs text-primary">verified</span>
            <span>0 verified submissions</span>
          </div>
        </div>

        {/* Card 5 */}
        <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30 flex flex-col justify-between hover:border-outline-variant/70 transition-colors group col-span-2 md:col-span-1">
          <div className="flex items-center justify-between text-outline text-xs font-mono mb-2 uppercase tracking-wider">
            <span>Wins &amp; Podiums</span>
            <span className="material-symbols-outlined text-sm text-primary">military_tech</span>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-mono text-2xl font-bold text-primary">00</span>
            <span className="font-mono text-xs text-outline">Podiums</span>
          </div>
          <div className="mt-2 font-mono text-xs text-primary-fixed-dim flex items-center justify-between">
            <span>Win Rate</span>
            <span className="font-bold">0.0%</span>
          </div>
        </div>
      </div>

      {/* Main Dashboard Layout: Two Columns (65% / 35%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (8 cols out of 12) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-xl">
                rocket_launch
              </span>
              <h2 className="text-xl font-bold text-on-surface">
                Active &amp; Upcoming Sprints
              </h2>
            </div>
            <span className="font-mono text-xs text-outline uppercase tracking-wider">
              {filteredHackathons.length} Sprints Tracked
            </span>
          </div>

          {/* List of Hackathons */}
          <div className="flex flex-col gap-4">
            {filteredHackathons.map((hackathon) => (
              <div
                key={hackathon.id}
                className="relative p-5 sm:p-6 rounded-xl bg-surface-container-low border border-outline-variant/40 hover:border-primary/60 transition-all shadow-md group overflow-hidden"
              >
                {/* Accent border strip */}
                <div
                  className={`absolute top-0 left-0 bottom-0 w-1 ${
                    hackathon.statusType === "urgent"
                      ? "bg-gradient-to-b from-secondary via-primary to-transparent"
                      : hackathon.statusType === "forming"
                      ? "bg-primary"
                      : "bg-surface-container-highest"
                  }`}
                ></div>

                <div className="flex flex-col gap-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex flex-col gap-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs text-outline uppercase font-semibold tracking-wider">
                          {hackathon.organizer}
                        </span>
                        <span className="text-outline-variant">•</span>
                        <span
                          className={`px-2 py-0.5 rounded-full font-mono text-xs font-semibold flex items-center gap-1.5 ${
                            hackathon.statusType === "urgent"
                              ? "bg-secondary/15 border border-secondary/40 text-secondary"
                              : hackathon.statusType === "forming"
                              ? "bg-primary-container/20 border border-primary/30 text-primary"
                              : "bg-surface-container-highest text-outline"
                          }`}
                        >
                          {hackathon.statusType === "urgent" && (
                            <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>
                          )}
                          {hackathon.status}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-surface-container-high text-on-surface-variant font-mono text-xs">
                          {hackathon.mode}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-on-surface tracking-tight mt-1">
                        {hackathon.name}
                      </h3>
                    </div>

                    <div className="flex flex-col items-end">
                      <span
                        className={`px-2.5 py-1 rounded-lg font-mono text-xs font-bold ${
                          hackathon.statusType === "urgent"
                            ? "bg-surface-container-highest text-secondary border border-secondary/30"
                            : "bg-surface-container-high text-on-surface"
                        }`}
                      >
                        {hackathon.remainingDays <= 2
                          ? `Starts in ${hackathon.remainingDays} days`
                          : `${hackathon.remainingDays} days remaining`}
                      </span>
                      <span
                        className={`font-mono text-xs mt-1 flex items-center gap-1 ${
                          hackathon.statusType === "urgent"
                            ? "text-error"
                            : "text-outline"
                        }`}
                      >
                        {hackathon.statusType === "urgent" && (
                          <span className="material-symbols-outlined text-xs">
                            crisis_alert
                          </span>
                        )}
                        {hackathon.deadlineText}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-on-surface-variant leading-relaxed">
                    {hackathon.description}
                  </p>

                  {/* Tags */}
                  {hackathon.tags && hackathon.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {hackathon.tags.map((t, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded bg-surface-container text-on-surface-variant font-mono text-xs"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Timeline & Team Row */}
                  <div className="pt-3 border-t border-outline-variant/20 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-6">
                      <div className="flex flex-col">
                        <span className="font-mono text-[11px] text-outline">
                          Sprint Timeline
                        </span>
                        <span className="font-mono text-xs text-on-surface font-semibold">
                          {hackathon.dates}
                        </span>
                      </div>

                      <div className="h-8 w-px bg-outline-variant/30 hidden sm:block"></div>

                      <div className="flex flex-col">
                        <span className="font-mono text-[11px] text-outline">
                          Squad: <span className="text-on-surface font-semibold">{hackathon.teamName}</span>
                        </span>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-surface-container-high text-on-surface-variant font-mono text-[11px] border border-outline-variant/30">
                            <span className="material-symbols-outlined text-xs text-primary">groups</span>
                            <span>{hackathon.teamCount}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {onEditHackathon && (
                        <button
                          onClick={() => onEditHackathon(hackathon)}
                          className="px-3 py-1.5 rounded-lg bg-surface-container-high text-primary hover:bg-primary hover:text-on-primary transition-all text-xs font-semibold flex items-center gap-1 border border-primary/30 cursor-pointer shadow-sm"
                          type="button"
                          title="Update hackathon details and status"
                        >
                          <span className="material-symbols-outlined text-sm">edit</span>
                          <span>Update</span>
                        </button>
                      )}
                      <button
                        onClick={() => onEditHackathon ? onEditHackathon(hackathon) : null}
                        className="px-3 py-1.5 rounded-lg bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors text-xs font-medium border border-outline-variant/30 cursor-pointer"
                        type="button"
                      >
                        Details
                      </button>
                      <button
                        className="px-3.5 py-1.5 rounded-lg bg-secondary text-on-secondary text-xs font-semibold hover:bg-secondary-fixed transition-all flex items-center gap-1.5 shadow-[0_0_12px_-2px_rgba(168,213,76,0.3)] cursor-pointer"
                        type="button"
                      >
                        <span className="material-symbols-outlined text-base">
                          terminal
                        </span>
                        <span>Workspace</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {filteredHackathons.length === 0 && (
              <div className="p-12 text-center rounded-xl bg-surface-container-low border border-dashed border-outline-variant/40">
                <span className="material-symbols-outlined text-4xl text-outline mb-2">
                  search_off
                </span>
                <h4 className="text-base font-semibold text-on-surface mb-1">
                  No hackathons found
                </h4>
                <p className="text-xs text-outline mb-4">
                  No events match your current filter or search criteria.
                </p>
                <button
                  onClick={onOpenAddModal}
                  className="px-4 py-2 rounded-xl bg-primary-container text-on-primary-container text-xs font-semibold"
                >
                  Add a Hackathon
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (4 cols out of 12) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Interactive Mini Calendar Widget */}
          <div className="p-4 sm:p-5 rounded-xl bg-surface-container-low border border-outline-variant/30 flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-base">
                  calendar_today
                </span>
                <span className="font-mono text-xs font-semibold text-on-surface uppercase tracking-wider">
                  November 2025
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  className="p-1 rounded text-outline hover:text-on-surface hover:bg-surface-container"
                  type="button"
                >
                  <span className="material-symbols-outlined text-sm">chevron_left</span>
                </button>
                <button
                  className="p-1 rounded text-outline hover:text-on-surface hover:bg-surface-container"
                  type="button"
                >
                  <span className="material-symbols-outlined text-sm">chevron_right</span>
                </button>
              </div>
            </div>

            {/* Calendar Days Header */}
            <div className="grid grid-cols-7 gap-1 text-center font-mono text-xs text-outline py-1">
              <div>Su</div>
              <div>Mo</div>
              <div>Tu</div>
              <div>We</div>
              <div>Th</div>
              <div>Fr</div>
              <div>Sa</div>
            </div>

            {/* Calendar Dates Grid */}
            <div className="grid grid-cols-7 gap-1 text-center font-mono text-xs text-on-surface-variant">
              <div className="p-1.5 text-outline/30">26</div>
              <div className="p-1.5 text-outline/30">27</div>
              <div className="p-1.5 text-outline/30">28</div>
              <div className="p-1.5 text-outline/30">29</div>
              <div className="p-1.5 text-outline/30">30</div>
              <div className="p-1.5 text-outline/30">31</div>
              <div className="p-1.5 rounded hover:bg-surface-container transition-colors">1</div>
              <div className="p-1.5 rounded hover:bg-surface-container transition-colors">2</div>
              <div className="p-1.5 rounded hover:bg-surface-container transition-colors">3</div>
              <div className="p-1.5 rounded hover:bg-surface-container transition-colors">4</div>
              <div className="p-1.5 rounded hover:bg-surface-container transition-colors">5</div>
              <div className="p-1.5 rounded hover:bg-surface-container transition-colors">6</div>
              <div className="p-1.5 rounded hover:bg-surface-container transition-colors">7</div>
              <div className="p-1.5 rounded hover:bg-surface-container transition-colors">8</div>
              <div className="p-1.5 rounded hover:bg-surface-container transition-colors">9</div>
              <div className="p-1.5 rounded hover:bg-surface-container transition-colors">10</div>
              <div className="p-1.5 rounded hover:bg-surface-container transition-colors">11</div>
              <div className="p-1.5 rounded hover:bg-surface-container transition-colors">12</div>
              <div className="p-1.5 rounded bg-surface-container-high text-on-surface font-bold ring-1 ring-secondary/50">
                13
              </div>
              <div className="p-1.5 rounded hover:bg-surface-container transition-colors">14</div>
              <div className="p-1.5 rounded hover:bg-surface-container transition-colors">15</div>
              <div className="p-1.5 rounded hover:bg-surface-container transition-colors">16</div>
              <div className="p-1.5 rounded hover:bg-surface-container transition-colors">17</div>
              <div className="p-1.5 rounded hover:bg-surface-container transition-colors">18</div>
              <div className="p-1.5 rounded hover:bg-surface-container transition-colors">19</div>
              <div className="p-1.5 rounded hover:bg-surface-container transition-colors">20</div>
              <div className="p-1.5 rounded hover:bg-surface-container transition-colors">21</div>
              <div className="p-1.5 rounded hover:bg-surface-container transition-colors">22</div>
              <div className="p-1.5 rounded hover:bg-surface-container transition-colors">23</div>
              <div className="p-1.5 rounded hover:bg-surface-container transition-colors">24</div>
              <div className="p-1.5 rounded hover:bg-surface-container transition-colors">25</div>
              <div className="p-1.5 rounded hover:bg-surface-container transition-colors">26</div>
              <div className="p-1.5 rounded hover:bg-surface-container transition-colors">27</div>
              <div className="p-1.5 rounded hover:bg-surface-container transition-colors">28</div>
              <div className="p-1.5 rounded hover:bg-surface-container transition-colors">29</div>
              <div className="p-1.5 rounded hover:bg-surface-container transition-colors">30</div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-outline-variant/20 font-mono text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-primary"></span>
                <span className="text-outline">Sprint Days</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-secondary"></span>
                <span className="text-outline">Deadlines</span>
              </div>
            </div>
          </div>

          {/* Live Activity Feed Widget */}
          <div className="p-4 sm:p-5 rounded-xl bg-surface-container-low border border-outline-variant/30 flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-base">
                  sensors
                </span>
                <span className="font-mono text-xs font-semibold text-on-surface uppercase tracking-wider">
                  Live Squad Feed
                </span>
              </div>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded font-mono text-[10px] bg-secondary/15 text-secondary font-bold">
                SYNCED
              </span>
            </div>

            {hackathons.length > 0 ? (
              <div className="flex flex-col divide-y divide-outline-variant/15 text-xs">
                {hackathons.map((h) => (
                  <div key={h.id} className="py-2.5 flex items-start gap-2.5 first:pt-1">
                    <span className="material-symbols-outlined text-primary text-sm mt-0.5">
                      flag
                    </span>
                    <div className="flex flex-col min-w-0">
                      <span className="text-on-surface leading-tight">
                        Logged <span className="font-semibold text-on-surface">{h.name}</span> with squad {h.teamName}
                      </span>
                      <span className="font-mono text-[10px] text-outline mt-1">{h.dates}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-outline text-xs flex flex-col items-center gap-1.5">
                <span className="material-symbols-outlined text-2xl text-outline/50">
                  radar
                </span>
                <span className="font-medium text-on-surface-variant">No squad activity yet</span>
                <span className="text-[11px] text-outline max-w-[220px]">
                  Sprint commits, deadline alerts, and team invites will stream here.
                </span>
              </div>
            )}
          </div>

          {/* Quick Team Checklist Widget */}
          <div className="p-4 sm:p-5 rounded-xl bg-surface-container-low border border-outline-variant/30 flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-base">
                  checklist
                </span>
                <span className="font-mono text-xs font-semibold text-on-surface uppercase tracking-wider">
                  Sprint Launch Protocol
                </span>
              </div>
              <span
                className={`font-mono text-xs font-semibold ${
                  completedCount === checklist.length
                    ? "text-primary"
                    : "text-secondary"
                }`}
              >
                {completedCount}/{checklist.length} Done
              </span>
            </div>

            <div className="flex flex-col gap-2 text-xs mt-1">
              {checklist.map((item) => (
                <label
                  key={item.id}
                  className="flex items-center gap-2.5 p-1.5 rounded hover:bg-surface-container cursor-pointer transition-colors group"
                >
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={() => toggleChecklistItem(item.id)}
                    className="w-3.5 h-3.5 rounded bg-surface-container-high border border-outline-variant/40 text-primary accent-primary cursor-pointer"
                  />
                  <span
                    className={`transition-colors ${
                      item.checked
                        ? "line-through text-outline"
                        : "text-on-surface group-hover:text-primary font-medium"
                    }`}
                  >
                    {item.text}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
