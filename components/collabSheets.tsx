"use client";

import api from "@/lib/axios";
import { useEffect, useState } from "react";
import { Spinner } from "./ui/spinner";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";

const CollabSheets = () => {
  const [sheets, setSheets] = useState([]);
  const [error, setError] = useState("");
  const [loading,setLoading] = useState(false);
  const router = useRouter()

  useEffect(() => {
    const fetchSheets = async () => {
      try {
      setLoading(true)
        const res = await api.get("/sheets/fetchCollabsheets");
        setSheets(res.data.collabSheets);
      } catch (error: any) {
        setError(
          error?.response?.data?.message || "Something went wrong"
        );
      }finally{
        setLoading(false)
      }
    };

    fetchSheets();
  }, []);


return (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-semibold">
          Shared With Me
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Sheets shared by collaborators
        </p>
      </div>
    </div>

    {loading ? (
      <div className="flex justify-center py-16">
        <Spinner />
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
          🤝
        </div>

        <h3 className="text-lg font-semibold">
          No shared sheets
        </h3>

        <p className="mt-2 max-w-sm text-center text-sm text-muted-foreground">
          When someone shares a spreadsheet with you, it will appear here.
        </p>
      </div>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sheets.map((sheet: any) => {
          const initials = sheet.title.split(" ").slice(0, 2).map((word: string) => word[0]).join("").toUpperCase();

          return (
            <div
              key={sheet._id}
              onClick={() => router.push(`/sheet/${sheet._id}`)}
              className="group cursor-pointer  rounded-2xl  border  bg-card  p-5  transition-all  duration-200 hover:-translate-y-1
                hover:border-blue-500/40 hover:shadow-lg"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/15 text-blue-500 font-bold text-lg">
                  {initials}
                </div>

                <span className="rounded-full bg-accent px-2.5 py-1 text-xs font-medium">
                  Shared
                </span>
              </div>

              <h3 className="mt-4 truncate text-lg font-semibold">
                {sheet.title}
              </h3>

              <p className="mt-1 text-sm text-muted-foreground">
                Role:{" "}
                <span className="font-medium text-foreground">
                  {sheet.role || "Editor"}
                </span>
              </p>

              <div className="mt-4 flex items-center gap-2">
                <div className="flex -space-x-2">
                  {sheet.collaborators
                    ?.slice(0, 3)
                    .map((c: any, index: number) => (
                      <div
                        key={index}
                        className=" flex h-7 w-7 items-center justify-center rounded-full border-2 border-card 
                        bg-blue-500 text-xs font-semibold text-white"
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
                    {formatDistanceToNow(
                      new Date(sheet.updatedAt),
                      { addSuffix: true }
                    )}
                  </p>
                </div>

                <span
                  className="text-sm font-medium text-blue-500 opacity-0 transition-opacity
                    group-hover:opacity-100"
                >
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

export default CollabSheets;


