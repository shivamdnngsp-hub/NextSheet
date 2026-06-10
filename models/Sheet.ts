import mongoose, { mongo } from "mongoose";

const sheetSchema =  new  mongoose.Schema({
title:{
    type:String,
    required: true
},
owner:{
    type: mongoose.Schema.Types.ObjectId,
    ref:"User",
    required: true
},

yjsState: {
    type: Buffer,
    default: Buffer.alloc(0)
  }






},{
    timestamps:true
})
export default mongoose.models.Sheet || mongoose.model("Sheet",sheetSchema)