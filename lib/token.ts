import jwt from "jsonwebtoken"

export const accessTokenGenerator = (userId: string)=>{
    return jwt.sign({userId},process.env.ACCESS_SECRET as string,{expiresIn:"15m"})
}

export const refreshTokenGenerator = (userId: string)=>{
    return jwt.sign({userId},process.env.REFRESH_SECRET as string,{expiresIn:"7d"})
}
