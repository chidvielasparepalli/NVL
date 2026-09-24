import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth";
import { EditorRoom } from "@/components/editor-room";

export default async function EditorPage({params}:{params:Promise<{novelId:string;chapterId:string}>}){
  const userId=await getCurrentUserId();if(!userId)redirect("/");
  const {novelId,chapterId}=await params;
  const novel=await prisma.novel.findFirst({where:{id:novelId,userId},include:{chapters:{orderBy:{order:"asc"},select:{id:true,title:true,order:true,wordCount:true}}}});
  if(!novel)notFound();
  const chapter=novel.chapters.find(item=>item.id===chapterId);if(!chapter)notFound();
  const full=await prisma.chapter.findFirst({where:{id:chapterId,novelId}});
  if(!full)notFound();
  let initialContent:object={type:"doc",content:[{type:"paragraph"}]};try{initialContent=JSON.parse(full.content);}catch{}
  return <EditorRoom novelId={novel.id} novelTitle={novel.title} chapterId={chapter.id} chapterTitle={chapter.title} initialContent={initialContent} chapters={novel.chapters}/>;
}