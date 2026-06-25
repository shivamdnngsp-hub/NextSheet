import { connectDB } from "@/lib/Mdb";
import { protect } from "@/lib/protect";
import Starred from "@/models/Starred";
import { connect } from "http2";
import { NextRequest, NextResponse } from "next/server";

export const DELETE = async (req: NextRequest) => {
    try {
        await connectDB();
        const result = await protect(req);
        if (result instanceof NextResponse) {
            return result;
        }

        const { userId } = result;
        const { sheetId } = await req.json()

        if (!sheetId) {
            return NextResponse.json(
                { message: "sheetId is required" },
                { status: 400 }
            );
        }

        const deleted = await Starred.findOneAndDelete({
            user: userId,
            sheet: sheetId,
        });

        if (!deleted) {
            return NextResponse.json(
                { message: "Sheet is not starred" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { message: "Sheet unstarred successfully" },
            { status: 200 }
        );


    } catch (error) {
        return NextResponse.json(
            { message: "internal server error in unstarring sheet" },
            { status: 500 }
        );
    }
}