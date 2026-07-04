import { connectDB } from "@/lib/Mdb";
import { protect } from "@/lib/protect";
import Sheet from "@/models/Sheet";
import { NextRequest, NextResponse } from "next/server";
import "@/models/User";

export const GET = async (req: NextRequest) => {
  try {
    await connectDB();

    const result = await protect(req);

    if (result instanceof NextResponse) {
      return result;
    }

    const { userId } = result;

  const mySheets = await Sheet.find({ owner: userId }).select("title collaborators owner updatedAt").populate("collaborators.user", "userName")
  .sort({ updatedAt: -1 });


    return NextResponse.json(
      {
        message: "Sheets fetched successfully",mySheets},
      {status: 200,}
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message: "Internal Server Error"},
      {status: 500,}
    );
  }
};