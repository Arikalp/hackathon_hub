"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "../../lib/auth/AuthContext";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, userProfile } = useAuth();

  const isLoggedIn = Boolean(user);
  const profilePhoto =
    user?.photoURL ||
    userProfile?.photoURL ||
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBhiT-fS94BgDyhLpMJDlYKntQwDTUm9GXRHoiVTosSsB4dJcFlgij98ihCIA9eKt4Daqmt9AkiE0ly81jiXp5M6Dkn-fdqXxDh4fPTqH--D47WprzLQh2giEixqyAfOE4ZgDWE4h-rdqj9xSrFPAiyIgZrygAKd8SnJd7o53Rv4wtTqCertqG-fVNtRjNzvCfAduj-ZphmsOI8FXpM_acjUFkqhLVJxIjXT_TYDk2UCe-3HLHmYX8k";

  return (
    <header className="fixed top-0 w-full z-50 bg-[#0c0e13]/85 backdrop-blur-xl border-b border-outline-variant/30">
      <div className="h-16 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-primary/10 flex items-center justify-center p-1 border border-outline-variant/40 group-hover:border-primary/50 transition-colors">
              <Image
                src="/icon.png"
                alt="Hackathon Hub Logo"
                width={32}
                height={32}
                className="w-full h-full object-contain"
                priority
              />
            </div>
            <span className="font-semibold text-lg tracking-tight text-on-surface group-hover:text-primary transition-colors">
              Hackathon Hub
            </span>
          </Link>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
          {isLoggedIn ? (
            <Link
              href="/workspace"
              className="text-sm text-primary font-medium hover:text-on-surface transition-colors flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">dashboard</span>
              <span>Workspace</span>
            </Link>
          ) : (
            <Link
              href="/login"
              className="text-sm text-primary font-medium hover:text-on-surface transition-colors flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">rocket_launch</span>
              <span>Get Started</span>
            </Link>
          )}

          <a
            href="#hall-of-builders"
            className="text-sm text-on-surface-variant hover:text-on-surface transition-colors"
          >
            Builders
          </a>
        </nav>

        {/* Right CTA Cluster */}
        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <Link
              href="/workspace"
              className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-primary-container text-on-primary-container text-sm font-semibold hover:bg-primary hover:text-on-primary transition-all duration-200 shadow-[0_0_16px_-2px_rgba(160,120,255,0.4)] hover:shadow-[0_0_24px_-2px_rgba(160,120,255,0.7)]"
            >
              Workspace
            </Link>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-primary-container text-on-primary-container text-sm font-semibold hover:bg-primary hover:text-on-primary transition-all duration-200 shadow-[0_0_16px_-2px_rgba(160,120,255,0.4)] hover:shadow-[0_0_24px_-2px_rgba(160,120,255,0.7)]"
            >
              Get Started
            </Link>
          )}

          {/* User Profile Picture */}
          <Link
            href={isLoggedIn ? "/workspace" : "/login"}
            className="relative group cursor-pointer hidden xs:block"
            title={isLoggedIn ? (user?.displayName || "My Profile") : "Sign In"}
          >
            <div className="w-8 h-8 rounded-full overflow-hidden ring-1 ring-outline-variant/40 group-hover:ring-primary/60 transition-all bg-surface-container">
              <Image
                src={profilePhoto}
                alt={user?.displayName || "Profile"}
                width={32}
                height={32}
                className="w-full h-full object-cover"
              />
            </div>
            {isLoggedIn && (
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-secondary rounded-full ring-2 ring-background"></span>
            )}
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-on-surface-variant hover:text-on-surface focus:outline-none"
            aria-label="Toggle Navigation Menu"
          >
            <span className="material-symbols-outlined text-2xl">
              {mobileMenuOpen ? "close" : "menu"}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 py-4 bg-surface-container-low border-b border-outline-variant/30 flex flex-col gap-3">
          {isLoggedIn ? (
            <Link
              href="/workspace"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium py-2 px-3 rounded-lg hover:bg-surface-container text-primary flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[16px]">dashboard</span>
              <span>Workspace</span>
            </Link>
          ) : (
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium py-2 px-3 rounded-lg hover:bg-surface-container text-primary flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[16px]">rocket_launch</span>
              <span>Get Started</span>
            </Link>
          )}
          <a
            href="#hall-of-builders"
            onClick={() => setMobileMenuOpen(false)}
            className="text-sm font-medium py-2 px-3 rounded-lg hover:bg-surface-container text-on-surface"
          >
            Builders
          </a>
        </div>
      )}
    </header>
  );
}
