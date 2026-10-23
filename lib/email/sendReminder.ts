import nodemailer from "nodemailer";

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmailReminder({
  to,
  subject,
  html,
  text,
}: SendEmailParams): Promise<{ success: boolean; simulated?: boolean; error?: string }> {
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.replace(/\s+/g, "");
  const from =
    process.env.SMTP_FROM ||
    (user ? `"Hackathon Hub" <${user}>` : '"Hackathon Hub" <notifications@hackathonhub.io>');

  // If no SMTP credentials provided yet, safely simulate without throwing error
  if (!user || !pass) {
    console.log(
      `[SIMULATED EMAIL DISPATCH]\nTo: ${to}\nSubject: ${subject}\nFrom: ${from}\nContent Preview: ${
        text || html.slice(0, 150)
      }...`
    );
    return { success: true, simulated: true };
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user,
        pass,
      },
    });

    await transporter.sendMail({
      from,
      to,
      subject,
      text: text || subject,
      html,
    });

    return { success: true };
  } catch (error: unknown) {
    console.error("Nodemailer dispatch error:", error);
    const msg = error instanceof Error ? error.message : "Failed to send email.";
    return { success: false, error: msg };
  }
}

// Generate styled HTML template for hackathon deadline reminder
export function generateDeadlineReminderHtml({
  recipientName,
  hackathonName,
  deadlineText,
  daysLeft,
  actionUrl,
}: {
  recipientName: string;
  hackathonName: string;
  deadlineText: string;
  daysLeft: number;
  actionUrl: string;
}): string {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #111318; color: #e2e2e9; padding: 32px 16px; border-radius: 12px; max-width: 580px; margin: 0 auto;">
      <div style="border-bottom: 1px solid #494454; padding-bottom: 16px; margin-bottom: 24px;">
        <span style="font-weight: 700; font-size: 18px; color: #d0bcff;">Hackathon Hub</span>
        <span style="color: #a8d54c; font-size: 12px; font-weight: 600; text-transform: uppercase; margin-left: 8px;">Sprint Alert</span>
      </div>
      <h2 style="color: #e2e2e9; font-size: 22px; margin-top: 0;">Hey ${recipientName},</h2>
      <p style="color: #cbc3d7; font-size: 15px; line-height: 1.6;">
        This is an urgent reminder that the registration/submission cutoff for <strong style="color: #ffffff;">${hackathonName}</strong> is approaching in 
        <span style="color: #a8d54c; font-weight: bold;">${daysLeft} days</span> (${deadlineText}).
      </p>
      <div style="background-color: #1e1f25; border: 1px solid #494454; border-radius: 8px; padding: 16px; margin: 24px 0;">
        <p style="margin: 0; font-size: 14px; color: #cbc3d7;"><strong>Event:</strong> ${hackathonName}</p>
        <p style="margin: 8px 0 0 0; font-size: 14px; color: #ffb4ab;"><strong>Deadline:</strong> ${deadlineText}</p>
      </div>
      <a href="${actionUrl}" style="display: inline-block; background-color: #a078ff; color: #340080; font-weight: 600; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-size: 14px;">Open Team Workspace</a>
      <p style="color: #958ea0; font-size: 12px; margin-top: 32px; border-top: 1px solid #282a2f; padding-top: 16px;">
        You received this email because you are a registered builder in Hackathon Hub. Manage your notification preferences in your dashboard settings.
      </p>
    </div>
  `;
}
