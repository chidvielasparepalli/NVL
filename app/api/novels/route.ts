import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/api";

export async function GET(){
  try{const userId=await requireUser();const novels=await prisma.novel.findMany({where:{userId},include:{chapters:{orderBy:{order:"asc"},select:{id:true,title:true,wordCount:true,updatedAt:true,order:true}}},orderBy:{updatedAt:"desc"}});return NextResponse.json(novels);}
  catch(error){return NextResponse.json({error:String(error).includes("UNAUTHENTICATED")?"Unauthorized":"Request failed"},{status:String(error).includes("UNAUTHENTICATED")?401:500});}
}
const createSchema=z.object({title:z.string().trim().min(1).max(120)});
export async function POST(request:Request){
  try{const userId=await requireUser();const {title}=createSchema.parse(await request.json());const novel=await prisma.novel.create({data:{title,userId,chapters:{create:{title:"Chapter 1",order:0,content:JSON.stringify({type:"doc",content:[{type:"paragraph"}]})}}},include:{chapters:true}});return NextResponse.json(novel,{status:201});}
  catch(error){return NextResponse.json({error:"Unable to create novel"},{status:400});}
}