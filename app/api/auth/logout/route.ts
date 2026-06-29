import { connectDB } from "@/lib/Mdb";
import { protect } from "@/lib/protect";
import redis from "@/lib/redis";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  try {
    await connectDB();
    const result = await protect(req);

    if (result instanceof NextResponse) {
      return result;
    }
    const { userId } = result;

    const sessionId = req.cookies.get("sessionId")?.value;

    if (sessionId) {
      await Promise.all([
        redis.del(`access:${userId}:${sessionId}`),
        redis.del(`refresh:${userId}:${sessionId}`),
        redis.del(`session:${sessionId}`),
      ]);
    }
    const response = NextResponse.json({
      message: "Logged out successfully",
    });

 response.cookies.delete("accessToken");
response.cookies.delete("refreshToken");
response.cookies.delete("sessionId");

    return response;
  } catch (error) {
    console.error("ERROR ->", error);

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
};