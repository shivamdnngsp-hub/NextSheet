import { connectDB } from "@/lib/Mdb";
import { protect } from "@/lib/protect";
import Sheet from "@/models/Sheet";
import { NextRequest, NextResponse } from "next/server";
import User from "@/models/User";


export const POST = async (req: NextRequest) => {
  try {
    await connectDB();
    const result = await protect(req);
    if (result instanceof NextResponse) {
      return result;
    }

    const { userId } = result;
    const { sheetId } = await req.json();

    const sheet = await Sheet.findById(sheetId)
      .select("title owner collaborators defaultCollaboratorRole").populate("collaborators.user");

    if (!sheet) {
      return NextResponse.json(
        { message: "Sheet not found" },
        { status: 404 }
      );
    }

    const isOwner = sheet.owner.toString() === userId.toString();

   const isCollaborator = sheet.collaborators.find(
  (c: any) => c.user._id.toString() === userId
);
  

   if(!isOwner && !isCollaborator){
            return NextResponse.json(
            { message: "Access Denied"},
            { status: 404 }
        )
        }
      

const role = isOwner? "owner": sheet.collaborators.find( (c: any) => c.user._id.toString() === userId )?.role;
  
   return NextResponse.json(
  {
    title: sheet.title,
    role,
    collaborators: sheet.collaborators,
  },
  { status: 200 }
);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
};