import { connectDB } from "@/lib/Mdb";
import { rateLimiter } from "@/lib/rateLimiter";
import { accessTokenGenerator, refreshTokenGenerator } from "@/lib/token";
import { loginValidator } from "@/lib/validator/authValidator";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import { stat } from "fs";
import { NextRequest, NextResponse } from "next/server";
import redis from "@/lib/redis"

export const  POST = async (req:NextRequest)=>{
    try {
            const allIps = req.headers.get("x-forwarded-for");
    const myIp = allIps?.split(",")[0].trim() ?? "unknown";

    const rate = await  rateLimiter(`login${myIp}`,5,60);
    if(!rate.success){
      return NextResponse.json(
        {message:"too many requests", tryAgainAfter: rate.retryAfter},
        {status: 429} 
      )
    }
    await connectDB()
    const body = await req.json()

    const result = loginValidator.safeParse(body);
    if(!result.success){
     const errorMessages = result.error.issues.map((issues) => issues.message);
     return NextResponse.json(
        {messgae: errorMessages},
        {status: 400}
     )
    }
const {email,password} = result.data;

const user = await User.findOne({email});
if(!user){
    return  NextResponse.json(
        {message:"Invalid credentials"},
        {status :400}
    )
}

const isMatch = await bcrypt.compare(password, user.password);
if(!isMatch){
     return  NextResponse.json(
        {message:"Invalid credentials"},
        {status :400}
    )
}

const accessToken = accessTokenGenerator(user._id.toString());
const refreshToken = refreshTokenGenerator(user._id.toString());
const sessionId = randomUUID()

await redis.set(
    `access:${user._id.toString()}:${sessionId}`,
     accessToken,
     "EX",
     15*60
)

await redis.set(
    `refresh:${user._id.toString()}:${sessionId}`,
     refreshToken,
     "EX",
    7 * 24 * 60 * 60
)

await redis.set(
  `session:${sessionId}`,
  user._id.toString(),
  "EX",
  7 * 24 * 60 * 60
);

const response = NextResponse.json(
    {message:"user logged in successfully", user:{userName:user.userName, email: user.email,id:user._id.toString()}}
)




response.cookies.set("accessToken", accessToken,{
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 15 * 60
})

response.cookies.set("refreshToken", refreshToken,{
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 60 * 60 * 24
})

response.cookies.set("sessionId", sessionId,{
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge:  7 * 60 * 60 * 24
})

return response


    }  catch (error) {
         console.log("ERROR-> ", error);
        return NextResponse.json(
            { message: "internal server error" },
            { status: 500 }
        )
    }


}