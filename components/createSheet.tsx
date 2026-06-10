"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import api from "@/lib/axios";
import { Spinner } from "./ui/spinner";
import { useRouter } from "next/navigation";



const CreateSheet = () => {
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false)
  const router = useRouter();

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
      router.push(`/sheet/${res.data.sheet.sheetId}`)
    } catch (error: any) {
      setError(error?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }

  }


  return (
    <div className="space-y-4 max-w-md">
      <Input
        placeholder="Enter sheet name"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      {error && <p>{error}</p>}
      <Button
        onClick={submit}
        disabled={loading}
      >
        {loading ? <Spinner></Spinner> : "Create Sheet"}
      </Button>
    </div>
  );
};

export default CreateSheet;