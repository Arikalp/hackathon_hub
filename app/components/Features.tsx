"use client";

import { useState } from "react";

export default function Features() {
  const [icsDownloaded, setIcsDownloaded] = useState(false);

  const handleExportIcs = () => {
    // Generate a real .ics calendar invite for the demo hackathon deadline
    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Hackathon Hub//Sprint Deadline//EN",
      "BEGIN:VEVENT",
      "SUMMARY:Hackathon Hub - Buildspace AI Sprint Submission",
      "DESCRIPTION:Final submission cutoff for Buildspace AI Sprint! Submit code, pitch deck, and video demo.",
      "STATUS:CONFIRMED",
      "BEGIN:VALARM",
      "TRIGGER:-PT2H",
      "ACTION:DISPLAY",
      "DESCRIPTION:Reminder: 2 hours until hackathon submission cutoff!",
      "END:VALARM",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute("download", "hackathon-sprint-deadline.ics");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setIcsDownloaded(true);
    setTimeout(() => setIcsDownloaded(false), 2500);
  };

  return (
    <section id="features" className="w-full px-4 sm:px-6 lg:px-8 py-20 max-w-7xl mx-auto flex flex-col gap-12">
      <div className="flex flex-col gap-3 max-w-2xl">
        <div className="inline-flex items-center gap-1.5 text-primary font-mono text-xs uppercase tracking-widest font-semibold">
          <span className="material-symbols-outlined text-[16px]">tune</span>
          <span>ENGINEERED FOR FLOW</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold text-on-surface">
          Everything competitive squads need to dominate.
        </h2>
        <p className="text-base text-on-surface-variant">
          No more frantic Discord DMs at 3 AM or forgotten registration links. We turn chaotic hackathons into methodical winning streaks.
        </p>
      </div>

      {/* 2x2 Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
        {/* Feature Card 1 */}
        <div className="p-6 sm:p-8 rounded-2xl bg-surface-container-low border border-outline-variant/30 transition-all duration-300 hover:bg-surface-container hover:shadow-xl hover:border-outline-variant/60 flex flex-col justify-between group">
          <div>
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-200 border border-primary/20">
              <span className="material-symbols-outlined text-2xl">hub</span>
            </div>
            <div className="font-mono text-xs uppercase tracking-widest text-outline mb-2">
              01 / TEAM CORE
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-on-surface mb-3">
              Your Team, One Workspace
            </h3>
            <p className="text-sm sm:text-base text-on-surface-variant leading-relaxed mb-6">
              Create teams, invite friends, assign builder roles (Frontend, AI/ML, Smart Contracts, UI/UX), and synchronize project repos without context switching.
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-surface-container-lowest/80 border border-outline-variant/20 flex flex-wrap gap-2">
            <span className="px-3 py-1 rounded-full bg-surface-container text-on-surface font-mono text-xs flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-primary"></span>
              Role-Based Permissions
            </span>
            <span className="px-3 py-1 rounded-full bg-surface-container text-on-surface font-mono text-xs flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-secondary"></span>
              GitHub Monorepo Link
            </span>
            <span className="px-3 py-1 rounded-full bg-surface-container text-on-surface font-mono text-xs flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-tertiary"></span>
              Figma Embedded Canvas
            </span>
          </div>
        </div>

        {/* Feature Card 2 */}
        <div className="p-6 sm:p-8 rounded-2xl bg-surface-container-low border border-outline-variant/30 transition-all duration-300 hover:bg-surface-container hover:shadow-xl hover:border-outline-variant/60 flex flex-col justify-between group">
          <div>
            <div className="w-12 h-12 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-200 border border-secondary/20">
              <span className="material-symbols-outlined text-2xl">timer</span>
            </div>
            <div className="font-mono text-xs uppercase tracking-widest text-outline mb-2">
              02 / TIME SYNC
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-on-surface mb-3">
              Never Miss a Deadline
            </h3>
            <p className="text-sm sm:text-base text-on-surface-variant leading-relaxed mb-6">
              Dynamic countdown clocks for registration deadlines, hacking windows, and submission portals with synchronized ICS calendar export and local timezone correction.
            </p>
          </div>
          {/* Interactive Timeline Clocks */}
          <div className="p-3.5 rounded-xl bg-surface-container-lowest/80 border border-outline-variant/20 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="font-mono text-xs text-outline">Devpost Cutoff</span>
              <span className="font-mono text-base text-secondary font-bold">
                T - 04:12:18
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportIcs}
                className="px-3 py-1.5 rounded-lg bg-surface-container-high text-on-surface font-mono text-xs hover:bg-surface-bright flex items-center gap-1.5 transition-colors border border-outline-variant/30 cursor-pointer active:scale-95"
              >
                <span className="material-symbols-outlined text-[15px] text-primary">
                  {icsDownloaded ? "check" : "calendar_add_on"}
                </span>
                <span>{icsDownloaded ? "Exported!" : "Export .ICS"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Feature Card 3 */}
        <div className="p-6 sm:p-8 rounded-2xl bg-surface-container-low border border-outline-variant/30 transition-all duration-300 hover:bg-surface-container hover:shadow-xl hover:border-outline-variant/60 flex flex-col justify-between group">
          <div>
            <div className="w-12 h-12 rounded-xl bg-tertiary/10 text-tertiary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-200 border border-tertiary/20">
              <span className="material-symbols-outlined text-2xl">folder_managed</span>
            </div>
            <div className="font-mono text-xs uppercase tracking-widest text-outline mb-2">
              03 / ARCHIVE
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-on-surface mb-3">
              Every Hackathon, Remembered
            </h3>
            <p className="text-sm sm:text-base text-on-surface-variant leading-relaxed mb-6">
              A searchable competition vault of past hacks, video demos, project repos, devpost links, judges&apos; feedback, and finalist trophies in one unified showcase profile.
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-surface-container-lowest/80 border border-outline-variant/20 grid grid-cols-3 gap-2 text-center">
            <div className="bg-surface-container p-2.5 rounded-lg">
              <span className="block font-bold text-lg text-on-surface">18</span>
              <span className="font-mono text-xs text-outline">Repos</span>
            </div>
            <div className="bg-surface-container p-2.5 rounded-lg">
              <span className="block font-bold text-lg text-secondary">5x</span>
              <span className="font-mono text-xs text-outline">Podiums</span>
            </div>
            <div className="bg-surface-container p-2.5 rounded-lg">
              <span className="block font-bold text-lg text-primary">100%</span>
              <span className="font-mono text-xs text-outline">Shipped</span>
            </div>
          </div>
        </div>

        {/* Feature Card 4 */}
        <div className="p-6 sm:p-8 rounded-2xl bg-surface-container-low border border-outline-variant/30 transition-all duration-300 hover:bg-surface-container hover:shadow-xl hover:border-outline-variant/60 flex flex-col justify-between group">
          <div>
            <div className="w-12 h-12 rounded-xl bg-primary-container/20 text-primary-fixed flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-200 border border-primary-container/30">
              <span className="material-symbols-outlined text-2xl">notifications_active</span>
            </div>
            <div className="font-mono text-xs uppercase tracking-widest text-outline mb-2">
              04 / NOTIFICATIONS
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-on-surface mb-3">
              Stay in the Loop
            </h3>
            <p className="text-sm sm:text-base text-on-surface-variant leading-relaxed mb-6">
              Instant Discord/Slack webhooks, email reminders, and in-app alerts as submission cutoffs approach. Never be caught off-guard by an early deadline.
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-surface-container-lowest/80 border border-outline-variant/20 flex items-center justify-between">
            <div className="flex items-center gap-2 truncate">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse shrink-0"></span>
              <span className="font-mono text-xs text-on-surface truncate">
                webhook::discord/squad-alerts
              </span>
            </div>
            <span className="px-2 py-0.5 rounded bg-surface-container text-secondary font-mono text-[11px] font-medium shrink-0">
              Active
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
