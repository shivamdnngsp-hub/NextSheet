"use client";

import { Crown, Trash2, UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { SetStateAction, useState } from "react";
import api from "@/lib/axios";

type Collaborator = {
  user: {
    _id: string;
    name: string;
    email: string;
  };
  role: "owner" | "editor" | "viewer";
};

type ManageAccessProps = {
    authorized:boolean,
    sheetId : string
    collaborators : Collaborator[]
    role: "owner" | "editor" | "viewer" | null;
}

const ManageAccess = ({authorized,sheetId,collaborators,role}: ManageAccessProps) => {
const [invitedEmail,setInvitedEmail] = useState("");
const [inviting,setInviting] = useState(false);
const [error,setError] = useState("");



const invite = async ()=>{
try {
    setInviting(true);
    const res = await api.post("/sheets/invite",{sheetId,invitedEmail})
} catch (error: any) {
      setError(
        error?.response?.data?.message
      );
    }finally{
    setInviting(false)
}
}

const handelChange = (e: { target: { value: SetStateAction<string>; }; })=>{
    setInvitedEmail(e.target.value)
}


return (
  <Dialog>
    <DialogTrigger asChild>
      <Button
        variant="outline"
        disabled={!authorized || role !== "owner"}
      >
        Manage Access
      </Button>
    </DialogTrigger>

    <DialogContent className="w-[95vw] max-w-xl max-h-[85vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Manage Access</DialogTitle>

        <DialogDescription>
          Invite collaborators and manage their access permissions.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            placeholder="Enter collaborator email..."
            className="flex-1"
            value={invitedEmail}
            onChange={handelChange}
            onPaste={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          />

          <Button
            onClick={invite}
            disabled={inviting}
            className="w-full sm:w-auto"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            {inviting ? "Inviting..." : "Invite"}
          </Button>
        </div>

        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}
      </div>

    
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-muted-foreground">
          People with access
        </h3>

        <div className="rounded-lg border">
          {collaborators?.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              No collaborators yet.
            </div>
          ) : (
            collaborators.map((collaborator) => (
              <div
                key={collaborator.user._id}
                className="border-b last:border-b-0 p-4"
              >
    
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarFallback>
                      {collaborator.user.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium truncate">
                        {collaborator.user.name}
                      </p>

                      {collaborator.role === "owner" && (
                        <Badge
                          variant="secondary"
                          className="gap-1"
                        >
                          <Crown className="h-3 w-3" />
                          Owner
                        </Badge>
                      )}
                    </div>

                    <p className="text-sm text-muted-foreground break-all">
                      {collaborator.user.email}
                    </p>
                  </div>
                </div>

                {collaborator.role !== "owner" && (
                  <div className="mt-3 flex items-center gap-2">
                    <div className="flex-1 min-w-0">
                      <Select defaultValue={collaborator.role}>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>

                        <SelectContent>
                          <SelectItem value="editor">
                            Editor
                          </SelectItem>

                          <SelectItem value="viewer">
                            Viewer
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="shrink-0 text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </DialogContent>
  </Dialog>
);
};

export default ManageAccess;