import { connectDB } from "@/lib/Mdb";
import { protect } from "@/lib/protect";
import { changeRoleValidator } from "@/lib/validator/roleValidator";
import Sheet from "@/models/Sheet";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req:NextRequest)=>{
    try {
        await connectDB();
        const result = await protect(req);
        if(result instanceof NextResponse){
            return result;
        }
         const {userId} = result
        const body = await req.json();

       const validationResults = changeRoleValidator.safeParse(body);
       if(!validationResults.success){
         const errMessages = validationResults.error.issues.map((issue)=>issue.message)
         return NextResponse.json(
           {message:errMessages},
           {status:400}
         )
       }

       const {collaboratorId,sheetId,newRole} = validationResults.data;

       const sheet = await Sheet.findById(sheetId);
       if(!sheet){
        return NextResponse.json(
            {message:"Sheet not found"},
            {status:404}
        )
       }
       if(sheet.owner.toString() != userId.toString()){
         return NextResponse.json(
            {message:"Role can omly be changed by owner"},
            {status:403}
        )
       }

  const collaborator = sheet.collaborators.find((c:any) => c.user.toString() === collaboratorId);
  if(!collaborator){
    return NextResponse.json(
        {message:"Collaborator not found"},
        {status:404}
    )
  }
       
  collaborator.role = newRole;
  await sheet.save();

return NextResponse.json(
  { message: "Role updated successfully" },
  { status: 200 }
);



        
    } catch (error) {
        console.log("Error->",error)
          return NextResponse.json(
        {message:"Internal server Error"},
        {status:500}
    )
    }
}