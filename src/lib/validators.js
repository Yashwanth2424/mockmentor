import { z } from "zod";

/* ===== AUTH ===== */

export const loginSchema = z.object({
      email: z
            .string()
            .min(1, "Email is required")
            .email("Invalid email address")
            .transform((val) => val.trim().toLowerCase()),

      password: z
            .string()
            .min(1, "Password is required"),
});

export const signupSchema = z.object({
      name: z
            .string()
            .min(2, "Name must be at least 2 characters")
            .max(50, "Name too long")
            .transform((val) => val.trim()),

      email: z
            .string()
            .min(1, "Email is required")
            .email("Invalid email address")
            .transform((val) => val.trim().toLowerCase()),

      password: z
            .string()
            .min(6, "Password must be at least 6 characters")
            .max(100, "Password too long"),
});

/* ===== BOOKING ===== */

export const bookingSchema = z.object({
      topic: z
            .string()
            .min(3, "Topic must be at least 3 characters")
            .max(100, "Topic must be under 100 characters")
            .transform((val) => {
                  const clean = val.trim();
                  return clean.charAt(0).toUpperCase() + clean.slice(1);
            }),

      date: z
            .string()
            .or(z.date())
            .refine((val) => !isNaN(new Date(val).getTime()), {
                  message: "Invalid date format",
            }),

      mentorId: z
            .string()
            .min(1, "Mentor is required"),
});

/* ===== RESCHEDULE ===== */

export const rescheduleSchema = z.object({
      date: z
            .string()
            .or(z.date())
            .refine((val) => !isNaN(new Date(val).getTime()), {
                  message: "Invalid date format",
            }),

      mentorId: z
            .string()
            .min(1, "Mentor is required"),
});

/* ===== AVAILABILITY ===== */

export const availabilitySchema = z.object({
      availability: z
            .array(
                  z.object({
                        dayOfWeek: z
                              .number()
                              .int()
                              .min(0, "Invalid day")
                              .max(6, "Invalid day"),

                        startHour: z
                              .number()
                              .int()
                              .min(0, "Invalid start hour")
                              .max(23, "Invalid start hour"),

                        endHour: z
                              .number()
                              .int()
                              .min(1, "Invalid end hour")
                              .max(24, "Invalid end hour"),
                  }).refine(
                        (val) => val.startHour < val.endHour,
                        { message: "Start hour must be before end hour" }
                  )
            )
            .min(1, "At least one availability slot is required"),
});

/* ===== ROLE ===== */

export const roleSchema = z.object({
      role: z.enum(
            ["STUDENT", "MENTOR", "ADMIN", "SUPER_ADMIN"],
            { message: "Invalid role" }
      ),
});