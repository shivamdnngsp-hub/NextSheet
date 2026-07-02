import { connectDB } from "@/lib/Mdb";
import { protect } from "@/lib/protect";
import { inviteValidator } from "@/lib/validator/inviteValidator";
import Sheet from "@/models/Sheet";
import User from "@/models/User";
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

    const validationResults = inviteValidator.safeParse(body);

    if (!validationResults.success) {
      const errMessages = validationResults.error.issues.map(
        (issue) => issue.message
      );

      return NextResponse.json(
        { message: errMessages },
        { status: 400 }
      );
    }

    const { sheetId, invitedEmail } = validationResults.data;

    const sheet = await Sheet.findById(sheetId);

    if (!sheet) {
      return NextResponse.json(
        {message: "Sheet not found"},
        {status: 404}
      );
    }

    if (sheet.owner.toString() !== userId) {
      return NextResponse.json(
        {message: "Only the owner can invite collaborators."},
        {status: 403}
      );
    }

    const user = await User.findOne({ email: invitedEmail });

    if (!user) {
      return NextResponse.json(
        { message: "User not found." },
        { status: 404 }
      );
    }

    if (sheet.owner.toString() === user._id.toString()) {
      return NextResponse.json(
        {message: "Owner already has access."},
        {status: 400}
      );
    }

    const alreadyCollaborator = sheet.collaborators.some((collaborator: any) =>
        collaborator.user.toString() === user._id.toString()
    );

    if (alreadyCollaborator) {
      return NextResponse.json(
        {message: "User is already a collaborator."},
        {status: 400}
      );
    }

    sheet.collaborators.push({
      user: user._id,
      role: sheet.defaultCollaboratorRole,
    });
    await sheet.save();

    return NextResponse.json(
      {message: "Collaborator invited successfully."},
      {status: 200}
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {message: "Internal server error."},
      {status: 500,}
    );
  }
};