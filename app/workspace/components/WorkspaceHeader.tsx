"use client";

import Image from "next/image";

interface WorkspaceHeaderProps {
  onOpenAddModal: () => void;
  onOpenMobileSidebar: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

export default function WorkspaceHeader({
  onOpenAddModal,
  onOpenMobileSidebar,
  searchQuery,
  setSearchQuery,
}: WorkspaceHeaderProps) {
  return (
    <header className="fixed top-0 left-0 lg:left-64 right-0 h-16 bg-[#0c0e13]/85 backdrop-blur-xl border-b border-outline-variant/30 z-40 flex items-center justify-between px-4 sm:px-6">
      {/* Mobile Toggle + Search Box */}
      <div className="flex items-center gap-3 flex-1 max-w-lg">
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-1.5 text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-lg"
          aria-label="Open sidebar"
        >
          <span className="material-symbols-outlined text-xl">menu</span>
        </button>

        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-outline text-lg">
            search
          </span>
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 pl-9 pr-12 bg-surface-container rounded-lg border border-outline-variant/40 text-on-surface placeholder:text-outline text-xs sm:text-sm focus:outline-none focus:border-primary transition-colors"
            placeholder="Search commands, hackathons, repos..."
            type="text"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none hidden sm:flex">
            <kbd className="font-mono text-[10px] bg-surface-container-highest px-1.5 py-0.5 rounded text-outline border border-outline-variant/30 font-semibold">
              ⌘K
            </kbd>
          </div>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3 sm:gap-4 ml-3">
        {/* Network Status Pill */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary/10 border border-secondary/30">
          <span className="w-1.5 h-1.5 rounded-full bg-secondary shadow-[0_0_8px_rgba(168,213,76,0.6)] animate-pulse"></span>
          <span className="font-mono text-xs text-secondary font-medium">
            Mainnet Active
          </span>
        </div>

        {/* Notifications Icon with Unread Dot */}
        <button
          className="relative p-2 text-outline hover:text-on-surface hover:bg-surface-container-high rounded-lg transition-colors"
          type="button"
          aria-label="Notifications"
        >
          <span className="material-symbols-outlined text-xl">notifications</span>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary ring-2 ring-background"></span>
        </button>

        {/* Add Hackathon Button */}
        <button
          onClick={onOpenAddModal}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-primary-container text-on-primary-container text-xs sm:text-sm font-semibold hover:bg-primary hover:text-on-primary transition-all duration-200 shadow-[0_0_12px_-2px_rgba(160,120,255,0.4)] cursor-pointer active:scale-95 shrink-0"
        >
          <span className="material-symbols-outlined text-base">add</span>
          <span className="hidden xs:inline">Add Hackathon</span>
          <span className="xs:hidden">Add</span>
        </button>

        {/* User Avatar */}
        <div className="flex items-center pl-1">
          <Image
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBhiT-fS94BgDyhLpMJDlYKntQwDTUm9GXRHoiVTosSsB4dJcFlgij98ihCIA9eKt4Daqmt9AkiE0ly81jiXp5M6Dkn-fdqXxDh4fPTqH--D47WprzLQh2giEixqyAfOE4ZgDWE4h-rdqj9xSrFPAiyIgZrygAKd8SnJd7o53Rv4wtTqCertqG-fVNtRjNzvCfAduj-ZphmsOI8FXpM_acjUFkqhLVJxIjXT_TYDk2UCe-3HLHmYX8k"
            alt="Profile"
            width={32}
            height={32}
            className="w-8 h-8 rounded-full object-cover ring-1 ring-outline-variant/40"
          />
        </div>
      </div>
    </header>
  );
}
