import { connectDB } from "@/lib/Mdb";
import { protect } from "@/lib/protect";
import Sheet from "@/models/Sheet";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
    try {
        await connectDB();
        const result = await protect(req);
        if (result instanceof NextResponse) {
            return result;
        }
        const {userId} = result;

           const body = await req.json();
        const {sheetId} = body;
       
    
        const sheet = await Sheet.findOne({ _id: sheetId});

          if (!sheet) {
            return NextResponse.json(
                { message: "Sheet not found" },
                { status: 404 }
            );
        }

        const isOwner = sheet.owner.toString() === userId.toString();
        const isColaborator = sheet.collaborators.some((c: any) => c.user.toString() === userId.toString())

      
        if(!isOwner && !isColaborator){
            return NextResponse.json(
            { message: "Access Denied"},
            { status: 404 }
        )
        }
      

        const role = isOwner ? "owner" : sheet.collaborators.find( (c: any) => c.user.toString() === userId.toString())?.role;
    


        return NextResponse.json(
            { message: "Sheet fetched successfully", sheet ,role},
            { status: 200 }
        )

    } catch (error) {
        console.log("Error->", error)
        return NextResponse.json(
            { message: "Internal server eror" },
            { status: 500 }
        )
    }
}

