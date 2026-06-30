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
    const { sheetId } = await req.json();

    const sheet = await Sheet.findById(sheetId)
      .select("title owner collaborators");

    if (!sheet) {
      return NextResponse.json(
        { message: "Sheet not found" },
        { status: 404 }
      );
    }

    const isOwner = sheet.owner.toString() === userId.toString();

    const collaborator = sheet.collaborators.find(
      (c: any) => c.user.toString() === userId.toString()
    );

    if (!isOwner && !collaborator) {
      sheet.collaborators.push({
        user: userId,
        role: "viewer",
      });
      await sheet.save();
    }

    const role = isOwner ? "owner": sheet.collaborators.find((c: any) => c.user.toString() === userId.toString())?.role;

    return NextResponse.json(
      {title: sheet.title,role,},
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