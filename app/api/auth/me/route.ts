
import { connectDB } from "@/lib/Mdb";
import { protect } from "@/lib/protect";
import User from "@/models/User";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req:NextRequest)=>{
    try {
        await connectDB();
        const result = await protect(req);
        if(result instanceof NextResponse){
            return result
        }
        const {userId} = result

        const user = await User.findById(userId)
if(!user){
     return  NextResponse.json(
        {message:"user not found"},
        {status :400}
    )
}

return NextResponse.json(
    {message:"user fetched successfully", user: {id: user._id,userName: user.userName, email:user.email}},
    {status:200}
)



    } catch (error) {
        console.log("Error->",error)
          return  NextResponse.json(
        {message:"Internal server error"},
        {status :500}
    )
    }
}