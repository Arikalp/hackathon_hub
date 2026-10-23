"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "../../../lib/auth/AuthContext";

export default function LoginPage() {
  const {
    user,
    userProfile,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    resetPassword,
    loading,
  } = useAuth();
  const router = useRouter();

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [infoMsg, setInfoMsg] = useState("");
  const [showForgot, setShowForgot] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      if (userProfile?.username) {
        router.push("/workspace");
      } else {
        router.push("/onboarding");
      }
    }
  }, [user, userProfile, loading, router]);

  const handleGoogleSignIn = async () => {
    setErrorMsg("");
    setInfoMsg("");
    setSubmitting(true);
    try {
      await signInWithGoogle();
    } catch (err: unknown) {
      console.error(err);
      setErrorMsg("Google sign in was cancelled or failed.");
      setSubmitting(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setInfoMsg("");

    if (!email || !password) {
      setErrorMsg("Please fill in all required fields.");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }

    setSubmitting(true);
    try {
      if (mode === "signin") {
        await signInWithEmail(email, password);
      } else {
        await signUpWithEmail(email, password, name);
      }
    } catch (err: unknown) {
      console.error(err);
      const code = (err as { code?: string }).code;
      if (code === "auth/invalid-credential" || code === "auth/wrong-password") {
        setErrorMsg("Invalid email or password.");
      } else if (code === "auth/email-already-in-use") {
        setErrorMsg("An account with this email already exists. Try signing in.");
      } else if (code === "auth/weak-password") {
        setErrorMsg("Password is too weak. Please use at least 6 characters.");
      } else if (code === "auth/user-not-found") {
        setErrorMsg("No account found with this email. Please sign up.");
      } else {
        setErrorMsg(
          (err as { message?: string }).message ||
            "Authentication failed. Please verify your details."
        );
      }
      setSubmitting(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg("Please enter your email address to reset password.");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");
    try {
      await resetPassword(email);
      setInfoMsg(`Password reset link sent to ${email}! Check your inbox.`);
      setShowForgot(false);
    } catch (err: unknown) {
      setErrorMsg(
        (err as { message?: string }).message || "Failed to send reset email."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col justify-between relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute -top-40 left-1/3 w-[600px] h-[600px] bg-primary-container/15 rounded-full blur-[140px] -z-10"></div>
      <div className="pointer-events-none absolute bottom-0 right-1/4 w-[500px] h-[400px] bg-secondary-container/10 rounded-full blur-[120px] -z-10"></div>

      {/* Top Brand Nav */}
      <div className="p-6 max-w-7xl mx-auto w-full flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-lg overflow-hidden bg-primary/10 flex items-center justify-center p-1 border border-outline-variant/40 group-hover:border-primary/50 transition-colors">
            <Image
              src="https://lh3.googleusercontent.com/aida/AEtjO1XgcjrcHVRsDjhC1Rjzsa0s-pjxLr4jaNpETpIKiTrasziLVPghl-IkckR6BCMhFsIfmehPId3cdAieb6XL0O6658csKDnCg30orvSVFNIVeim6jQS9p5Tc34YOsFZ9dg-yFYbD-WdGLRfMInvlWyk4Lc6xS98-obFvMFvAD-2WQR0xnrv88jH5W30USblOgiZMx3fVQ3y8uHqcy_8xNFzXT0SL81NWDEDleffgUj9GyXo01_cNgIwjz1s"
              alt="Hackathon Hub Logo"
              width={32}
              height={32}
              className="w-full h-full object-contain"
            />
          </div>
          <span className="font-semibold text-lg tracking-tight text-on-surface">
            Hackathon Hub
          </span>
        </Link>
        <Link
          href="/"
          className="text-xs font-mono text-outline hover:text-on-surface transition-colors"
        >
          ← Back to Home
        </Link>
      </div>

      {/* Main Login Card */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md p-6 sm:p-8 rounded-2xl bg-surface-container-low border border-outline-variant/40 shadow-2xl backdrop-blur-xl relative">
          {/* Toggle between Sign In & Sign Up */}
          <div className="grid grid-cols-2 p-1 rounded-xl bg-surface-container mb-6 border border-outline-variant/30">
            <button
              type="button"
              onClick={() => {
                setMode("signin");
                setErrorMsg("");
                setInfoMsg("");
              }}
              className={`py-2 text-xs font-mono font-bold rounded-lg transition-all ${
                mode === "signin"
                  ? "bg-surface-container-highest text-primary shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("signup");
                setErrorMsg("");
                setInfoMsg("");
              }}
              className={`py-2 text-xs font-mono font-bold rounded-lg transition-all ${
                mode === "signup"
                  ? "bg-surface-container-highest text-primary shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              Create Account
            </button>
          </div>

          <div className="flex flex-col items-center text-center gap-1.5 mb-6">
            <h1 className="text-2xl font-bold tracking-tight text-on-surface">
              {mode === "signin"
                ? "Sign in to Hackathon Hub"
                : "Create your builder account"}
            </h1>
            <p className="text-xs sm:text-sm text-on-surface-variant max-w-xs">
              {mode === "signin"
                ? "Access your teams, upcoming hackathons, and sprint calendar."
                : "Join thousands of competitive builders and assemble your squad."}
            </p>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-error-container/40 border border-error/40 text-error text-xs flex items-center gap-2">
              <span className="material-symbols-outlined text-base shrink-0">
                error
              </span>
              <span>{errorMsg}</span>
            </div>
          )}

          {infoMsg && (
            <div className="mb-4 p-3 rounded-xl bg-secondary/15 border border-secondary/30 text-secondary text-xs flex items-center gap-2">
              <span className="material-symbols-outlined text-base shrink-0">
                check_circle
              </span>
              <span>{infoMsg}</span>
            </div>
          )}

          {/* Email / Password Form */}
          <form onSubmit={handleEmailAuth} className="flex flex-col gap-3.5 mb-5">
            {mode === "signup" && (
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-outline mb-1">
                  Full Name / Nickname
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Rivera"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container border border-outline-variant/40 text-on-surface text-sm focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-outline mb-1">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@domain.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container border border-outline-variant/40 text-on-surface text-sm focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-mono uppercase tracking-wider text-outline">
                  Password *
                </label>
                {mode === "signin" && (
                  <button
                    type="button"
                    onClick={() => setShowForgot(!showForgot)}
                    className="text-[11px] font-mono text-primary hover:underline"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container border border-outline-variant/40 text-on-surface text-sm focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="mt-1 w-full py-3 rounded-xl bg-primary-container text-on-primary-container font-semibold text-sm hover:bg-primary hover:text-on-primary transition-all duration-200 shadow-[0_0_20px_-4px_rgba(160,120,255,0.5)] cursor-pointer disabled:opacity-50"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-on-primary-container border-t-transparent rounded-full animate-spin"></span>
                  Processing...
                </span>
              ) : mode === "signin" ? (
                "Sign In with Email"
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          {/* Forgot Password Accordion */}
          {showForgot && mode === "signin" && (
            <div className="mb-5 p-4 rounded-xl bg-surface-container border border-outline-variant/30 flex flex-col gap-2">
              <span className="text-xs font-semibold text-on-surface">
                Reset your password
              </span>
              <p className="text-[11px] text-outline">
                Enter your email above and click Send Reset Link.
              </p>
              <button
                type="button"
                onClick={handleForgotPassword}
                disabled={submitting}
                className="px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-bright text-primary text-xs font-mono font-medium self-start"
              >
                Send Password Reset Email
              </button>
            </div>
          )}

          {/* Divider */}
          <div className="relative flex items-center justify-center mb-5">
            <div className="w-full border-t border-outline-variant/30"></div>
            <span className="px-3 text-[11px] font-mono text-outline bg-surface-container-low shrink-0 uppercase">
              OR CONTINUE WITH
            </span>
            <div className="w-full border-t border-outline-variant/30"></div>
          </div>

          {/* Google Sign-in Button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={submitting}
            className="w-full py-3 px-4 rounded-xl bg-surface-container-high hover:bg-surface-bright text-on-surface font-semibold text-xs sm:text-sm flex items-center justify-center gap-3 border border-outline-variant/40 hover:border-primary/50 transition-all duration-200 shadow-sm group cursor-pointer active:scale-98 disabled:opacity-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Google Account</span>
          </button>

          {/* Quick Demo Bypass */}
          <div className="mt-5 pt-4 border-t border-outline-variant/20 flex flex-col gap-2">
            <Link
              href="/workspace"
              className="w-full py-2 px-3 rounded-xl bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors text-center text-[11px] font-mono border border-outline-variant/20"
            >
              Continue to Workspace as Demo Guest →
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 text-center text-xs font-mono text-outline">
        © 2025 Hackathon Hub Inc.
      </div>
    </div>
  );
}
