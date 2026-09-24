import { getCurrentUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
export async function requireUser(){const userId=await getCurrentUserId();if(!userId)throw new Error("UNAUTHENTICATED");return userId;}
export async function requireNovelOwner(novelId:string){const userId=await requireUser();const novel=await prisma.novel.findFirst({where:{id:novelId,userId}});if(!novel)throw new Error("NOT_FOUND");return {userId,novel};}
export async function requireChapterOwner(chapterId:string){const userId=await requireUser();const chapter=await prisma.chapter.findFirst({where:{id:chapterId,novel:{userId}}});if(!chapter)throw new Error("NOT_FOUND");return {userId,chapter};}