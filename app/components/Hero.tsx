"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function Hero() {
  // Real-time countdown state (initialized to 3 days, 14 hours, 22 minutes, 40 seconds)
  const [timeLeft, setTimeLeft] = useState({
    days: 3,
    hours: 14,
    minutes: 22,
    seconds: 40,
  });

  useEffect(() => {
    let total =
      timeLeft.days * 86400 +
      timeLeft.hours * 3600 +
      timeLeft.minutes * 60 +
      timeLeft.seconds;

    const interval = setInterval(() => {
      if (total > 0) {
        total--;
        const d = Math.floor(total / 86400);
        const h = Math.floor((total % 86400) / 3600);
        const m = Math.floor((total % 3600) / 60);
        const s = total % 60;
        setTimeLeft({ days: d, hours: h, minutes: m, seconds: s });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatUnit = (n: number) => String(n).padStart(2, "0");

  return (
    <section className="relative w-full overflow-hidden px-4 sm:px-6 lg:px-8 pt-12 pb-20 md:py-24">
      {/* Atmospheric Ambient Glows */}
      <div className="pointer-events-none absolute -top-40 left-1/4 w-[600px] h-[600px] bg-primary-container/15 rounded-full blur-[140px] -z-10"></div>
      <div className="pointer-events-none absolute top-1/3 right-10 w-[480px] h-[480px] bg-secondary-container/10 rounded-full blur-[120px] -z-10"></div>
      <div
        className="pointer-events-none absolute inset-0 opacity-20 -z-10"
        style={{
          backgroundImage: "radial-gradient(#494454 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      ></div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Column: Copy & Value Proposition */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          {/* Top Status Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-surface-container-high/80 text-secondary w-fit backdrop-blur-md border border-outline-variant/30 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-secondary shadow-[0_0_8px_rgba(168,213,76,0.8)] animate-pulse"></span>
            <span className="font-mono text-xs tracking-wider uppercase font-semibold text-secondary-fixed">
              BUILT FOR THE NEXT GENERATION OF BUILDERS
            </span>
          </div>

          {/* Editorial Headline */}
          <div className="flex flex-col gap-2">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-on-surface leading-[1.08]">
              Build Together.
              <br />
              <span className="bg-gradient-to-r from-primary via-primary-fixed to-tertiary bg-clip-text text-transparent">
                Compete Everywhere.
              </span>
            </h1>
          </div>

          {/* Supporting Narrative Copy */}
          <p className="text-base sm:text-lg text-on-surface-variant max-w-xl leading-relaxed">
            Your team&apos;s home for every hackathon. Track deadlines, bring your
            builders together, and turn every sprint into your next big achievement.
          </p>

          {/* CTA Cluster */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              href="/workspace"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-primary-container text-on-primary-container text-base font-semibold hover:bg-primary hover:text-on-primary transition-all duration-200 shadow-[0_0_24px_-4px_rgba(160,120,255,0.6)] hover:shadow-[0_0_32px_-2px_rgba(160,120,255,0.85)] group cursor-pointer"
            >
              <span>Start Your Team</span>
              <span className="material-symbols-outlined transition-transform duration-200 group-hover:translate-x-1 text-xl">
                arrow_forward
              </span>
            </Link>
            <Link
              href="/workspace"
              className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-surface-container-high text-on-surface text-base font-medium hover:bg-surface-bright transition-all duration-200 border border-outline-variant/30"
            >
              <span className="material-symbols-outlined text-primary text-xl">
                explore
              </span>
              <span>Explore Platform</span>
            </Link>
          </div>

          {/* Micro Metadata Tagging */}
          <div className="flex flex-wrap items-center gap-6 pt-3 text-outline">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-[18px]">
                verified
              </span>
              <span className="font-mono text-xs uppercase tracking-wider text-on-surface-variant font-medium">
                Vercel &amp; GitHub Synced
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-tertiary text-[18px]">
                terminal
              </span>
              <span className="font-mono text-xs uppercase tracking-wider text-on-surface-variant font-medium">
                Multiplayer Terminal
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Developer Product Canvas */}
        <div className="lg:col-span-6 relative">
          <div className="relative w-full rounded-2xl bg-surface-container-low p-5 sm:p-6 shadow-2xl border border-outline-variant/40 backdrop-blur-xl">
            {/* Technical Header Bar */}
            <div className="flex items-center justify-between pb-3 mb-4 bg-surface-container-lowest/70 px-3.5 py-2 rounded-xl border border-outline-variant/30">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-error/80"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-secondary-container/80"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-secondary/80"></span>
                <span className="font-mono text-xs text-outline ml-1">
                  sprint_terminal::v2.4.active
                </span>
              </div>
              <div className="font-mono text-xs text-on-surface-variant/80 hidden sm:block">
                [LOC: 37.7749° N, 122.4194° W]
              </div>
            </div>

            {/* Component Grid: Nested Live Dashboard Modules */}
            <div className="flex flex-col gap-4">
              {/* Active Hackathon Card */}
              <div className="p-4 sm:p-5 rounded-xl bg-surface-container border border-outline-variant/30 transition-transform duration-300 hover:scale-[1.01]">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="inline-block px-2 py-0.5 rounded bg-primary/15 text-primary font-mono text-[11px] font-semibold tracking-wider">
                        GLOBAL SPRINT
                      </span>
                      <span className="font-mono text-[11px] text-secondary font-semibold">
                        $50,000 PRIZE POOL
                      </span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-on-surface">
                      Buildspace AI Sprint
                    </h3>
                  </div>

                  {/* Countdown Pill */}
                  <div className="flex flex-col items-end">
                    <span className="font-mono text-[10px] text-outline uppercase tracking-wider">
                      Hacking Window
                    </span>
                    <div className="flex items-center gap-1 font-mono text-sm sm:text-base font-bold text-secondary bg-surface-container-lowest/80 px-2 py-1 rounded border border-secondary/20">
                      <span className="w-2 h-2 rounded-full bg-secondary animate-ping mr-1"></span>
                      <span>
                        {formatUnit(timeLeft.days)}d {formatUnit(timeLeft.hours)}h{" "}
                        {formatUnit(timeLeft.minutes)}m {formatUnit(timeLeft.seconds)}s
                      </span>
                    </div>
                  </div>
                </div>

                {/* Tags and Live Status */}
                <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-outline-variant/20">
                  <span className="px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant font-mono text-xs">
                    #LLMs
                  </span>
                  <span className="px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant font-mono text-xs">
                    #FullStack
                  </span>
                  <span className="px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant font-mono text-xs">
                    #MultiModal
                  </span>
                  <span className="ml-auto font-mono text-xs text-outline flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px] text-tertiary">
                      groups
                    </span>
                    420 Teams Battling
                  </span>
                </div>
              </div>

              {/* Team Activity Panel + Live Code Sync Preview */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Team QuantumForge Active Module */}
                <div className="p-4 rounded-xl bg-surface-container-high border border-outline-variant/20 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-mono text-[11px] uppercase tracking-wider text-outline">
                        Active Squad
                      </span>
                      <span className="inline-flex items-center gap-1 text-secondary font-mono text-xs font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                        4 Online
                      </span>
                    </div>
                    <div className="text-base font-semibold text-on-surface mb-1">
                      Team QuantumForge
                    </div>
                    <div className="flex items-center gap-1.5 text-outline font-mono text-xs mb-3 truncate">
                      <span className="material-symbols-outlined text-[14px]">
                        code
                      </span>
                      <span className="truncate">quantum-forge/neuro-sync</span>
                    </div>
                  </div>

                  {/* Avatar Stack + Deploy Trigger */}
                  <div className="flex items-center justify-between pt-2 border-t border-outline-variant/30">
                    <div className="flex -space-x-2">
                      <div className="w-7 h-7 rounded-full overflow-hidden ring-2 ring-surface-container-high">
                        <Image
                          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCmjlqEEmqDoqRraSdopujrSyRVqw5_d8fZV7AyK-dlHkt9tLLxBmUc5tWn9U_j679SrqiQ2APTaj04na4HWIDVx88i0mKNFIVwJwCXlLzc5TcZFKJxJYWU2bkzjGbctcWp0-x6gXSDIoRPYhnukaIFe7OvxX050PobcnrgbOl_39FJL12fS7zc_W5ST9XYDlZIuwDTZ5RIr6Z8pF_XJq2ocq6CH2yHvvY-_Rtof6kODRYJwgFfb-jj"
                          alt="Engineer"
                          width={28}
                          height={28}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="w-7 h-7 rounded-full overflow-hidden ring-2 ring-surface-container-high">
                        <Image
                          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCAB9jP3pPCX1BQvlW4Fqt_RW6H2-u5mSYWpB0W73kXVqQ__wushtSf5JHaY5FVdmhBy-S6_F5KZqJWdqT9hspccs7i392kv4GgJEIWVFerCLRETcxw39awcImHxa9FGHzhTWwpOw2-tdbR4s1b6PZBkD2KlIVBbgNpFVzL5uUzokcKODVTwkSz2yI0zR1HiJ1OQJh05lCfteprKmFcJacjrK_5GW5LrKEwzyldFcK3FHUeUSCAFrPL"
                          alt="Developer"
                          width={28}
                          height={28}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="w-7 h-7 rounded-full overflow-hidden ring-2 ring-surface-container-high">
                        <Image
                          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCF2Y51jXt_f6FK55dmWFjHRpQkCHHgI60C48WfvE4QHo5g767g8hW15YB7Wohyu8_TbxYJcuuiJ1PFsHb1vgC4pk6o0-us7LduevgtPVOu65u3Jnpo4aWDtpFQcrcXhKRykh8-XHAbd8HpxG6YAJ6L9yqhnm7gTD182F7-LZoRWYlQyYeEhFOF9akGfgmAjiFkjjPknOdML0bRFKdkanU5NMOHp_ud92tB_qIMk-j9DzSNQZCVlcB1"
                          alt="Designer"
                          width={28}
                          height={28}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="w-7 h-7 rounded-full bg-primary-container text-on-primary-container font-mono text-xs flex items-center justify-center font-bold ring-2 ring-surface-container-high">
                        +1
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-surface-container-lowest text-secondary font-mono text-[11px]">
                      main: 12m ago
                    </span>
                  </div>
                </div>

                {/* Milestone Sprint Calendar & Alert Pill */}
                <div className="p-4 rounded-xl bg-surface-container-high border border-outline-variant/20 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-mono text-[11px] uppercase tracking-wider text-outline">
                        Submission Radar
                      </span>
                      <span className="material-symbols-outlined text-error text-[18px]">
                        emergency
                      </span>
                    </div>
                    {/* Critical Alert Banner */}
                    <div className="p-2 rounded-lg bg-secondary/10 border border-secondary/20 flex items-center gap-2 mb-3">
                      <span className="material-symbols-outlined text-secondary text-[16px]">
                        schedule
                      </span>
                      <span className="font-mono text-xs text-secondary-fixed font-semibold">
                        Submission Cutoff in 42 hours
                      </span>
                    </div>
                  </div>

                  {/* Sprint Mini Progress Stepper */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-outline font-mono text-xs">
                      <span>Sprint Milestones</span>
                      <span className="text-on-surface font-semibold">
                        3/4 Completed
                      </span>
                    </div>
                    <div className="w-full bg-surface-container-lowest h-2 rounded-full overflow-hidden flex">
                      <div className="bg-primary h-full w-3/4 rounded-full transition-all duration-500"></div>
                    </div>
                    <div className="flex justify-between font-mono text-[10px] text-outline pt-1">
                      <span className="text-secondary font-medium">• Idea</span>
                      <span className="text-secondary font-medium">• Alpha</span>
                      <span className="text-primary font-medium">• Pitch Deck</span>
                      <span className="text-outline">• Final Push</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Terminal Streamer Excerpt */}
              <div className="p-3 rounded-xl bg-surface-container-lowest font-mono text-xs flex items-center justify-between text-outline border border-outline-variant/30">
                <div className="flex items-center gap-2 truncate">
                  <span className="text-primary font-bold">&gt;</span>
                  <span className="text-on-surface truncate">
                    neuro-sync@0.9.4: Build finished in 3.42s • Edge artifacts uploaded
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded bg-surface-container-high text-secondary text-[10px] font-bold shrink-0 ml-2">
                  READY
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
