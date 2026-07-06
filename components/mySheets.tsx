"use client";

import api from "@/lib/axios";
import { useEffect, useState } from "react";
import { Spinner } from "./ui/spinner";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { Star } from "lucide-react";
import StarButton from "./starButton";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu";
import { MoreVertical } from "lucide-react";
import useAuth from "@/hooks/useAuth";

type Sheet = {
  _id: string;
  title: string;
  owner: string;
  collaborators: any[];
  updatedAt: string;
};

type StarredSheet = {
  _id: string;
  user: string;
  sheet: Sheet;
};


const Mysheets = () => {
  const [sheets, setSheets] = useState<Sheet[]>([]);
  const [starredSheets, setStarredSheets] = useState<StarredSheet[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter()
  const [deleting, setDeleting] = useState(false);
  const {user,authLoading} = useAuth();

  useEffect(() => {
    if(authLoading || !user) return;
    const fetchSheets = async () => {
      try {
        setLoading(true)
        setError("")
        const [sheetRes, starredSheetRes] = await Promise.all([
          api.get("/sheets/fetchmysheets"),
          api.get("sheets/fetchStarred")
        ])
        setSheets(sheetRes.data.mySheets);
        setStarredSheets(starredSheetRes.data.starredSheets);
      } catch (error: any) {
        setError(
          error?.response?.data?.message || "Something went wrong"
        );
      } finally {
        setLoading(false)
      }
    };

    fetchSheets();
  }, [user]);


  const handleDelete = async (sheetId: any) => {
    try {
      setDeleting(true);
      await api.delete("/sheets/deleteSheet", { data: { sheetId } })

      setSheets((prev) =>
        prev.filter((sheet) => sheet._id !== sheetId)
      );

      setStarredSheets((prev) =>
        prev.filter((star) => star.sheet._id !== sheetId)
      );

    } catch (error) {
      console.error(error);
    } finally {
      setDeleting(false)
    }
  }





  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">
          My Sheets
        </h2>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-16">
          <Spinner />
          <p className="mt-4 text-sm text-muted-foreground">
            Loading your sheets...
          </p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-16">
          <div className="mb-4 text-3xl">⚠️</div>

          <h3 className="text-lg font-semibold">
            Failed to load sheets
          </h3>

          <p className="mt-2 text-sm text-muted-foreground">
            {error}
          </p>
        </div>
      ) : sheets.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-16">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-2xl">
            📊
          </div>

          <h3 className="text-lg font-semibold">
            No sheets yet
          </h3>

          <p className="mt-2 max-w-sm text-center text-sm text-muted-foreground">
            Create your first spreadsheet to start organizing and collaborating.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sheets.map((sheet: any) => {
            const initials = sheet.title
              .split(" ")
              .slice(0, 2)
              .map((word: string) => word[0])
              .join("")
              .toUpperCase();

            return (
              <div
                key={sheet._id}
                onClick={() => router.push(`/sheet/${sheet._id}`)}
                className="group cursor-pointer rounded-2xl border bg-card p-4 transition-all duration-200 hover:-translate-y-1 hover:border-emerald-500/40 hover:shadow-lg"
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-500 font-bold text-lg">
                    {initials}
                  </div>

                  <div
                    className="flex items-center gap-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <StarButton
                      starredSheets={starredSheets}
                      setStarredSheets={setStarredSheets}
                      sheetId={sheet._id}
                    />

                    {!deleting && <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="rounded-md p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground">
                          <MoreVertical className="h-5 w-5" />
                        </button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          className="text-red-500 focus:text-red-500"
                          onClick={() => handleDelete(sheet._id)}
                        >
                          {deleting ? "Deleting.." : "Delete"}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>}
                    {deleting && <Spinner></Spinner>}
                  </div>
                </div>

                <h3 className="mt-4 truncate text-lg font-semibold">
                  {sheet.title}
                </h3>

                <p className="mt-1 text-sm text-muted-foreground">
                  Collaborative Spreadsheet
                </p>

                <div className="mt-4 flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {sheet.collaborators
                      ?.slice(0, 3)
                      .map((c: any, index: number) => (
                        <div
                          key={index}
                          className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-card bg-emerald-500 text-xs font-semibold text-white"
                        >
                          {c.user?.userName?.[0]?.toUpperCase()}
                        </div>
                      ))}
                  </div>

                  <span className="text-xs text-muted-foreground">
                    {sheet.collaborators?.length || 0} collaborators
                  </span>
                </div>

                <div className="mt-5 flex items-center justify-between border-t pt-3">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Last edited
                    </p>

                    <p className="text-sm font-medium">
                      {formatDistanceToNow(new Date(sheet.updatedAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>

                  <span className="text-sm font-medium text-emerald-500 opacity-0 transition-opacity group-hover:opacity-100">
                    Open →
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Mysheets;


