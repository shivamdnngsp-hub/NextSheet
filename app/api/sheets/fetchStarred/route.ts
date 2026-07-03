import { connectDB } from "@/lib/Mdb";
import { protect } from "@/lib/protect";
import Starred from "@/models/Starred";
import { NextRequest, NextResponse } from "next/server";
import Sheet from "@/models/Sheet"


export const GET = async (req: NextRequest) => {
    try {
        await connectDB();

        const result = await protect(req);

        if (result instanceof NextResponse) {
            return result;
        }

        const { userId } = result;

        const starredSheets = await Starred.find({
            user: userId
        }).populate("sheet").sort({ createdAt: -1 });

        return NextResponse.json(
            { message: "Starred sheets fetched successfully",starredSheets},
            { status: 200 }
        );
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            {message: "Internal server error while fetching starred sheets"},
            { status: 500 }
        );
    }
};