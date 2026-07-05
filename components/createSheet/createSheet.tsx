"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import api from "@/lib/axios";
import { Spinner } from "../ui/spinner";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { Plus } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Label } from "../ui/label";



const CreateSheet = () => {
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false)
  const router = useRouter();
  const [open,setOpen] = useState(false)
  const [defaultRole,setDefaultRole] = useState<"viewer" | "editor">("viewer")

  const submit = async () => {
    try {
      setError("")
      setLoading(true);
      if (!title.trim()) {
        setError("Please enter the title")
        return
      }

      const res = await api.post("/sheets/create", { title, defaultCollaboratorRole: defaultRole});
      setOpen(false)
      router.push(`/sheet/${res.data.sheet.sheetId}`)
    } catch (error: any) {
      setError(error?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }

  }

  return (
<>
  <Button
    variant="ghost"
    size="icon"
    className="md:hidden"
    onClick={() => setOpen(true)}
  >
    <Plus className="h-7! w-7! " />
  </Button>

  
  <Button
    className="hidden md:flex"
    onClick={() => setOpen(true)}
  >
    Create Sheet
  </Button>


<Dialog open={open} onOpenChange={setOpen} >
  <DialogContent className="sm:max-w-md bg-card">
    <DialogHeader>
      <DialogTitle>Create New Sheet</DialogTitle>
      <DialogDescription>
        Give your spreadsheet a name.
      </DialogDescription>
    </DialogHeader>

    <Input
      placeholder="Sheet name..."
      value={title}
      onChange={(e) => setTitle(e.target.value)}
    />

<div className="space-y-2">
  <Label>Default collaborator permission</Label>

  <RadioGroup
    value={defaultRole}
    onValueChange={(value) =>setDefaultRole(value as "viewer" | "editor")}
    className="flex gap-6"
  >
    <div className="flex items-center space-x-2">
      <RadioGroupItem value="viewer" id="viewer" />
      <Label htmlFor="viewer">Viewer</Label>
    </div>

    <div className="flex items-center space-x-2">
      <RadioGroupItem value="editor" id="editor" />
      <Label htmlFor="editor">Editor</Label>
    </div>
  </RadioGroup>
</div>


    {error && (
      <p className="text-sm text-red-500">
        {error}
      </p>
    )}

    <Button
      onClick={submit}
      disabled={loading}
    >
      {loading ? <Spinner /> : "Create Sheet"}
    </Button>
  </DialogContent>
</Dialog>
</>

  );
};

export default CreateSheet;