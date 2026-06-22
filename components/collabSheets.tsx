"use client";

import api from "@/lib/axios";
import { useEffect, useState } from "react";
import { Spinner } from "./ui/spinner";
import { useRouter } from "next/navigation";

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

if(loading){
    return(
        <Spinner></Spinner>
    )
}

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div>
      CollabSheets
    <div>
      {sheets.map((sheet: any) => (
        <div key={sheet._id} onClick={()=> (router.push(`/sheet/${sheet._id}`))} 
        className= "cursor-pointer"
        >
          {sheet.title}
        </div>
      ))}
    </div>
    </div>
  );
};

export default CollabSheets;


