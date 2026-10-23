"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "../../../lib/auth/AuthContext";
import { usernameSchema } from "../../../lib/validations";

export default function OnboardingPage() {
  const { user, userProfile, claimUsername, checkUsernameAvailable, loading } =
    useAuth();
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [checking, setChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    } else if (!loading && userProfile?.username) {
      router.push("/workspace");
    }
  }, [user, userProfile, loading, router]);

  // Real-time debounce check for username
  useEffect(() => {
    if (!username) {
      setIsAvailable(null);
      setValidationError(null);
      return;
    }

    const valResult = usernameSchema.safeParse(username);
    if (!valResult.success) {
      setValidationError(valResult.error.issues[0]?.message || "Invalid username");
      setIsAvailable(false);
      return;
    }

    setValidationError(null);
    setChecking(true);

    const timer = setTimeout(async () => {
      try {
        const available = await checkUsernameAvailable(username);
        setIsAvailable(available);
      } catch {
        setIsAvailable(true);
      } finally {
        setChecking(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [username, checkUsernameAvailable]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !isAvailable || submitting) return;

    setSubmitting(true);
    setSubmitError("");

    const res = await claimUsername(username);
    if (res.success) {
      router.push("/workspace");
    } else {
      setSubmitError(res.error || "Failed to claim username");
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col justify-between relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute -top-40 left-1/4 w-[600px] h-[600px] bg-secondary-container/15 rounded-full blur-[140px] -z-10"></div>
      <div className="pointer-events-none absolute bottom-0 right-1/4 w-[500px] h-[400px] bg-primary-container/10 rounded-full blur-[120px] -z-10"></div>

      {/* Top Header */}
      <div className="p-6 max-w-7xl mx-auto w-full flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg overflow-hidden bg-primary/10 flex items-center justify-center p-1 border border-outline-variant/40">
          <Image
            src="/icon.png"
            alt="Hackathon Hub Logo"
            width={32}
            height={32}
            className="w-full h-full object-contain"
          />
        </div>
        <span className="font-semibold text-lg tracking-tight text-on-surface">
          Hackathon Hub
        </span>
      </div>

      {/* Main Username Setup Card */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg p-8 rounded-2xl bg-surface-container-low border border-outline-variant/40 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center gap-2 mb-2 text-secondary font-mono text-xs uppercase tracking-wider font-semibold">
            <span className="material-symbols-outlined text-[16px]">badge</span>
            <span>Step 2 of 2: Profile Identity</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-on-surface tracking-tight mb-2">
            Choose your builder handle
          </h1>
          <p className="text-sm text-on-surface-variant mb-6 leading-relaxed">
            Your unique username gives you a shareable platform identity for squads, hackathon records, and trophies.
          </p>

          {submitError && (
            <div className="mb-4 p-3 rounded-xl bg-error-container/40 border border-error/40 text-error text-xs flex items-center gap-2">
              <span className="material-symbols-outlined text-base">error</span>
              <span>{submitError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block font-mono text-xs text-outline uppercase tracking-wider mb-2">
                Unique Username
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-outline select-none text-sm">
                  @
                </span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.trim())}
                  placeholder="alex_rivera"
                  className={`w-full pl-8 pr-10 py-3 rounded-xl bg-surface-container border text-sm font-mono text-on-surface placeholder:text-outline/50 focus:outline-none transition-colors ${
                    isAvailable === true
                      ? "border-secondary focus:border-secondary"
                      : isAvailable === false
                      ? "border-error focus:border-error"
                      : "border-outline-variant/40 focus:border-primary"
                  }`}
                  maxLength={20}
                  autoFocus
                />
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center">
                  {checking && (
                    <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
                  )}
                  {!checking && isAvailable === true && (
                    <span className="material-symbols-outlined text-secondary text-lg">
                      check_circle
                    </span>
                  )}
                  {!checking && isAvailable === false && (
                    <span className="material-symbols-outlined text-error text-lg">
                      cancel
                    </span>
                  )}
                </div>
              </div>

              {/* Status and Hint */}
              <div className="mt-2 flex items-center justify-between text-xs font-mono">
                {validationError ? (
                  <span className="text-error">{validationError}</span>
                ) : isAvailable === true ? (
                  <span className="text-secondary flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                    @{username} is available!
                  </span>
                ) : isAvailable === false && !checking ? (
                  <span className="text-error">Username is already taken.</span>
                ) : (
                  <span className="text-outline">
                    3-20 characters: letters, numbers, and underscores
                  </span>
                )}
                <span className="text-outline">{username.length}/20</span>
              </div>
            </div>

            {/* Handle Preview */}
            <div className="p-3.5 rounded-xl bg-surface-container-lowest/80 border border-outline-variant/20 flex items-center justify-between">
              <span className="font-mono text-xs text-outline">Public Profile URL</span>
              <span className="font-mono text-xs text-primary font-semibold truncate max-w-[220px]">
                hackathonhub.io/@{username || "your_handle"}
              </span>
            </div>

            <button
              type="submit"
              disabled={!isAvailable || submitting || checking}
              className="mt-2 w-full py-3.5 px-4 rounded-xl bg-primary-container text-on-primary-container font-semibold text-sm hover:bg-primary hover:text-on-primary transition-all duration-200 shadow-[0_0_24px_-4px_rgba(160,120,255,0.6)] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
            >
              {submitting ? (
                <span>Reserving Username...</span>
              ) : (
                <>
                  <span>Claim Handle &amp; Enter Workspace</span>
                  <span className="material-symbols-outlined text-base">
                    arrow_forward
                  </span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      <div className="p-6 text-center text-xs font-mono text-outline">
        © 2025 Hackathon Hub Inc.
      </div>
    </div>
  );
}
