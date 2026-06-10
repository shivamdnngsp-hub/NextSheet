
import mongoose from "mongoose";

const mongoUrl = process.env.MONGODB_URL as string;


type mongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  var mongoose: mongooseCache | undefined;
}

const cached: mongooseCache = global.mongoose ?? {
  conn: null,
  promise: null,
};

export const connectDB = async ()=>{
  if(!mongoUrl){
    throw new Error("mongoDb url not found");
  }
  if(cached.conn){
    return cached.conn;
  }
  if(!cached.promise){
    cached.promise =  mongoose.connect(mongoUrl);
  }

  cached.conn = await cached.promise;
  global.mongoose = cached;
  return cached.conn
}



