import { NextRequest, NextResponse } from "next/server";
import redis from "@/lib/redis"
import jwt from "jsonwebtoken"
import { accessTokenGenerator, refreshTokenGenerator } from "@/lib/token";

export const POST = async (req: NextRequest) => {

    try {
         const refreshToken = req.cookies.get("refreshToken")?.value;
    const sessionId = req.cookies.get("sessionId")?.value;

    if (!refreshToken || !sessionId) {
        return NextResponse.json(
            { message: "User Unauthorized" },
            { status: 401 }
        )
    }

    let decoded
    try {
        decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET as string) as { userId: string }
    } catch (error) {
        return NextResponse.json(
            { message: "User unauthorized" },
            { status: 401 }
        );
    }

    const userId = decoded.userId;

    const session = await redis.get(`session:${sessionId}`);
    if (!session) {
        return NextResponse.json(
            { message: "User unauthorized session expired" },
            { status: 401 }
        );
    }


    const storedRefreshToken = await redis.get(`refresh:${userId}:${sessionId}`)

    if (storedRefreshToken !== refreshToken) {
        await redis.del(`refresh:${userId}:${sessionId}`)
        await redis.del(`session:${sessionId}`)
        return NextResponse.json(
            { message: "session compromised please login again" },
            { status: 401 }
        )
    }


    const newAccessToken = accessTokenGenerator(userId.toString())
    const newRefreshToken = refreshTokenGenerator(userId);


    await redis.set(
        `access:${userId}:${sessionId}`,
        newAccessToken,
        "EX",
        15 * 60

    )

    await redis.set(`refresh:${userId}:${sessionId}`,
        newRefreshToken,
        "EX",
        7 * 24 * 60 * 60
    );


    const response = NextResponse.json(
        { message: "NEW access token generated" },
        { status: 200 }
    )

    response.cookies.set("accessToken", newAccessToken, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 15 * 60
    })



    response.cookies.set("refreshToken", newRefreshToken, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60,
    });



    return response


    } catch (error) {
        console.log("Error->" + error)
        return NextResponse.json(
            { message: "internal server error" },
            { status: 500 }
        )
    

}
}