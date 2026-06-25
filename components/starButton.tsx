import api from "@/lib/axios";
import { Star } from "lucide-react";
import { useState } from "react";
import { Spinner } from "./ui/spinner";

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

type StarButtonProps = {
    sheetId: string;
    starredSheets: StarredSheet[];
    setStarredSheets: React.Dispatch<React.SetStateAction<StarredSheet[]>>;
};


const StarButton = ({ starredSheets, setStarredSheets, sheetId }: StarButtonProps) => {

    const [loading,setLoading] = useState(false)

    const isStarred = starredSheets.some(
        (star) => star.sheet._id === sheetId
    );

const handleClick = async ( e: React.MouseEvent<SVGSVGElement>) => {
  try {
       if (loading) return;
      e.stopPropagation();
      setLoading(true);
    if (isStarred) {
      await api.delete("/sheets/removeStarred", {
        data: { sheetId },
      });
    
      setStarredSheets((prev) =>
        prev.filter((star) => star.sheet._id !== sheetId)
      );
    } else {
      const res = await api.post("/sheets/addStarred", {
        sheetId,
      });
     
      setStarredSheets((prev) => [...prev, res.data.starredSheet]);
    }
  } catch (error) {
    console.error(error);
  }finally{
    setLoading(false)
  }
};


if(loading){
    return(
        <Spinner></Spinner>
    )
}

    return (
        <Star
            className={`h-5 w-5 cursor-pointer transition-colors ${isStarred
                    ? "fill-emerald-500 text-emerald-500"
                    : "text-gray-400 hover:text-emerald-500"
                }`}
            onClick={handleClick}

        />
    )
}
export default StarButton