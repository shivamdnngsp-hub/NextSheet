import { connectDB } from "@/lib/Mdb";
import { protect } from "@/lib/protect";
import Sheet from "@/models/Sheet";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req:NextRequest)=>{
try {
    await connectDB();
    const result = await protect(req);
    if(result instanceof NextResponse){
        return result;
    }

const {userId} = result;
const collabSheets = await Sheet.find({"collaborators.user": userId,}).select("title owner collaborators updatedAt").populate("collaborators.user", "userName")
  .sort({ updatedAt: -1 });
 return NextResponse.json(
      {
        message: "Collaboration Sheets fetched successfully",collabSheets},
      {status: 200,}
    );

} catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        message: "Internal Server Error in fetching collab sheets"},
      {status: 500,}
    );
  }
}