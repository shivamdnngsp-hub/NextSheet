import {z} from "zod"

export const changeRoleValidator  = z.object({
    collaboratorId: z.string().length(24, "Invalid collaboratorId"),
    sheetId: z.string().length(24, "Invalid sheet id"),
    newRole: z.enum(["viewer","editor"])
})