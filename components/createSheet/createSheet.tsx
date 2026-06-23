"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import api from "@/lib/axios";
import { Spinner } from "../ui/spinner";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";



const CreateSheet = () => {
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false)
  const router = useRouter();
  const [open,setOpen] = useState(false)

  const submit = async () => {
    try {
      setError("")
      setLoading(true);
      if (!title.trim()) {
        setError("Please enter the title")
        return
      }

      const res = await api.post("/sheets/create", { title });
      console.log(res.data.sheet);
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
 <Button onClick={()=> setOpen(true)}>
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