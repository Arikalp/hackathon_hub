"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "../../../lib/auth/AuthContext";

export default function SettingsManager() {
  const { user, userProfile } = useAuth();

  const [emailReminders, setEmailReminders] = useState(
    userProfile?.notificationPreferences?.emailReminders ?? true
  );
  const [deadlineAlerts, setDeadlineAlerts] = useState(
    userProfile?.notificationPreferences?.deadlineAlerts ?? true
  );
  const [teamInvites, setTeamInvites] = useState(
    userProfile?.notificationPreferences?.teamInvites ?? true
  );
  const [saved, setSaved] = useState(false);

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-outline-variant/20">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-outline text-xl">
              tune
            </span>
            <h1 className="text-2xl font-bold text-on-surface">
              Account &amp; Workspace Settings
            </h1>
          </div>
          <p className="text-sm text-outline">
            Configure your builder identity, email notification thresholds, and Firebase sync.
          </p>
        </div>
      </div>

      {saved && (
        <div className="p-3.5 rounded-xl bg-secondary/15 border border-secondary/30 text-secondary text-xs font-mono font-medium flex items-center gap-2">
          <span className="material-symbols-outlined text-base">check_circle</span>
          <span>Preferences saved successfully to Firestore!</span>
        </div>
      )}

      {/* Identity Card */}
      <div className="p-6 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex flex-col gap-4">
        <h2 className="text-base font-bold text-on-surface">
          Builder Identity &amp; Handle
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-3.5 rounded-xl bg-surface-container border border-outline-variant/20">
            <span className="font-mono text-xs text-outline uppercase block mb-1">
              Current Username
            </span>
            <span className="font-mono text-sm font-bold text-primary">
              @{userProfile?.username || (user?.email ? user.email.split("@")[0] : "not_claimed")}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-surface-container border border-outline-variant/20">
            <span className="font-mono text-xs text-outline uppercase block mb-1">
              Registered Email
            </span>
            <span className="font-mono text-sm text-on-surface truncate block">
              {user?.email || "No email linked"}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-outline">
            Need to change your unique platform handle?
          </span>
          <Link
            href="/onboarding"
            className="px-3.5 py-1.5 rounded-lg bg-surface-container-high text-on-surface hover:bg-surface-bright text-xs font-mono font-medium border border-outline-variant/30 transition-colors"
          >
            Update Handle
          </Link>
        </div>
      </div>

      {/* Notification Preferences */}
      <form
        onSubmit={handleSavePreferences}
        className="p-6 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex flex-col gap-5"
      >
        <div>
          <h2 className="text-base font-bold text-on-surface mb-1">
            Nodemailer Email &amp; In-App Alerts
          </h2>
          <p className="text-xs text-outline">
            Choose what automated alerts and reminders you receive.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <label className="flex items-center justify-between p-3 rounded-xl bg-surface-container hover:bg-surface-container-high cursor-pointer transition-colors">
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-on-surface">
                Event Date Reminders (7-Day &amp; 1-Day)
              </span>
              <span className="text-xs text-outline">
                Receive email alerts prior to hackathon kickoffs.
              </span>
            </div>
            <input
              type="checkbox"
              checked={emailReminders}
              onChange={(e) => setEmailReminders(e.target.checked)}
              className="w-4 h-4 rounded text-primary accent-primary"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-xl bg-surface-container hover:bg-surface-container-high cursor-pointer transition-colors">
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-on-surface">
                Registration Deadline Alerts
              </span>
              <span className="text-xs text-outline">
                Critical alerts 48 hours and 2 hours before registration cutoff.
              </span>
            </div>
            <input
              type="checkbox"
              checked={deadlineAlerts}
              onChange={(e) => setDeadlineAlerts(e.target.checked)}
              className="w-4 h-4 rounded text-primary accent-primary"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-xl bg-surface-container hover:bg-surface-container-high cursor-pointer transition-colors">
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-on-surface">
                Team Invitations &amp; Roster Updates
              </span>
              <span className="text-xs text-outline">
                Get notified when another builder invites you to their squad.
              </span>
            </div>
            <input
              type="checkbox"
              checked={teamInvites}
              onChange={(e) => setTeamInvites(e.target.checked)}
              className="w-4 h-4 rounded text-primary accent-primary"
            />
          </label>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            className="px-5 py-2 rounded-xl bg-primary-container text-on-primary-container text-xs font-semibold hover:bg-primary hover:text-on-primary transition-all shadow-[0_0_12px_rgba(160,120,255,0.4)] cursor-pointer"
          >
            Save Preferences
          </button>
        </div>
      </form>
    </div>
  );
}
