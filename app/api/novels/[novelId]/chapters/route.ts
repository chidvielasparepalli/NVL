import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireNovelOwner } from "@/lib/api";
const schema=z.object({title:z.string().trim().min(1).max(120).default("New Chapter")});
export async function POST(request:Request,context:{params:Promise<{novelId:string}>}){try{const {novelId}=await context.params;await requireNovelOwner(novelId);const body=schema.parse(await request.json().catch(()=>({})));const max=await prisma.chapter.aggregate({where:{novelId},_max:{order:true}});const chapter=await prisma.chapter.create({data:{novelId,title:body.title,order:(max._max.order??-1)+1,content:JSON.stringify({type:"doc",content:[{type:"paragraph"}]})}});return NextResponse.json(chapter,{status:201});}catch{return NextResponse.json({error:"Unable to create chapter"},{status:400});}}