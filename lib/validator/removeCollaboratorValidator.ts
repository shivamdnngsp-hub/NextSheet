import { z } from "zod";

export const removeCollaboratorValidator = z.object({
  sheetId: z.string().length(24, "Invalid sheet id"),
  collaboratorId: z.string().length(24, "Invalid collaborator id"),
});