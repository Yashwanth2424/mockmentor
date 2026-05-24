import { Resend } from "resend";
import { env } from "@/lib/env";

const resend = new Resend(env.RESEND_API_KEY);

const FROM_ADDRESS = "MockMentor <onboarding@resend.dev>";

export async function sendEmail({ to, subject, html }) {
      if (!to || !subject || !html) {
            throw new Error("Missing required email fields: to, subject, html");
      }

      try {
            const data = await resend.emails.send({
                  from: FROM_ADDRESS,
                  to,
                  subject,
                  html,
            });

            return data;

      } catch (err) {
            console.error("EMAIL ERROR:", err);
            throw err;
      }
}