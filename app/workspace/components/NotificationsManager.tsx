"use client";

import { useState } from "react";
import { useAuth } from "../../../lib/auth/AuthContext";
import { AppNotification } from "../../../lib/firebase/notifications";

export default function NotificationsManager() {
  const { user } = useAuth();
  const [sendingTest, setSendingTest] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  const [notifications, setNotifications] = useState<AppNotification[]>([
    {
      id: "notif-1",
      type: "deadline",
      title: "Critical Deadline: Buildspace AI Sprint 2025",
      message:
        "Final submission cutoff closes in less than 42 hours! Ensure your pitch deck, repo, and video demo are linked.",
      readAt: null,
      createdAt: "10m ago",
    },
    {
      id: "notif-2",
      type: "invite",
      title: "Team Invitation: SynthLabs",
      message:
        "Alex Rivera invited you to join SynthLabs as Full-Stack Architect for DevForge Global Challenge.",
      readAt: null,
      createdAt: "1h ago",
    },
    {
      id: "notif-3",
      type: "update",
      title: "Roster Finalized",
      message:
        "Team NovaLogic has locked in all 4 builders for the upcoming global sprint window.",
      readAt: "Yesterday",
      createdAt: "Yesterday",
    },
  ]);

  const toggleRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id
          ? { ...n, readAt: n.readAt ? null : new Date().toISOString() }
          : n
      )
    );
  };

  const markAllRead = () => {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, readAt: new Date().toISOString() }))
    );
  };

  const handleTriggerEmailReminder = async () => {
    setSendingTest(true);
    setTestResult(null);

    try {
      const res = await fetch("/api/reminders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user?.email || "builder@novalogic.dev",
          name: user?.displayName || "Alex Rivera",
          hackathonName: "Buildspace AI Sprint 2025",
          deadlineText: "Today, 23:59 UTC",
          daysLeft: 2,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setTestResult(
          `✓ Nodemailer dispatch simulated successfully to ${
            user?.email || "builder@novalogic.dev"
          }!`
        );

        // Add a new in-app notification
        const newNotif: AppNotification = {
          id: "notif-" + Date.now(),
          type: "reminder",
          title: "Scheduled Email Reminder Dispatched",
          message:
            "Automated deadline reminder sent for Buildspace AI Sprint 2025 cutoff.",
          readAt: null,
          createdAt: "Just now",
        };
        setNotifications((prev) => [newNotif, ...prev]);
      } else {
        setTestResult(`Error: ${data.message}`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed";
      setTestResult(`Error: ${msg}`);
    } finally {
      setSendingTest(false);
      setTimeout(() => setTestResult(null), 5000);
    }
  };

  const unreadCount = notifications.filter((n) => !n.readAt).length;

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-outline-variant/20">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-primary text-xl">
              notifications_active
            </span>
            <h1 className="text-2xl font-bold text-on-surface">
              Notifications &amp; Reminders
            </h1>
          </div>
          <p className="text-sm text-outline">
            Real-time in-app alerts and automated Nodemailer email reminders for team events.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={markAllRead}
            className="px-3 py-1.5 rounded-lg bg-surface-container text-xs text-on-surface-variant hover:text-on-surface border border-outline-variant/30 cursor-pointer"
          >
            Mark all as read
          </button>
          <button
            onClick={handleTriggerEmailReminder}
            disabled={sendingTest}
            className="px-3.5 py-1.5 rounded-xl bg-primary-container text-on-primary-container text-xs font-semibold hover:bg-primary hover:text-on-primary transition-all flex items-center gap-1.5 shadow-[0_0_12px_rgba(160,120,255,0.4)] cursor-pointer disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-sm">mail</span>
            <span>
              {sendingTest ? "Sending..." : "Dispatch Test Reminder"}
            </span>
          </button>
        </div>
      </div>

      {testResult && (
        <div className="p-3.5 rounded-xl bg-secondary/15 border border-secondary/30 text-secondary text-xs font-mono font-medium flex items-center gap-2">
          <span className="material-symbols-outlined text-base">check_circle</span>
          <span>{testResult}</span>
        </div>
      )}

      {/* Notifications List */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between text-xs font-mono text-outline mb-1">
          <span>INBOX ({unreadCount} UNREAD)</span>
          <span>Sorted by newest</span>
        </div>

        {notifications.map((notif) => {
          const isUnread = !notif.readAt;
          return (
            <div
              key={notif.id}
              onClick={() => toggleRead(notif.id)}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-4 ${
                isUnread
                  ? "bg-surface-container border-outline-variant/50 shadow-sm"
                  : "bg-surface-container-low border-outline-variant/20 opacity-75"
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                    notif.type === "deadline"
                      ? "bg-error-container/20 text-error"
                      : notif.type === "invite"
                      ? "bg-secondary-container/20 text-secondary"
                      : "bg-primary-container/20 text-primary"
                  }`}
                >
                  <span className="material-symbols-outlined text-lg">
                    {notif.type === "deadline"
                      ? "timer"
                      : notif.type === "invite"
                      ? "group_add"
                      : "mail"}
                  </span>
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-on-surface">
                      {notif.title}
                    </h4>
                    {isUnread && (
                      <span className="w-2 h-2 rounded-full bg-secondary shrink-0"></span>
                    )}
                  </div>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    {notif.message}
                  </p>
                  <span className="font-mono text-[10px] text-outline mt-1">
                    {String(notif.createdAt)}
                  </span>
                </div>
              </div>

              <span className="material-symbols-outlined text-outline text-sm shrink-0">
                {isUnread ? "mark_email_unread" : "drafts"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
