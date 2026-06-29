"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileSpreadsheet,
  LayoutDashboard,
  Menu,
  Star,
  X,
} from "lucide-react";
import { useState } from "react";
import { ModeToggle } from "./modeToggle";

const MobileSidebar = () => {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const closeSidebar = () => setOpen(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg p-2 md:hidden"
      >
        <Menu className="h-6 w-6" />
      </button>
    
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={closeSidebar}
        />
      )}


      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-72 flex-col border-r bg-sidebar transition-transform duration-300 md:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
    
        <div className="flex items-center justify-between border-b p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-500">
              <FileSpreadsheet size={20} />
            </div>

            <div>
              <h1 className="font-semibold">NextSheet</h1>
              <p className="text-xs text-muted-foreground">
                Collaborative Spreadsheets
              </p>
            </div>
          </div>

          <button onClick={closeSidebar}>
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-1 px-4 py-4">
          <p className="mb-3 px-3 text-xs font-semibold tracking-widest text-muted-foreground">
            WORKSPACE
          </p>

          <div className="space-y-1">
            <Link
              href="/dashboard"
              onClick={closeSidebar}
              className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition-colors ${
                pathname === "/dashboard"
                  ? "bg-accent font-medium text-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              <LayoutDashboard size={18} />
              Dashboard
            </Link>

            <Link
              href="/starred"
              onClick={closeSidebar}
              className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition-colors ${
                pathname === "/starred"
                  ? "bg-accent font-medium text-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              <Star size={18} />
              Starred
            </Link>
          </div>
        </div>

        <div className="border-t p-4">
          <div className="flex items-center justify-between rounded-xl bg-card px-3 py-3">
            <div>
              <p className="text-sm font-medium">Theme</p>
              <p className="text-xs text-muted-foreground">Appearance</p>
            </div>

            <ModeToggle />
          </div>
        </div>
      </aside>
    </>
  );
};

export default MobileSidebar;