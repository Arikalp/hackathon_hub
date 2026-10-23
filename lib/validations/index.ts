import { z } from "zod";

export const usernameSchema = z
  .string()
  .min(3, "Username must be at least 3 characters")
  .max(20, "Username must be at most 20 characters")
  .regex(
    /^[a-zA-Z0-9_]+$/,
    "Username can only contain letters, numbers, and underscores"
  );

export const teamSchema = z.object({
  name: z.string().min(2, "Team name must be at least 2 characters").max(50),
  description: z.string().max(250).optional(),
});

export const hackathonSchema = z.object({
  name: z.string().min(2, "Hackathon name is required").max(100),
  organizer: z.string().min(1, "Organizer is required").max(100),
  startAt: z.string().min(1, "Start date is required"),
  endAt: z.string().min(1, "End date is required"),
  registrationDeadline: z.string().optional(),
  mode: z.enum(["Online / Global", "Hybrid", "In-Person"]),
  location: z.string().optional(),
  eventUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  registrationUrl: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("")),
  status: z
    .enum([
      "planned",
      "registered",
      "participating",
      "submitted",
      "completed",
      "cancelled",
    ])
    .default("registered"),
  projectName: z.string().optional(),
  projectDescription: z.string().optional(),
  submissionUrl: z.string().optional(),
  repositoryUrl: z.string().optional(),
  outcome: z
    .enum(["participant", "finalist", "winner", "none"])
    .default("participant"),
  notes: z.string().optional(),
});

export const notificationPreferencesSchema = z.object({
  emailReminders: z.boolean().default(true),
  deadlineAlerts: z.boolean().default(true),
  teamInvites: z.boolean().default(true),
});
