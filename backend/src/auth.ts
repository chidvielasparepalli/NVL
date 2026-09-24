import type{NextFunction,Request,Response}from"express";import jwt from"jsonwebtoken";import bcrypt from"bcryptjs";
export type AuthRequest=Request&{userId?:string};
const secret=()=>{if(!process.env.JWT_SECRET)throw new Error("JWT_SECRET is not configured");return process.env.JWT_SECRET;};
export function tokenFor(userId:string){return jwt.sign({sub:userId},secret(),{expiresIn:"30d"});}
export function authCookieOptions(){const production=process.env.NODE_ENV==="production";return{httpOnly:true,secure:production,sameSite:production?"none" as const:"lax" as const,maxAge:2592000000,path:"/"};}
export function requireAuth(req:AuthRequest,res:Response,next:NextFunction){try{const token=req.cookies?.noval_token;if(!token)return res.status(401).json({error:"Unauthorized"});const payload=jwt.verify(token,secret()) as jwt.JwtPayload;if(!payload.sub)return res.status(401).json({error:"Unauthorized"});req.userId=String(payload.sub);next();}catch{return res.status(401).json({error:"Unauthorized"});}}
export const hashPassword=(password:string)=>bcrypt.hash(password,12);export const verifyPassword=(password:string,hash:string)=>bcrypt.compare(password,hash);