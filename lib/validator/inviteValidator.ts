import { z } from "zod";

export const inviteValidator = z.object({
  sheetId: z.string().length(24, "Invalid sheet id"),
  invitedEmail: z.string().email("Invalid email address"),
});