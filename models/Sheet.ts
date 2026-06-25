import mongoose from "mongoose";

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
  },
collaborators:[{

user:{
    type: mongoose.Schema.Types.ObjectId,
    ref:"User"
},
role:{
    type:String,
    enum:["viewer","editor"],
    default:"editor"
}

}],
SheetMode:{
    type:String,
     enum: ["private", "link"],
    default: "link",
}


},{
    timestamps:true
})
export default mongoose.models.Sheet || mongoose.model("Sheet",sheetSchema)