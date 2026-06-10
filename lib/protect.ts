import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import redis from "@/lib/redis"

export const protect = async (req: NextRequest) => {
    try {
        const accessToken = req.cookies.get("accessToken")?.value
        const sessionId = req.cookies.get("sessionId")?.value

        if (!accessToken || !sessionId) {
            return NextResponse.json(
                { message: "User unauthorized" },
                { status: 401 }
            );
        }
        let decoded;
        try {
            decoded = jwt.verify(accessToken, process.env.ACCESS_SECRET as string) as { userId: string }
        } catch {
            return NextResponse.json(
                { message: "User unauthorized" },
                { status: 401 }
            );
        }

        const userId = decoded.userId

        const session = await redis.get(`session:${sessionId}`)
        if (!session) {
            return NextResponse.json(
                { message: "User unauthorized session expired" },
                { status: 401 }
            );
        }


        const storedAccessToken = await redis.get( `access:${userId}:${sessionId}`);

        if (!storedAccessToken ||storedAccessToken !== accessToken) {
            return NextResponse.json(
                { message: "Invalid session token" },
                { status: 401 }
            );
        }



        return { userId, sessionId }

    } catch (error) {
        console.log("Error ->", error);
        return NextResponse.json(
            { message: "User unauthorized" },
            { status: 401 }
        );
    }


}