"use client"
import CollabSheets from "@/components/collabSheets"
import CreateSheet from "@/components/createSheet/createSheet"
import Header from "@/components/header"
import Mysheets from "@/components/mySheets"
import SideBar from "@/components/sideBar"
import useAuth from "@/hooks/useAuth"
import { useEffect } from "react"

const DashBoared = () => {

    return (



       <div className="flex h-screen bg-background">
  <SideBar />

  <main className="flex-1 overflow-y-auto bg-card">
    <Header />

    <div className="space-y-12 px-10 py-8">
      <Mysheets />
      <CollabSheets />
    </div>
  </main>
</div>

    )


}
export default DashBoared