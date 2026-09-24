import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireNovelOwner } from "@/lib/api";

const titleSchema=z.object({title:z.string().trim().min(1).max(120)});
export async function PATCH(request:Request,context:{params:Promise<{novelId:string}>}){try{const {novelId}=await context.params;await requireNovelOwner(novelId);const {title}=titleSchema.parse(await request.json());const novel=await prisma.novel.update({where:{id:novelId},data:{title}});return NextResponse.json(novel);}catch{return NextResponse.json({error:"Unable to update novel"},{status:400});}}
export async function DELETE(_request:Request,context:{params:Promise<{novelId:string}>}){try{const {novelId}=await context.params;await requireNovelOwner(novelId);await prisma.novel.delete({where:{id:novelId}});return NextResponse.json({ok:true});}catch{return NextResponse.json({error:"Unable to delete novel"},{status:400});}}