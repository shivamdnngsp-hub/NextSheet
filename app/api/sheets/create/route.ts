import { connectDB } from "@/lib/Mdb";
import { protect } from "@/lib/protect";
import { titleValidator } from "@/lib/validator/sheetTitleValidator";
import Sheet from "@/models/Sheet"


import { NextRequest, NextResponse } from "next/server";

export const POST = async (req:NextRequest) =>{

try {
    await  connectDB()
    const result = await protect(req);
    if(result instanceof NextResponse){
        return result
    }

    const {userId} = result


    const body = await req.json();


const validationResults = titleValidator.safeParse(body);
if(!validationResults.success){
  const errMessages = validationResults.error.issues.map((issue)=>issue.message)
  return NextResponse.json(
    {message:errMessages},
    {status:400}
  )
}


    const {title} = validationResults.data

    const sheet = await Sheet.create({
        title,
        owner: userId
    })

    return NextResponse.json(
        {message:"Sheet created successfully", sheet:{sheetId: sheet._id,title:sheet.title, owner:sheet.owner}},
        {status:200}
    )



} catch (error) {
     console.log("Error->",error)
    return NextResponse.json(
        {message:"Internal server error in creating new sheet"},
        {status:500}
    )
}

}