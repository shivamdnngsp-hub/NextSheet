"use client";

import useAuth from "@/hooks/useAuth";
import { FileSpreadsheet } from "lucide-react";
import CreateSheet from "./createSheet/createSheet";

const Header = () => {
    
  return (
<header className="border-b">
  <div className="h-20 flex items-center justify-between px-8">

    <h1 className="text-[34px] font-semibold tracking-tight">
      Dashboard
    </h1>

    <div className="flex items-center gap-4">
      <CreateSheet />

      <div className="flex h-10 w-10 items-center justify-center rounded-full border">
        S
      </div>
    </div>

  </div>
</header>
  );
};

export default Header;