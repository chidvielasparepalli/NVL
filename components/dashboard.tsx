"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { SignOutButton } from "@/components/auth-buttons";

type Chapter={id:string;title:string;wordCount:number;order:number;updatedAt:string};
type Novel={id:string;title:string;createdAt:string;updatedAt:string;chapters:Chapter[]};

export function Dashboard(){
  const {data:session}=useSession();
  const [novels,setNovels]=useState<Novel[]>([]);
  const [selected,setSelected]=useState<string|null>(null);
  const [loading,setLoading]=useState(true);
  const [creating,setCreating]=useState(false);

  const load=async()=>{setLoading(true);try{const r=await fetch("/api/novels",{cache:"no-store"});if(r.ok){const data=await r.json();setNovels(data);setSelected((current)=>current??data[0]?.id??null);}}finally{setLoading(false);}};
  useEffect(()=>{load();},[]);

  const current=useMemo(()=>novels.find(n=>n.id===selected)??novels[0]??null,[novels,selected]);
  const wordTotal=current?.chapters.reduce((sum,ch)=>sum+ch.wordCount,0)??0;
  const createNovel=async()=>{const title=window.prompt("Novel title","Untitled Novel");if(!title?.trim())return;setCreating(true);try{const r=await fetch("/api/novels",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({title})});if(r.ok){const novel=await r.json();window.location.href="/editor/"+novel.id+"/"+novel.chapters[0].id;}}finally{setCreating(false);}};
  const renameNovel=async(novel:Novel)=>{const title=window.prompt("Rename novel",novel.title);if(!title?.trim()||title.trim()===novel.title)return;const r=await fetch("/api/novels/"+novel.id,{method:"PATCH",headers:{"content-type":"application/json"},body:JSON.stringify({title})});if(r.ok)setNovels(items=>items.map(item=>item.id===novel.id?{...item,title:title.trim()}:item));};
  const deleteNovel=async(novel:Novel)=>{if(!window.confirm("Delete “"+novel.title+"” and all chapters?"))return;const r=await fetch("/api/novels/"+novel.id,{method:"DELETE"});if(r.ok){setNovels(items=>items.filter(item=>item.id!==novel.id));if(selected===novel.id)setSelected(null);}};
  const createChapter=async()=>{if(!current)return;const title=window.prompt("Chapter title","New Chapter");if(!title?.trim())return;const r=await fetch("/api/novels/"+current.id+"/chapters",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({title})});if(r.ok){const chapter=await r.json();window.location.href="/editor/"+current.id+"/"+chapter.id;}};

  return <main className="min-h-screen">
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#090909]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-5 py-4 md:px-8">
        <div className="mr-auto"><div className="font-display text-2xl text-stone-100">NOVAL</div><div className="text-[9px] uppercase tracking-[.35em] text-stone-600">your private writing room</div></div>
        <div className="hidden text-right sm:block"><div className="text-xs text-stone-400">{session?.user?.name??"Writer"}</div><div className="text-[10px] text-stone-700">{session?.user?.email}</div></div>
        <SignOutButton/>
      </div>
    </header>
    <div className="mx-auto grid max-w-7xl gap-5 px-5 py-5 md:grid-cols-[280px_1fr] md:px-8 md:py-8">
      <aside className="glass rounded-[2rem] p-4 md:sticky md:top-24 md:h-[calc(100vh-130px)]">
        <div className="mb-4 flex items-center justify-between"><span className="text-[10px] uppercase tracking-[.3em] text-stone-600">Library</span><button disabled={creating} onClick={createNovel} className="rounded-full bg-red-600 px-3 py-1.5 text-xs text-white hover:bg-red-500">+ Novel</button></div>
        <div className="space-y-2 overflow-y-auto">{loading?<div className="p-4 text-sm text-stone-700">Opening your library…</div>:novels.length?novels.map(n=><button key={n.id} onClick={()=>setSelected(n.id)} className={"w-full rounded-2xl border px-4 py-3 text-left transition "+(current?.id===n.id?"border-red-400/20 bg-red-500/[.07]":"border-white/5 bg-white/[.02] hover:bg-white/[.04]")}><div className="truncate text-sm text-stone-200">{n.title}</div><div className="mt-1 text-[10px] text-stone-600">{n.chapters.length} chapter{n.chapters.length===1?"":"s"} · {n.chapters.reduce((s,c)=>s+c.wordCount,0).toLocaleString()} words</div></button>):<div className="rounded-2xl border border-dashed border-white/10 p-5 text-sm leading-6 text-stone-600">Your library is empty. Start the first story.</div>}</div>
      </aside>
      <section className="min-w-0">
        {current?<><div className="mb-5 flex flex-wrap items-end gap-4"><div className="mr-auto"><div className="text-[10px] uppercase tracking-[.3em] text-red-300">Writing desk</div><h1 className="mt-2 font-display text-5xl text-stone-100">{current.title}</h1></div><div className="flex gap-2"><button onClick={()=>renameNovel(current)} className="rounded-full border border-white/10 px-4 py-2 text-xs text-stone-300 hover:bg-white/5">Rename</button><button onClick={()=>deleteNovel(current)} className="rounded-full border border-white/10 px-4 py-2 text-xs text-stone-500 hover:border-red-400/30 hover:text-red-200">Delete</button></div></div>
          <div className="mb-5 grid gap-3 sm:grid-cols-3"><div className="glass rounded-2xl p-4"><div className="text-[10px] uppercase tracking-[.2em] text-stone-600">Words</div><div className="mt-2 text-2xl text-stone-100">{wordTotal.toLocaleString()}</div></div><div className="glass rounded-2xl p-4"><div className="text-[10px] uppercase tracking-[.2em] text-stone-600">Chapters</div><div className="mt-2 text-2xl text-stone-100">{current.chapters.length}</div></div><div className="glass rounded-2xl p-4"><div className="text-[10px] uppercase tracking-[.2em] text-stone-600">Status</div><div className="mt-2 text-2xl text-red-200">Autosaving</div></div></div>
          <div className="glass rounded-[2rem] p-5 md:p-7"><div className="mb-5 flex items-center justify-between"><div><div className="text-[10px] uppercase tracking-[.3em] text-stone-600">Chapters</div><div className="mt-1 text-sm text-stone-400">Pick a chapter and disappear into the page.</div></div><button onClick={createChapter} className="rounded-full border border-white/10 bg-white/[.04] px-4 py-2 text-xs text-stone-200 hover:bg-white/[.07]">+ New chapter</button></div><div className="space-y-2">{current.chapters.map(ch=><Link href={"/editor/"+current.id+"/"+ch.id} key={ch.id} className="group flex items-center gap-4 rounded-2xl border border-white/5 bg-black/20 p-4 transition hover:border-white/10 hover:bg-white/[.03]"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/[.04] text-xs text-stone-500">{ch.order+1}</span><span className="min-w-0 flex-1"><span className="block truncate text-sm text-stone-200">{ch.title}</span><span className="block pt-1 text-[10px] text-stone-600">{ch.wordCount.toLocaleString()} words</span></span><span className="text-stone-700 transition group-hover:translate-x-1 group-hover:text-red-300">→</span></Link>)}</div></div>
        </>:<div className="glass min-h-[70vh] rounded-[2rem] p-8 md:p-12"><div className="max-w-xl pt-12"><div className="text-6xl">🖋</div><h1 className="mt-6 font-display text-5xl text-stone-100">A blank page is an invitation.</h1><p className="mt-5 text-stone-500">Create a novel and NOVAL will create the first chapter for you.</p><button onClick={createNovel} className="mt-8 rounded-full bg-red-600 px-5 py-3 text-sm font-semibold text-white hover:bg-red-500">Create your first novel</button></div></div>}
      </section>
    </div>
  </main>;
}