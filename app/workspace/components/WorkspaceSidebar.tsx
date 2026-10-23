"use client";

import Image from "next/image";
import Link from "next/link";

interface WorkspaceSidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export default function WorkspaceSidebar({
  currentTab,
  setCurrentTab,
  mobileOpen,
  setMobileOpen,
}: WorkspaceSidebarProps) {
  const navItems = [
    { id: "overview", label: "Overview", icon: "dashboard" },
    { id: "my-teams", label: "My Teams", icon: "groups" },
    { id: "hackathon-tracker", label: "Hackathon Tracker", icon: "trophy" },
    { id: "calendar", label: "Calendar", icon: "calendar_month" },
    {
      id: "notifications",
      label: "Notifications",
      icon: "notifications",
      badge: "3",
    },
    { id: "achievements", label: "Achievements", icon: "military_tech" },
    { id: "settings", label: "Settings", icon: "tune" },
  ];

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
                  src="https://lh3.googleusercontent.com/aida/AEtjO1XgcjrcHVRsDjhC1Rjzsa0s-pjxLr4jaNpETpIKiTrasziLVPghl-IkckR6BCMhFsIfmehPId3cdAieb6XL0O6658csKDnCg30orvSVFNIVeim6jQS9p5Tc34YOsFZ9dg-yFYbD-WdGLRfMInvlWyk4Lc6xS98-obFvMFvAD-2WQR0xnrv88jH5W30USblOgiZMx3fVQ3y8uHqcy_8xNFzXT0SL81NWDEDleffgUj9GyXo01_cNgIwjz1s"
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
            <div className="flex items-center justify-between px-3 py-2 bg-surface-container rounded-lg border border-outline-variant/30 hover:border-outline-variant/60 cursor-pointer transition-colors group">
              <div className="flex items-center gap-2 min-w-0">
                <span className="material-symbols-outlined text-primary text-base">
                  hub
                </span>
                <span className="font-mono text-xs text-on-surface font-medium truncate max-w-[120px]">
                  NovaLogic Squad
                </span>
              </div>
              <span className="material-symbols-outlined text-outline text-sm group-hover:text-on-surface">
                unfold_more
              </span>
            </div>
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

        {/* User Profile Mini Bar */}
        <div className="p-3 border-t border-outline-variant/20 bg-surface-container-lowest/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative flex-shrink-0">
                <Image
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBhiT-fS94BgDyhLpMJDlYKntQwDTUm9GXRHoiVTosSsB4dJcFlgij98ihCIA9eKt4Daqmt9AkiE0ly81jiXp5M6Dkn-fdqXxDh4fPTqH--D47WprzLQh2giEixqyAfOE4ZgDWE4h-rdqj9xSrFPAiyIgZrygAKd8SnJd7o53Rv4wtTqCertqG-fVNtRjNzvCfAduj-ZphmsOI8FXpM_acjUFkqhLVJxIjXT_TYDk2UCe-3HLHmYX8k"
                  alt="Profile"
                  width={36}
                  height={36}
                  className="w-9 h-9 rounded-full object-cover ring-1 ring-outline-variant/40"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-secondary ring-2 ring-surface-container-low"></span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-on-surface truncate">
                  alex.dev
                </span>
                <span className="font-mono text-[10px] text-outline truncate">
                  @alexrivera.eth
                </span>
              </div>
            </div>
            <button
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
