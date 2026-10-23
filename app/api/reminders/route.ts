import { NextResponse } from "next/server";
import {
  sendEmailReminder,
  generateDeadlineReminderHtml,
} from "../../../lib/email/sendReminder";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const {
      email = "builder@hackathonhub.io",
      name = "Builder",
      hackathonName = "Buildspace AI Sprint 2025",
      deadlineText = "Today, 23:59 UTC",
      daysLeft = 2,
    } = body;

    // Generate HTML
    const html = generateDeadlineReminderHtml({
      recipientName: name,
      hackathonName,
      deadlineText,
      daysLeft,
      actionUrl: "http://localhost:8000/workspace",
    });

    // Send email using Nodemailer (or safe simulation)
    const result = await sendEmailReminder({
      to: email,
      subject: `[Deadline Reminder] ${hackathonName} cutoff in ${daysLeft} days!`,
      html,
    });

    return NextResponse.json({
      status: "success",
      message: "Reminder dispatched successfully",
      details: result,
    });
  } catch (error: unknown) {
    console.error("Reminder API error:", error);
    const msg = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json(
      { status: "error", message: msg },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: "online",
    message: "Hackathon Hub Reminder Dispatcher Service Active",
    version: "2.4.0",
  });
}
