import { connectDB } from "@/lib/Mdb";
import { protect } from "@/lib/protect";
import Sheet from "@/models/Sheet";
import Starred from "@/models/Starred";
import { NextRequest, NextResponse } from "next/server";

export const DELETE = async ( req: NextRequest) => {
  try {
    await connectDB();

    const result = await protect(req);

    if (result instanceof NextResponse) {
      return result;
    }

    const { userId } = result;
     const { sheetId } = await req.json()


    const sheet = await Sheet.findById(sheetId);

    if (!sheet) {
      return NextResponse.json(
        { message: "Sheet not found" },
        { status: 404 }
      );
    }

    if (sheet.owner.toString() !== userId.toString()) {
      return NextResponse.json(
        { message: "Only the owner can delete this sheet" },
        { status: 403 }
      );
    }

    await Starred.deleteMany({ sheet: sheetId });
    await Sheet.findByIdAndDelete(sheetId);

    return NextResponse.json(
      { message: "Sheet deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Internal server error while deleting sheet" },
      { status: 500 }
    );
  }
};