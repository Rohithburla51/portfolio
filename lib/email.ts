/**
 * Resend email client (server-only).
 */

import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;

let resendClient: Resend | null = null;
function getClient() {
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured");
  }
  if (!resendClient) {
    resendClient = new Resend(apiKey);
  }
  return resendClient;
}

export interface ContactEmailPayload {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export async function sendContactEmail(payload: ContactEmailPayload) {
  const fromEmail = process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";
  const toEmail = process.env.CONTACT_TO_EMAIL ?? "burlarohith999@gmail.com";

  const { name, email, subject, message } = payload;
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
      <h2 style="margin: 0 0 16px; color: #6366f1;">New message from your portfolio</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #64748b; font-weight: 600; width: 100px;">From</td>
          <td style="padding: 8px 0; color: #0f172a;">${escapeHtml(name)} &lt;${escapeHtml(email)}&gt;</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Subject</td>
          <td style="padding: 8px 0; color: #0f172a;">${escapeHtml(subject)}</td>
        </tr>
      </table>
      <hr style="margin: 24px 0; border: none; border-top: 1px solid #e2e8f0;" />
      <div style="color: #0f172a; line-height: 1.6; white-space: pre-wrap;">${escapeHtml(message)}</div>
      <hr style="margin: 24px 0; border: none; border-top: 1px solid #e2e8f0;" />
      <p style="font-size: 12px; color: #94a3b8;">Reply directly to this email to respond to ${escapeHtml(name)}.</p>
    </div>
  `;

  const text = `
New message from your portfolio

From:    ${name} <${email}>
Subject: ${subject}

${message}

---
Reply directly to this email to respond to ${name}.
  `.trim();

  return getClient().emails.send({
    from: `Portfolio <${fromEmail}>`,
    to: toEmail,
    replyTo: email,
    subject: `[Portfolio] ${subject}`,
    html,
    text,
  });
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
