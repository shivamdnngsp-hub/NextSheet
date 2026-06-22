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
        const { update, sheetId } = body;

        const sheet = await Sheet.findById(sheetId);
        if (!sheet) {
            return NextResponse.json(
                { message: "Sheet not found" },
                { status: 404 }
            );
        }
        let role = null;
        if (sheet.owner.toString() === userId.toString()) {
            role = "owner";
        } else {
            role = sheet.collaborators.find(
                (c: any) => c.user.toString() === userId.toString()
            )?.role;
        }

        if (role !== "owner" && role !== "editor") {
            return NextResponse.json(
                { message: "Permission denied" },
                { status: 403 }
            );
        }

        sheet.yjsState = Buffer.from(update);
        await sheet.save();


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

