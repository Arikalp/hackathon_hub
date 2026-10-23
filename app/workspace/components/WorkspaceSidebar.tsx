"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "../../../lib/auth/AuthContext";

interface WorkspaceSidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  activeTeamName?: string;
}

export default function WorkspaceSidebar({
  currentTab,
  setCurrentTab,
  mobileOpen,
  setMobileOpen,
  activeTeamName = "No Team Selected",
}: WorkspaceSidebarProps) {
  const { user, userProfile, signOutUser } = useAuth();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  interface NavItem {
    id: string;
    label: string;
    icon: string;
    badge?: string;
  }

  const navItems: NavItem[] = [
    { id: "overview", label: "Overview", icon: "dashboard" },
    { id: "my-teams", label: "My Teams", icon: "groups" },
    { id: "hackathon-tracker", label: "Hackathon Tracker", icon: "trophy" },
    { id: "calendar", label: "Calendar", icon: "calendar_month" },
    {
      id: "notifications",
      label: "Notifications",
      icon: "notifications",
    },
    { id: "achievements", label: "Achievements", icon: "military_tech" },
    { id: "settings", label: "Settings", icon: "tune" },
  ];

  const displayName =
    userProfile?.displayName ||
    user?.displayName ||
    (user?.email ? user.email.split("@")[0] : "Builder");
  const userHandle = userProfile?.username
    ? `@${userProfile.username}`
    : user?.email
    ? `@${user.email.split("@")[0]}`
    : "@builder";
  const photo = userProfile?.photoURL || user?.photoURL || null;

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed left-0 top-0 h-full w-64 bg-surface-container-low border-r border-outline-variant/30 z-50 flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col">
          {/* Logo & Platform Tag */}
          <div className="h-16 px-4 flex items-center justify-between border-b border-outline-variant/20">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg overflow-hidden bg-primary/10 flex items-center justify-center p-1 border border-outline-variant/40">
                <Image
                  src="/icon.png"
                  alt="Hackathon Hub Logo"
                  width={32}
                  height={32}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-semibold tracking-tight text-on-surface text-base leading-tight">
                  Hackathon Hub
                </span>
                <span className="font-mono text-[10px] text-outline tracking-wider uppercase">
                  BUILDER OS
                </span>
              </div>
            </Link>

            {/* Mobile close button */}
            <button
              onClick={() => setMobileOpen(false)}
              className="lg:hidden p-1 text-outline hover:text-on-surface"
              aria-label="Close sidebar"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>

          {/* Team Switcher Selector */}
          <div className="px-3 py-3">
            <button
              onClick={() => setCurrentTab("my-teams")}
              className="w-full flex items-center justify-between px-3 py-2 bg-surface-container rounded-lg border border-outline-variant/30 hover:border-outline-variant/60 cursor-pointer transition-colors group text-left"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="material-symbols-outlined text-primary text-base">
                  hub
                </span>
                <span className="font-mono text-xs text-on-surface font-medium truncate max-w-[120px]">
                  {activeTeamName}
                </span>
              </div>
              <span className="material-symbols-outlined text-outline text-sm group-hover:text-on-surface">
                unfold_more
              </span>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1 px-2 mt-1">
            {navItems.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentTab(item.id);
                    setMobileOpen(false);
                  }}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? "bg-surface-container-high text-primary border-l-2 border-primary shadow-sm"
                      : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`material-symbols-outlined text-lg ${
                        isActive ? "text-primary" : "text-outline"
                      }`}
                    >
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="font-mono text-xs px-1.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-semibold">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Profile Mini Bar with Dropdown */}
        <div className="p-3 border-t border-outline-variant/20 bg-surface-container-lowest/50 relative">
          {profileMenuOpen && (
            <div className="absolute bottom-full left-3 right-3 mb-2 p-2 rounded-xl bg-surface-container-high border border-outline-variant/40 shadow-xl flex flex-col gap-1 z-30">
              {user ? (
                <>
                  <div className="px-3 py-1.5 text-xs font-mono text-outline border-b border-outline-variant/20 truncate">
                    {user.email}
                  </div>
                  <Link
                    href="/onboarding"
                    onClick={() => setProfileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded text-xs text-on-surface hover:bg-surface-container"
                  >
                    <span className="material-symbols-outlined text-sm">badge</span>
                    <span>Change Username</span>
                  </Link>
                  <button
                    onClick={async () => {
                      await signOutUser();
                      setProfileMenuOpen(false);
                    }}
                    className="flex items-center gap-2 px-3 py-1.5 rounded text-xs text-error hover:bg-error-container/20 text-left cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">logout</span>
                    <span>Sign Out</span>
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setProfileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded text-xs text-primary font-semibold hover:bg-surface-container text-left"
                >
                  <span className="material-symbols-outlined text-sm">login</span>
                  <span>Sign In with Google</span>
                </Link>
              )}
            </div>
          )}

          <div className="flex items-center justify-between">
            <div
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              className="flex items-center gap-2.5 min-w-0 cursor-pointer group flex-1"
            >
              <div className="relative flex-shrink-0">
                {photo ? (
                  <Image
                    src={photo}
                    alt="Profile"
                    width={36}
                    height={36}
                    className="w-9 h-9 rounded-full object-cover ring-1 ring-outline-variant/40 group-hover:ring-primary/60 transition-all"
                    unoptimized
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-primary/20 text-primary font-mono font-bold text-xs flex items-center justify-center ring-1 ring-outline-variant/40">
                    {displayName.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-secondary ring-2 ring-surface-container-low"></span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-on-surface truncate group-hover:text-primary transition-colors">
                  {displayName}
                </span>
                <span className="font-mono text-[10px] text-outline truncate">
                  {userHandle}
                </span>
              </div>
            </div>

            <button
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              className="text-outline hover:text-on-surface p-1 rounded hover:bg-surface-container"
              type="button"
              aria-label="Profile options"
            >
              <span className="material-symbols-outlined text-lg">more_vert</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
