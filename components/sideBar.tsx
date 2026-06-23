import { FileSpreadsheet, LayoutDashboard, Star, Users } from "lucide-react"
import { ModeToggle } from "./modeToggle"

const SideBar = ()=>{

    return (
  <aside className="hidden md:flex md:w-64 lg:w-80 h-screen flex-col border-r bg-sidebar">
    
    {/* Workspace Card */}
    <div className="p-4">
      <div className="rounded-2xl border bg-card p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-500">
            <FileSpreadsheet size={24} />
          </div>
          <div>
            <h1 className="font-semibold text-lg">
              NextSheet
            </h1>

            <p className="text-xs text-muted-foreground">
              Collaborative Spreadsheets
            </p>
          </div>
        </div>
      </div>
    </div>

    {/* Navigation */}
    <div className="flex-1 px-4">
      <p className="mb-3 px-3 text-xs font-semibold tracking-widest text-muted-foreground">
        WORKSPACE
      </p>

      <div className="space-y-1">
        <button
          className=" flex w-full items-center gap-3 rounded-xl bg-accent px-3 py-3 text-sm font-medium"
        >
          <LayoutDashboard size={18} />
          Dashboard
        </button>

        <button
          className=" flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-muted-foreground transition-colors
            hover:bg-accent  hover:text-foreground"
        >
          <Star size={18} />
          Starred
        </button>
      </div>
    </div>

    <div className="border-t p-4">
      <div className="flex items-center justify-between rounded-xl bg-card px-3 py-3">
        <div>
          <p className="text-sm font-medium">
            Theme
          </p>

          <p className="text-xs text-muted-foreground">
            Appearance
          </p>
        </div>

        <ModeToggle />
      </div>
    </div>
  </aside>
);
}
export default SideBar