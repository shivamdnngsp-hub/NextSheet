import mongoose from "mongoose";

const starSchema = new mongoose.Schema({
    sheet:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Sheet"
    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }
})
export default mongoose.models.Starred || mongoose.model("Starred",starSchema)