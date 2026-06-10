import { connectDB } from "@/lib/Mdb";
import { rateLimiter } from "@/lib/rateLimiter";
import { accessTokenGenerator, refreshTokenGenerator } from "@/lib/token";
import { signupValidator } from "@/lib/validator/authValidator";
import User from "@/models/User";
import bcrypt from "bcryptjs"
import { randomUUID } from "crypto";
import redis from "@/lib/redis"


import { NextRequest, NextResponse } from "next/server";

export const POST = async (req:NextRequest)=>{
try {
    
    const allIp = req.headers.get("x-forwarded-for");
    const myIp = allIp?.split(",")[0].trim() ?? "unknown"
    const rate = await rateLimiter(`signup${myIp}`,5,60);
    if(!rate.success){
        return NextResponse.json(
            {message: "too many requests",tryAgainAfter: rate.retryAfter},
            {status: 429}
        )
    }
    await connectDB();
    const body = await req.json();
       const result = signupValidator.safeParse(body)
    if(!result.success){
        const errMessages = result.error.issues.map((issue)=> issue.message)
        return NextResponse.json(
            {message: errMessages},
            {status: 400}
        )
    }
   
    const {userName, email, password} = result.data;

    const userExist = await User.findOne({email});
    if(userExist){
        return NextResponse.json(
            {message:"user already exists"},
            {status: 409}
        )
    }

    const hashedPassword = await bcrypt.hash(password,10);
    const newUser = await User.create({
        userName,
        email,
        password:hashedPassword,
    })

const accessToken = accessTokenGenerator(newUser._id.toString());
const refreshToken = refreshTokenGenerator(newUser._id.toString());
const sessionId = randomUUID()

await redis.set(
    `access:${newUser._id.toString()}:${sessionId}`,
     accessToken,
     "EX",
     15*60
)

await redis.set(
    `refresh:${newUser._id.toString()}:${sessionId}`,
     refreshToken,
     "EX",
    7 * 24 * 60 * 60
)

await redis.set(
  `session:${sessionId}`,
  newUser._id.toString(),
  "EX",
  7 * 24 * 60 * 60
);



const response = NextResponse.json(
    {message:"user signed up successfully", user:{userName:newUser.userName, email: newUser.email,id:newUser._id.toString()}}
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


} catch (error) {
         console.log("ERROR-> ", error);
        return NextResponse.json(
            { message: "internal server error" },
            { status: 500 }
        )
    }

}