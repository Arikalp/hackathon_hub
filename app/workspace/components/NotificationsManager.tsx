"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../../lib/auth/AuthContext";
import {
  AppNotification,
  getUserNotifications,
  markNotificationAsRead,
  createUserNotification,
} from "../../../lib/firebase/notifications";

// Format Firestore timestamps / ISO strings for display
function formatCreatedAt(createdAt: unknown): string {
  if (!createdAt) return "";
  if (
    typeof createdAt === "object" &&
    createdAt !== null &&
    "seconds" in createdAt
  ) {
    return new Date((createdAt as { seconds: number }).seconds * 1000).toLocaleString();
  }
  return String(createdAt);
}

export default function NotificationsManager() {
  const { user } = useAuth();
  const [sendingTest, setSendingTest] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [loadingFeed, setLoadingFeed] = useState(true);

  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  // Load the persistent feed from Firestore for signed-in users
  useEffect(() => {
    if (!user?.uid) {
      setNotifications([]);
      setLoadingFeed(false);
      return;
    }
    let isMounted = true;
    getUserNotifications(user.uid)
      .then((cloudNotifs) => {
        if (!isMounted) return;
        cloudNotifs.sort((a, b) => {
          const toMillis = (t: unknown): number =>
            t && typeof t === "object" && "seconds" in t
              ? (t as { seconds: number }).seconds * 1000
              : 0;
          return toMillis(b.createdAt) - toMillis(a.createdAt);
        });
        setNotifications(cloudNotifs);
      })
      .catch((err) => console.warn("Could not load notifications:", err))
      .finally(() => {
        if (isMounted) setLoadingFeed(false);
      });
    return () => {
      isMounted = false;
    };
  }, [user?.uid]);

  const toggleRead = (notif: AppNotification) => {
    const isNowRead = !notif.readAt;
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notif.id
          ? { ...n, readAt: isNowRead ? new Date().toISOString() : null }
          : n
      )
    );
    // Persist read state to Firestore
    if (user?.uid && isNowRead) {
      markNotificationAsRead(user.uid, notif.id).catch((err) =>
        console.warn("Could not mark notification read:", err)
      );
    }
  };

  const markAllRead = () => {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, readAt: n.readAt || new Date().toISOString() }))
    );
    if (user?.uid) {
      notifications
        .filter((n) => !n.readAt)
        .forEach((n) => {
          markNotificationAsRead(user.uid, n.id).catch(() => {});
        });
    }
  };

  const handleTriggerEmailReminder = async () => {
    setSendingTest(true);
    setTestResult(null);

    try {
      const res = await fetch("/api/reminders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user?.email || "builder@example.com",
          name: user?.displayName || (user?.email ? user.email.split("@")[0] : "Builder"),
          hackathonName: "Upcoming Hackathon Sprint",
          deadlineText: "In 48 Hours",
          daysLeft: 2,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setTestResult(
          `✓ Reminder email dispatched successfully to ${
            user?.email || "registered address"
          }. Check your inbox!`
        );

        // Persist an in-app notification for this dispatch (not for guest demo users)
        const newNotif: AppNotification = {
          id: "notif-" + Date.now(),
          type: "deadline" as const,
          title: "Email Reminder Dispatched",
          message: `Deadline reminder for "Upcoming Hackathon Sprint" sent to ${
            user?.email || "your registered email"
          }.`,
          readAt: null,
          createdAt: "Just now",
        };
        setNotifications((prev) => [newNotif, ...prev]);
        if (user?.uid) {
          try {
            await createUserNotification(user.uid, {
              type: "deadline",
              title: newNotif.title,
              message: newNotif.message,
            });
          } catch (err) {
            console.warn("Could not persist notification:", err);
          }
        }
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

        {loadingFeed ? (
          <div className="p-12 rounded-2xl bg-surface-container-low border border-dashed border-outline-variant/30 text-center flex flex-col items-center justify-center gap-2">
            <span className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
            <span className="text-xs font-mono text-outline">
              Loading your notification feed...
            </span>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-12 rounded-2xl bg-surface-container-low border border-dashed border-outline-variant/30 text-center flex flex-col items-center justify-center gap-2">
            <span className="material-symbols-outlined text-4xl text-outline/50">
              notifications_off
            </span>
            <h3 className="text-base font-bold text-on-surface">No notifications yet</h3>
            <p className="text-xs text-outline max-w-sm">
              You&apos;re completely caught up! Competition reminders and squad invitations will appear here.
            </p>
          </div>
        ) : (
          notifications.map((notif) => {
            const isUnread = !notif.readAt;
            return (
              <div
                key={notif.id}
                onClick={() => toggleRead(notif)}
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
                      {formatCreatedAt(notif.createdAt)}
                    </span>
                  </div>
                </div>

                <span className="material-symbols-outlined text-outline text-sm shrink-0">
                  {isUnread ? "mark_email_unread" : "drafts"}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
