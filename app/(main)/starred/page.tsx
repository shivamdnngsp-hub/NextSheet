"use client";

import Header from "@/components/header";
import api from "@/lib/axios";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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

const Starred = () => {
  const [starredSheets, setStarredSheets] = useState<StarredSheet[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { user,authLoading } = useAuth();

  useEffect(() => {
    if(authLoading || !user) return;
    const fetchSheets = async () => {
      try {
        setLoading(true);
        setError("")

        const res = await api.get("sheets/fetchStarred")

        setStarredSheets(res.data.starredSheets);
      } catch (err: any) {
        setError(err?.response?.data?.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchSheets();
  }, [user]);

 return (
  <>
    <Header title="Starred Sheets" />

    <div className="mx-auto max-w-7xl px-6 py-8">
      
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-500/10">
            <span className="text-2xl">⭐</span>
          </div>

          <div>
            <h1 className="text-3xl font-bold">Starred Sheets</h1>
            <p className="text-muted-foreground">
              Quickly access your favorite spreadsheets.
            </p>
          </div>
        </div>
      </div>

      
      {loading && (
        <div className="flex h-64 items-center justify-center">
          <p className="text-muted-foreground">Loading starred sheets...</p>
        </div>
      )}

    
      {!loading && error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-red-500">
          {error}
        </div>
      )}

      
      {!loading && !error && starredSheets.length === 0 && (
        <div className="flex h-[60vh] flex-col items-center justify-center rounded-3xl border border-dashed">
          <div className="mb-5 text-6xl">⭐</div>

          <h2 className="text-2xl font-semibold">
            No Starred Sheets
          </h2>

          <p className="mt-2 max-w-md text-center text-muted-foreground">
            Star the spreadsheets you use most often and they'll appear here.
          </p>
        </div>
      )}

    
      {!loading && !error && starredSheets.length > 0 && (
        <>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              {starredSheets.length} Starred Sheet
              {starredSheets.length > 1 ? "s" : ""}
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {starredSheets.map(({ sheet }) => (
              <div
                key={sheet._id}
                onClick={() => router.push(`/sheet/${sheet._id}`)}
                className="group cursor-pointer rounded-2xl border bg-card p-5 transition-all duration-200 hover:-translate-y-1 hover:border-primary hover:shadow-xl"
              >
                {/* Top */}
                <div className="flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-500/10">
                    <span className="text-xl">⭐</span>
                  </div>

                  <span className="rounded-full bg-yellow-500/10 px-2 py-1 text-xs font-medium text-yellow-600 dark:text-yellow-400">
                    Starred
                  </span>
                </div>

                
                <h3 className="mt-5 line-clamp-1 text-lg font-semibold group-hover:text-primary">
                  {sheet.title}
                </h3>

                
                <p className="mt-1 text-sm text-muted-foreground">
                  {sheet.owner.toString() === user.id.toString()
                    ? "Owned by you"
                    : "Shared with you"}
                </p>

            
                <div className="mt-6 flex items-center justify-between border-t pt-4 text-sm text-muted-foreground">
                  <div>
                    👥 {sheet.collaborators.length} collaborator
                    {sheet.collaborators.length !== 1 ? "s" : ""}
                  </div>

                  <div>
                    {new Date(sheet.updatedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  </>
);
};

export default Starred;