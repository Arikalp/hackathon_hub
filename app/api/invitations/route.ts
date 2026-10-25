import { NextResponse } from "next/server";
import {
  sendEmailReminder,
  generateInviteHtml,
} from "../../../lib/email/sendReminder";

// Very small in-memory rate limiter (per sender email): max 10 invites / hour
const rateMap = new Map<string, number[]>();

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const windowStart = now - 60 * 60 * 1000;
  const hits = (rateMap.get(key) || []).filter((t) => t > windowStart);
  if (hits.length >= 10) {
    return true;
  }
  hits.push(now);
  rateMap.set(key, hits);
  return false;
}

export async function GET() {
  return NextResponse.json({
    status: "online",
    message: "Hackathon Hub Invitation Email Dispatcher Active",
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const inviteeEmail = (body.inviteeEmail || "").trim();
    const teamName = (body.teamName || "an untagged squad").trim();
    const teamId = (body.teamId || "").trim();
    const role = (body.role || "member").trim();
    const inviterName = (body.inviterName || "A builder").trim();
    const inviterEmail = (body.inviterEmail || "").trim();

    if (!inviteeEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inviteeEmail)) {
      return NextResponse.json(
        { status: "error", message: "A valid invitee email is required." },
        { status: 400 }
      );
    }

    if (isRateLimited(inviterEmail || anonymousKey(inviteeEmail))) {
      return NextResponse.json(
        {
          status: "error",
          message: "Too many invitations sent recently. Try again later.",
        },
        { status: 429 }
      );
    }

    const html = generateInviteHtml({
      inviterName,
      teamName,
      role,
      inviteeEmail,
      actionUrl: teamId
        ? `${req.headers.get("origin") || "http://localhost:8000"}/workspace`
        : "http://localhost:8000/workspace",
    });

    const result = await sendEmailReminder({
      to: inviteeEmail,
      subject: `[Hackathon Hub] ${inviterName} invited you to join ${teamName}`,
      text: `${inviterName} invited you to join the hackathon team "${teamName}" as a ${role}. Sign in to Hackathon Hub to accept.`,
      html,
    });

    if (!result.success) {
      return NextResponse.json(
        { status: "error", message: result.error || "Email dispatch failed." },
        { status: 502 }
      );
    }

    return NextResponse.json({
      status: "success",
      message: result.simulated
        ? "Invitation email simulated (SMTP not configured)."
        : `Invitation email dispatched to ${inviteeEmail}.`,
      details: result,
    });
  } catch (error: unknown) {
    console.error("Invitation API error:", error);
    const msg = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json(
      { status: "error", message: msg },
      { status: 500 }
    );
  }
}

function anonymousKey(email: string): string {
  return "anon:" + email.toLowerCase();
}
