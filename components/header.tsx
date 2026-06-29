"use client";

import useAuth from "@/hooks/useAuth";
import CreateSheet from "./createSheet/createSheet";
import api from "@/lib/axios";
import { useRouter } from "next/navigation";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { LogOut } from "lucide-react";
import MobileSidebar from "./MsideBar";


type HeaderProps = {
  title: string;
};

const Header = ({ title }: HeaderProps) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error(error);
    }
  };


  return (
<header className="border-b">
  <div className="flex h-16 md:h-20 items-center justify-between px-4 md:px-8">
    <div className="flex items-center gap-3">
      <MobileSidebar />
      <h1 className="text-2xl md:text-[34px] font-semibold tracking-tight">
        {title}
      </h1>
    </div>

    <div className="flex items-center gap-2 md:gap-4">

      <div>
        <CreateSheet />
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-full border-2 border-background bg-primary text-base md:text-lg font-semibold text-primary-foreground transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
            {!loading && user?.userName?.[0]?.toUpperCase()}
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <div className="flex flex-col">
              <span className="font-medium">{user?.userName}</span>
              <span className="text-xs text-muted-foreground break-all">
                {user?.email}
              </span>
            </div>
          </DropdownMenuLabel>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={handleLogout}
            className="cursor-pointer text-red-600 focus:text-red-600"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  </div>
</header>
  );
};

export default Header;