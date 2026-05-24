const requiredEnvVars = [
      "DATABASE_URL",
      "JWT_SECRET",
      "RESEND_API_KEY",
      "NEXT_PUBLIC_APP_URL",
];

function validateEnv() {
      const missing = requiredEnvVars.filter(
            (key) => !process.env[key]?.trim()
      );

      if (missing.length > 0) {
            throw new Error(
                  `Missing required environment variables:\n${missing.map((k) => `  - ${k}`).join("\n")}`
            );
      }

      // JWT_SECRET strength check
      if (process.env.JWT_SECRET.length < 32) {
            throw new Error(
                  "JWT_SECRET must be at least 32 characters long"
            );
      }

      // NEXT_PUBLIC_APP_URL format check
      try {
            new URL(process.env.NEXT_PUBLIC_APP_URL);
      } catch {
            throw new Error(
                  "NEXT_PUBLIC_APP_URL must be a valid URL (e.g. https://mockmentor.com)"
            );
      }
}

validateEnv();

export const env = {
      DATABASE_URL: process.env.DATABASE_URL,
      JWT_SECRET: process.env.JWT_SECRET,
      RESEND_API_KEY: process.env.RESEND_API_KEY,
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
      NODE_ENV: process.env.NODE_ENV || "development",
      isProd: process.env.NODE_ENV === "production",
      isDev: process.env.NODE_ENV === "development",
};