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
        const { userId } = result;

        const body = await req.json();
        const { update ,sheetId} = body;
       

        await Sheet.findByIdAndUpdate(
            {_id:sheetId,owner:userId },
            {yjsState: Buffer.from(update)}
        )

        return NextResponse.json(
            { message: "saved succesfully" },
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

