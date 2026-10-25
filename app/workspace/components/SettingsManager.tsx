"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "../../../lib/auth/AuthContext";

export default function SettingsManager() {
  const {
    user,
    userProfile,
    updateUserProfile,
    refreshProfile,
    claimUsername,
    checkUsernameAvailable,
  } = useAuth();

  // Builder Identity state
  const [usernameInput, setUsernameInput] = useState("");
  const [handleChecking, setHandleChecking] = useState(false);
  const [handleAvailable, setHandleAvailable] = useState<boolean | null>(null);
  const [handleError, setHandleError] = useState("");

  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");

  // Notification Preferences state
  const [emailReminders, setEmailReminders] = useState(true);
  const [deadlineAlerts, setDeadlineAlerts] = useState(true);
  const [teamInvites, setTeamInvites] = useState(true);

  // Upload & Save UI states
  const [profileSaving, setProfileSaving] = useState(false);
  const [preferencesSaving, setPreferencesSaving] = useState(false);
  const [syncingCloud, setSyncingCloud] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  // Initialize form fields from userProfile and user auth
  useEffect(() => {
    if (userProfile) {
      setUsernameInput(userProfile.username || "");
      setDisplayName(userProfile.displayName || user?.displayName || "");
      setBio(userProfile.bio || "");
      setSkills(userProfile.skills?.join(", ") || "");
      setGithubUrl(userProfile.githubUrl || "");
      setLinkedinUrl(userProfile.linkedinUrl || "");
      setPortfolioUrl(userProfile.portfolioUrl || "");

      if (userProfile.notificationPreferences) {
        setEmailReminders(userProfile.notificationPreferences.emailReminders ?? true);
        setDeadlineAlerts(userProfile.notificationPreferences.deadlineAlerts ?? true);
        setTeamInvites(userProfile.notificationPreferences.teamInvites ?? true);
      }
    } else if (user) {
      if (user.email) {
        setUsernameInput(user.email.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "_"));
      }
      setDisplayName(user.displayName || user.email?.split("@")[0] || "");
    }
  }, [userProfile, user]);

  // Real-time debounce check for handle change
  useEffect(() => {
    if (!usernameInput) {
      setHandleAvailable(null);
      setHandleError("Username handle cannot be empty");
      return;
    }

    const currentNormalized =
      userProfile?.usernameNormalized || userProfile?.username?.toLowerCase();
    const newNormalized = usernameInput.toLowerCase();

    // If matches user's current handle
    if (currentNormalized === newNormalized) {
      setHandleAvailable(true);
      setHandleError("");
      return;
    }

    if (usernameInput.length < 3 || usernameInput.length > 20) {
      setHandleAvailable(false);
      setHandleError("Handle must be 3-20 characters long");
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(usernameInput)) {
      setHandleAvailable(false);
      setHandleError("Only letters, numbers, and underscores allowed");
      return;
    }

    setHandleError("");
    setHandleChecking(true);

    const timer = setTimeout(async () => {
      try {
        const available = await checkUsernameAvailable(usernameInput);
        setHandleAvailable(available);
        if (!available) {
          setHandleError("This handle is already taken");
        }
      } catch {
        setHandleAvailable(true);
      } finally {
        setHandleChecking(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [usernameInput, userProfile?.username, userProfile?.usernameNormalized, checkUsernameAvailable]);

  const showNotification = (text: string, type: "success" | "error" = "success") => {
    setStatusMessage({ text, type });
    setTimeout(() => {
      setStatusMessage(null);
    }, 3500);
  };

  // Save Builder Identity to Firestore
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      showNotification("Please sign in to update settings.", "error");
      return;
    }

    setProfileSaving(true);
    try {
      // 1. Handle username / handle change if modified
      const normalizedNew = usernameInput.trim().toLowerCase();
      const normalizedOld =
        userProfile?.usernameNormalized || userProfile?.username?.toLowerCase();

      if (normalizedNew && normalizedNew !== normalizedOld) {
        if (handleAvailable === false) {
          showNotification(handleError || "This handle is unavailable.", "error");
          setProfileSaving(false);
          return;
        }

        const claimResult = await claimUsername(usernameInput.trim());
        if (!claimResult.success) {
          showNotification(claimResult.error || "Failed to update handle.", "error");
          setProfileSaving(false);
          return;
        }
      }

      // 2. Save profile details
      const skillsArray = skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      await updateUserProfile({
        displayName: displayName.trim() || user.displayName || "Builder",
        bio: bio.trim(),
        skills: skillsArray,
        githubUrl: githubUrl.trim(),
        linkedinUrl: linkedinUrl.trim(),
        portfolioUrl: portfolioUrl.trim(),
        username: usernameInput.trim(),
      });

      showNotification("Builder profile & handle @" + usernameInput.trim() + " saved successfully!");
    } catch (err: unknown) {
      console.error("Error saving profile:", err);
      showNotification("Failed to save profile changes.", "error");
    } finally {
      setProfileSaving(false);
    }
  };

  // Save Notification Preferences to Firestore
  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      showNotification("Please sign in to update notification preferences.", "error");
      return;
    }

    setPreferencesSaving(true);
    try {
      await updateUserProfile({
        notificationPreferences: {
          emailReminders,
          deadlineAlerts,
          teamInvites,
        },
      });

      showNotification("Notification preferences saved to Cloud Firestore!");
    } catch (err: unknown) {
      console.error("Error saving preferences:", err);
      showNotification("Failed to save notification preferences.", "error");
    } finally {
      setPreferencesSaving(false);
    }
  };

  // Force re-fetch from Firebase Cloud
  const handleForceCloudSync = async () => {
    setSyncingCloud(true);
    try {
      await refreshProfile();
      showNotification("Cloud synchronization complete. All data up to date!");
    } catch (err) {
      console.error("Cloud sync error:", err);
      showNotification("Sync completed with local cached state.", "success");
    } finally {
      setSyncingCloud(false);
    }
  };

  const currentPhotoURL =
    userProfile?.photoURL ||
    user?.photoURL ||
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBhiT-fS94BgDyhLpMJDlYKntQwDTUm9GXRHoiVTosSsB4dJcFlgij98ihCIA9eKt4Daqmt9AkiE0ly81jiXp5M6Dkn-fdqXxDh4fPTqH--D47WprzLQh2giEixqyAfOE4ZgDWE4h-rdqj9xSrFPAiyIgZrygAKd8SnJd7o53Rv4wtTqCertqG-fVNtRjNzvCfAduj-ZphmsOI8FXpM_acjUFkqhLVJxIjXT_TYDk2UCe-3HLHmYX8k";

  return (
    <div className="flex flex-col gap-8 w-full max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-outline-variant/20">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-primary text-2xl">
              tune
            </span>
            <h1 className="text-2xl font-bold text-on-surface">
              Account &amp; Workspace Settings
            </h1>
          </div>
          <p className="text-sm text-outline">
            Manage your builder profile, Firebase Storage assets, and cloud synchronization.
          </p>
        </div>

        <button
          onClick={handleForceCloudSync}
          disabled={syncingCloud}
          className="self-start sm:self-auto px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-on-surface text-xs font-mono font-medium flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
        >
          <span
            className={`material-symbols-outlined text-base ${
              syncingCloud ? "animate-spin text-primary" : "text-outline"
            }`}
          >
            sync
          </span>
          <span>{syncingCloud ? "Syncing..." : "Sync from Cloud"}</span>
        </button>
      </div>

      {/* Status Alert Banner */}
      {statusMessage && (
        <div
          className={`p-4 rounded-xl border flex items-center gap-3 text-xs font-mono font-medium transition-all ${
            statusMessage.type === "success"
              ? "bg-secondary/15 border-secondary/30 text-secondary"
              : "bg-error/15 border-error/30 text-error"
          }`}
        >
          <span className="material-symbols-outlined text-lg">
            {statusMessage.type === "success" ? "check_circle" : "error"}
          </span>
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Cloud Infrastructure Connection Badge */}
      <div className="p-4 rounded-2xl bg-surface-container-low/60 border border-outline-variant/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-xl">cloud_sync</span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-on-surface">
                Firebase Cloud Connected
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </div>
            <span className="font-mono text-[11px] text-outline">
              Storage: hackathonhub-314c2.firebasestorage.app
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-outline">
          <span className="px-2.5 py-1 rounded-md bg-surface-container border border-outline-variant/20">
            Firestore: live
          </span>
          <span className="px-2.5 py-1 rounded-md bg-surface-container border border-outline-variant/20">
            PWA: active
          </span>
        </div>
      </div>

      {/* 1. Profile Avatar Display (read-only, no uploads) */}
      <div className="p-6 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex flex-col gap-5">
        <div>
          <h2 className="text-base font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">
              photo_camera
            </span>
            Profile Photo &amp; Avatar
          </h2>
          <p className="text-xs text-outline mt-0.5">
            Your avatar comes from your Google sign-in account and is synced
            across all workspace views. Image uploads are disabled on this
            platform.
          </p>
        </div>

        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-primary/40 bg-surface-container-high relative shadow-[0_0_15px_rgba(160,120,255,0.2)]">
            <Image
              src={currentPhotoURL}
              alt={displayName || "Builder Avatar"}
              width={80}
              height={80}
              className="w-full h-full object-cover"
              unoptimized
            />
          </div>
          <span className="font-mono text-xs text-outline">
            {user?.email || "No email linked"}
          </span>
        </div>
      </div>

      {/* 2. Builder Identity Form */}
      <form
        onSubmit={handleSaveProfile}
        className="p-6 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex flex-col gap-5"
      >
        <div>
          <h2 className="text-base font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">
              badge
            </span>
            Builder Identity &amp; Handle
          </h2>
          <p className="text-xs text-outline mt-0.5">
            Public information visible to your teammates and hackathon squads.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-3.5 rounded-xl bg-surface-container border border-outline-variant/20">
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-mono text-xs text-outline uppercase block">
                Platform Handle *
              </label>
              {handleChecking && (
                <span className="text-[10px] font-mono text-primary animate-pulse">
                  Checking...
                </span>
              )}
              {handleAvailable === true && (
                <span className="text-[10px] font-mono text-secondary font-bold flex items-center gap-0.5">
                  <span className="material-symbols-outlined text-xs">check</span>
                  Available
                </span>
              )}
              {handleAvailable === false && (
                <span className="text-[10px] font-mono text-error font-bold flex items-center gap-0.5">
                  <span className="material-symbols-outlined text-xs">close</span>
                  Taken / Invalid
                </span>
              )}
            </div>

            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-outline select-none text-sm">
                @
              </span>
              <input
                type="text"
                required
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value.trim().toLowerCase())}
                placeholder="builder_handle"
                className="w-full pl-8 pr-3 py-2 rounded-lg bg-surface-container-low border border-outline-variant/40 text-primary font-mono text-sm font-bold focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            {handleError ? (
              <span className="text-[11px] text-error font-mono mt-1 block">
                {handleError}
              </span>
            ) : (
              <span className="text-[10px] text-outline font-mono mt-1 block">
                Letters, numbers, underscores (3-20 chars).
              </span>
            )}
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

        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-mono uppercase text-outline mb-1.5">
              Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. Alex Rivera"
              className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container border border-outline-variant/30 text-on-surface text-sm focus:outline-none focus:border-primary transition-colors font-sans"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-outline mb-1.5">
              Bio / Specialty
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="e.g. Full-stack engineer passionate about smart contracts, zero-knowledge proofs, and high-frequency hackathons."
              className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container border border-outline-variant/30 text-on-surface text-sm focus:outline-none focus:border-primary transition-colors resize-none font-sans"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-outline mb-1.5">
              Skills &amp; Tech Stack (comma separated)
            </label>
            <input
              type="text"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="React, TypeScript, Next.js, Solidity, Python, Tailwind"
              className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container border border-outline-variant/30 text-on-surface text-sm focus:outline-none focus:border-primary transition-colors font-sans"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-mono uppercase text-outline mb-1.5">
                GitHub URL
              </label>
              <input
                type="url"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="https://github.com/username"
                className="w-full px-3 py-2 rounded-xl bg-surface-container border border-outline-variant/30 text-on-surface text-xs focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-outline mb-1.5">
                LinkedIn URL
              </label>
              <input
                type="url"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                placeholder="https://linkedin.com/in/username"
                className="w-full px-3 py-2 rounded-xl bg-surface-container border border-outline-variant/30 text-on-surface text-xs focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-outline mb-1.5">
                Portfolio Website
              </label>
              <input
                type="url"
                value={portfolioUrl}
                onChange={(e) => setPortfolioUrl(e.target.value)}
                placeholder="https://myportfolio.dev"
                className="w-full px-3 py-2 rounded-xl bg-surface-container border border-outline-variant/30 text-on-surface text-xs focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={profileSaving}
            className="px-5 py-2.5 rounded-xl bg-primary-container text-on-primary-container text-xs font-semibold hover:bg-primary hover:text-on-primary transition-all shadow-[0_0_12px_rgba(160,120,255,0.4)] cursor-pointer disabled:opacity-50 flex items-center gap-2"
          >
            {profileSaving && (
              <span className="material-symbols-outlined text-sm animate-spin">
                progress_activity
              </span>
            )}
            <span>{profileSaving ? "Saving to Cloud..." : "Save Profile Details"}</span>
          </button>
        </div>
      </form>

      {/* 3. Notification Preferences Form */}
      <form
        onSubmit={handleSavePreferences}
        className="p-6 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex flex-col gap-5"
      >
        <div>
          <h2 className="text-base font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">
              notifications_active
            </span>
            Email &amp; In-App Notifications
          </h2>
          <p className="text-xs text-outline mt-0.5">
            Thresholds synced to your Firestore user document.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <label className="flex items-center justify-between p-3.5 rounded-xl bg-surface-container hover:bg-surface-container-high cursor-pointer transition-colors border border-outline-variant/15">
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-on-surface">
                Kickoff Event Date Reminders (7-Day &amp; 1-Day)
              </span>
              <span className="text-xs text-outline">
                Automated email alerts dispatched ahead of hackathon start times.
              </span>
            </div>
            <input
              type="checkbox"
              checked={emailReminders}
              onChange={(e) => setEmailReminders(e.target.checked)}
              className="w-4 h-4 rounded text-primary accent-primary cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-3.5 rounded-xl bg-surface-container hover:bg-surface-container-high cursor-pointer transition-colors border border-outline-variant/15">
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-on-surface">
                Registration Deadline Cutoff Alerts
              </span>
              <span className="text-xs text-outline">
                Critical warnings 48 hours and 2 hours prior to application close.
              </span>
            </div>
            <input
              type="checkbox"
              checked={deadlineAlerts}
              onChange={(e) => setDeadlineAlerts(e.target.checked)}
              className="w-4 h-4 rounded text-primary accent-primary cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-3.5 rounded-xl bg-surface-container hover:bg-surface-container-high cursor-pointer transition-colors border border-outline-variant/15">
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-on-surface">
                Team Invitations &amp; Squad Activity
              </span>
              <span className="text-xs text-outline">
                Get notified when invited to a squad or when a team member joins.
              </span>
            </div>
            <input
              type="checkbox"
              checked={teamInvites}
              onChange={(e) => setTeamInvites(e.target.checked)}
              className="w-4 h-4 rounded text-primary accent-primary cursor-pointer"
            />
          </label>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={preferencesSaving}
            className="px-5 py-2.5 rounded-xl bg-primary-container text-on-primary-container text-xs font-semibold hover:bg-primary hover:text-on-primary transition-all shadow-[0_0_12px_rgba(160,120,255,0.4)] cursor-pointer disabled:opacity-50 flex items-center gap-2"
          >
            {preferencesSaving && (
              <span className="material-symbols-outlined text-sm animate-spin">
                progress_activity
              </span>
            )}
            <span>{preferencesSaving ? "Saving..." : "Save Preferences"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
