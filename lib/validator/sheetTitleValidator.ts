import {z} from "zod"

export const titleValidator = z.object({
    title: z.string().trim().min(1,"Title is required").max(100,"title too long")
})