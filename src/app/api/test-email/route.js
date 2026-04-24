import { sendEmail } from "@/lib/email";

export async function GET() {
      try {
            await sendEmail({
                  to: "yashwanththalka119@gmail.com",
                  subject: "MockMentor Test Email",
                  html: "<h2> Email working!</h2><p>Your email setup is successful.</p>",
            });

            return Response.json({ success: true });
      } catch (error) {
            return Response.json({ success: false, error: error.message });
      }
}