import { escapeHtml } from "./format.js";

export function bookingConfirmationEmail({ topic, date, mentorName, appUrl }) {
  const year = new Date().getFullYear();

  return `
    <div style="font-family: Arial, sans-serif; background:#f9fafb; padding:20px;">
      <div style="max-width:600px; margin:auto; background:white; border-radius:12px; overflow:hidden; border:1px solid #e5e7eb;">
        <div style="background:linear-gradient(135deg,#4f46e5,#7c3aed); padding:20px; text-align:center; color:white;">
          <h1 style="margin:0;">MockMentor</h1>
          <p style="margin:5px 0 0; font-size:14px;">Interview Practice Platform</p>
        </div>
        <div style="padding:24px;">
          <h2 style="margin-top:0;">Interview Confirmed</h2>
          <p style="color:#374151;">Your interview has been successfully scheduled.</p>
          <div style="background:#f3f4f6; padding:16px; border-radius:8px; margin:20px 0;">
            <p><strong>Topic:</strong> ${escapeHtml(topic)}</p>
            <p><strong>Date:</strong> ${escapeHtml(date)} (German time)</p>
            <p><strong>Mentor:</strong> ${escapeHtml(mentorName)}</p>
          </div>
          <div style="text-align:center; margin-top:20px;">
            <a href="${escapeHtml(appUrl)}/dashboard"
              style="display:inline-block; padding:12px 20px; background:#4f46e5; color:white; border-radius:8px; text-decoration:none;">
              Go to Dashboard
            </a>
          </div>
        </div>
        <div style="padding:16px; text-align:center; font-size:12px; color:#9ca3af;">
          © ${year} MockMentor
        </div>
      </div>
    </div>
  `;
}
