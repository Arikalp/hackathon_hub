"use client";

import { useState } from "react";
import Link from "next/link";

export default function CtaSection() {
  const [copied, setCopied] = useState(false);
  const command = "npx create-hackathon-team@latest";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <section className="relative w-full px-4 sm:px-6 lg:px-8 py-24 md:py-32 overflow-hidden bg-background">
      {/* Concentrated Atmospheric Glow */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-primary/10 rounded-full blur-[140px] -z-10"></div>
      <div className="pointer-events-none absolute bottom-0 left-1/3 w-[500px] h-[300px] bg-secondary-container/10 rounded-full blur-[100px] -z-10"></div>

      <div className="max-w-4xl mx-auto flex flex-col items-center text-center gap-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-surface-container-high text-secondary text-xs font-semibold border border-secondary/20">
          <span className="material-symbols-outlined text-[14px]">bolt</span>
          <span>ZERO FRICTION SETUP</span>
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-on-surface">
            Your next build starts
            <br />
            <span className="bg-gradient-to-r from-primary-fixed to-secondary-fixed bg-clip-text text-transparent">
              with your team.
            </span>
          </h2>
          <p className="text-base sm:text-lg text-on-surface-variant max-w-xl mx-auto leading-relaxed">
            Make every hackathon count. From ideation to the winner&apos;s podium. Assemble your squad in less than 60 seconds.
          </p>
        </div>

        {/* Action Button */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
          <Link
            href="/workspace"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-primary-container text-on-primary-container text-base font-bold hover:bg-primary hover:text-on-primary transition-all duration-200 shadow-[0_0_32px_-4px_rgba(160,120,255,0.7)] hover:shadow-[0_0_40px_-2px_rgba(160,120,255,0.9)] cursor-pointer"
          >
            <span>Create Your Free Team</span>
            <span className="material-symbols-outlined text-xl">group_add</span>
          </Link>
        </div>

        {/* CLI Snippet Box with Copy Action */}
        <div className="w-full max-w-md p-1.5 rounded-xl bg-surface-container-low border border-outline-variant/30 flex items-center justify-between shadow-inner">
          <div className="flex items-center gap-2.5 px-3 font-mono text-xs sm:text-sm text-on-surface overflow-hidden">
            <span className="text-primary font-bold select-none">$</span>
            <span className="truncate">{command}</span>
          </div>
          <button
            onClick={handleCopy}
            className={`px-3.5 py-1.5 rounded-lg font-mono text-xs flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
              copied
                ? "bg-secondary text-on-secondary font-bold"
                : "bg-surface-container-high hover:bg-surface-bright text-on-surface border border-outline-variant/20"
            }`}
            aria-label="Copy CLI Command"
          >
            <span className="material-symbols-outlined text-[14px]">
              {copied ? "check" : "content_copy"}
            </span>
            <span>{copied ? "Copied!" : "Copy"}</span>
          </button>
        </div>

        <span className="font-mono text-xs text-outline">
          Free forever for public open-source teams • No credit card required
        </span>
      </div>
    </section>
  );
}
