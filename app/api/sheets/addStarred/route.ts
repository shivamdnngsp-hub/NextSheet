import { connectDB } from "@/lib/Mdb";
import { protect } from "@/lib/protect";
import Starred from "@/models/Starred";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req:NextRequest) =>{
try {
    await connectDB();
    const result = await protect(req);
    if(result instanceof NextResponse){
        return;
    }

    const {userId} = result
    const body = await req.json();
    const {sheetId} = body;

    if (!sheetId) {
    return NextResponse.json(
        { message: "sheetId is required" },
        { status: 400 }
    );
}

  const alredyExist = await Starred.findOne({
    sheet: sheetId,
    user: userId
  })

  if(alredyExist){
      return NextResponse.json(
        {message:"sheet alredy Starred"},
        {status:409}
    )
  }

 
    const starredSheet = await Starred.create({
        sheet:sheetId,
        user:userId
    })
    await starredSheet.populate("sheet");

    return NextResponse.json(
        {message:"sheet starred successfully", starredSheet},
        {status:201}
    )


} catch (error) {
      console.log("Error->",error)
    return NextResponse.json(
        {message:"Internal server error in adding sheet to starred"},
        {status:500}
    )
}
}