"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { RepeatedWords } from "@/lib/repeated-extension";
import { countWords } from "@/lib/words";
import { VoiceInput } from "@/components/voice-input";
import Link from "next/link";
import { signOut } from "next-auth/react";

type Chapter={id:string;title:string;order:number;wordCount:number};
type Popup={word:string;from:number;to:number;left:number;top:number};

export function EditorRoom({novelId,novelTitle,chapterId,chapterTitle,initialContent,chapters}:{novelId:string;novelTitle:string;chapterId:string;chapterTitle:string;initialContent:object;chapters:Chapter[]}){
  const editorRef=useRef<Editor|null>(null);
  const saveTimer=useRef<ReturnType<typeof setTimeout>|null>(null);
  const [title,setTitle]=useState(chapterTitle);
  const [status,setStatus]=useState("Saved");
  const [wordCount,setWordCount]=useState(0);
  const [popup,setPopup]=useState<Popup|null>(null);
  const [synonyms,setSynonyms]=useState<string[]>([]);
  const [allOccurrences,setAllOccurrences]=useState(false);
  const [leftChapterOpen,setLeftChapterOpen]=useState(false);

  const onWordClick=useCallback((payload:{word:string;from:number;to:number})=>{
    setPopup({word:payload.word,from:payload.from,to:payload.to,left:Math.max(12,(window.innerWidth-320)/2),top:105});
  },[]);

  const editor=useEditor({
    immediatelyRender:false,
    extensions:[
      StarterKit.configure({history:true}),
      Placeholder.configure({placeholder:"Begin the chapter. Let the scene breathe…"}),
      RepeatedWords.configure({onWordClick})
    ],
    content:initialContent,
    editorProps:{attributes:{class:"noval-editor"}},
    onCreate:({editor})=>{editorRef.current=editor;setWordCount(countWords(editor.getText()));},
    onUpdate:({editor})=>{
      setWordCount(countWords(editor.getText()));
      setStatus("Unsaved changes");
      if(saveTimer.current)clearTimeout(saveTimer.current);
      saveTimer.current=setTimeout(async()=>{
        setStatus("Saving…");
        try{
          const content=JSON.stringify(editor.getJSON());
          const response=await fetch("/api/chapters/"+chapterId,{method:"PATCH",headers:{"content-type":"application/json"},body:JSON.stringify({content,wordCount:countWords(editor.getText())})});
          if(!response.ok)throw new Error();
          setStatus("Saved");
        }catch{setStatus("Save failed");}
      },850);
    }
  });

  useEffect(()=>{editorRef.current=editor;return()=>{if(saveTimer.current)clearTimeout(saveTimer.current);};},[editor]);

  useEffect(()=>{
    if(!popup){setSynonyms([]);return;}
    const current=editorRef.current;
    if(!current)return;
    const context=current.state.doc.textBetween(Math.max(0,popup.from-180),Math.min(current.state.doc.content.size,popup.to+180)," ");
    fetch("/api/synonyms?word="+encodeURIComponent(popup.word)+"&context="+encodeURIComponent(context))
      .then(r=>r.json()).then(data=>setSynonyms(Array.isArray(data.synonyms)?data.synonyms:[])).catch(()=>setSynonyms([]));
  },[popup]);

  const replaceText=(value:string)=>{
    if(!editor||!popup)return;
    const replacement=/^[A-ZÁÉÍÓÚÜÑ]/.test(popup.word)?value.charAt(0).toUpperCase()+value.slice(1):value;
    if(allOccurrences){
      const ranges:{from:number;to:number}[]=[];
      editor.state.doc.descendants((node,pos)=>{
        if(!node.isText||!node.text)return;
        const regex=/[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)?/gu;
        let match:RegExpExecArray|null;
        while((match=regex.exec(node.text)))if(match[0].toLocaleLowerCase()===popup.word.toLocaleLowerCase())ranges.push({from:pos+match.index,to:pos+match.index+match[0].length});
      });
      let chain=editor.chain().focus();
      ranges.reverse().forEach(range=>{chain=chain.insertContentAt(range,replacement);});
      chain.run();
    }else editor.chain().focus().insertContentAt({from:popup.from,to:popup.to},replacement).run();
    setPopup(null);
  };

  const rename=async()=>{
    const trimmed=title.trim();if(!trimmed||trimmed===chapterTitle)return;
    setStatus("Saving title…");
    const response=await fetch("/api/chapters/"+chapterId,{method:"PATCH",headers:{"content-type":"application/json"},body:JSON.stringify({title:trimmed})});
    setStatus(response.ok?"Saved":"Save failed");
  };

  return <div className="min-h-screen" onClick={event=>{if(popup&&!(event.target as HTMLElement).closest("[data-synonym-popup]"))setPopup(null);}}>
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#090909]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1500px] items-center gap-3 px-4 py-3 md:px-6">
        <Link href="/app" className="grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/[.03] text-stone-200">←</Link>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[10px] uppercase tracking-[.25em] text-stone-600">{novelTitle}</div>
          <input value={title} onChange={e=>setTitle(e.target.value)} onBlur={rename} className="novel-input w-full max-w-xl truncate font-display text-lg text-stone-100"/>
        </div>
        <span className="hidden text-xs text-stone-600 md:inline">{status}</span>
        <button onClick={event=>{event.stopPropagation();setLeftChapterOpen(v=>!v);}} className="rounded-full border border-white/10 px-3 py-2 text-xs text-stone-300 md:hidden">Chapters</button>
        <button onClick={()=>signOut({callbackUrl:"/"})} className="rounded-full border border-white/10 px-3 py-2 text-xs text-stone-400">Exit</button>
      </div>
    </header>
    <div className="mx-auto flex max-w-[1500px]">
      <aside className={(leftChapterOpen?"fixed inset-0 z-30 block":"hidden")+" w-72 shrink-0 border-r border-white/10 bg-[#0b0b0c]/95 p-4 backdrop-blur-xl md:sticky md:top-[58px] md:block md:h-[calc(100vh-58px)]"}>
        <div className="mb-4 flex items-center justify-between text-xs uppercase tracking-[.2em] text-stone-600"><span>Chapters</span><button onClick={()=>setLeftChapterOpen(false)} className="md:hidden text-stone-400">×</button></div>
        <div className="scrollbar-thin max-h-[calc(100vh-120px)] space-y-1 overflow-y-auto">
          {chapters.map(ch=><Link onClick={()=>setLeftChapterOpen(false)} key={ch.id} href={"/editor/"+novelId+"/"+ch.id} className={"block rounded-xl px-3 py-3 text-sm transition "+(ch.id===chapterId?"bg-white/[.07] text-white":"text-stone-500 hover:bg-white/[.04] hover:text-stone-300")}><div className="truncate">{ch.title}</div><div className="mt-1 text-[10px] text-stone-700">{ch.wordCount.toLocaleString()} words</div></Link>)}
        </div>
      </aside>
      <main className="min-w-0 flex-1">
        <div className="mx-auto max-w-4xl px-5 pb-20 pt-6 md:px-10">
          <div className="glass sticky top-[70px] z-20 mb-5 rounded-2xl p-3">
            <div className="flex flex-wrap items-center gap-2">
              <button onClick={()=>editor?.chain().focus().toggleBold().run()} className="rounded-lg px-3 py-2 text-xs text-stone-300 hover:bg-white/5">Bold</button>
              <button onClick={()=>editor?.chain().focus().toggleItalic().run()} className="rounded-lg px-3 py-2 text-xs text-stone-300 hover:bg-white/5">Italic</button>
              <button onClick={()=>editor?.chain().focus().toggleHeading({level:2}).run()} className="rounded-lg px-3 py-2 text-xs text-stone-300 hover:bg-white/5">H2</button>
              <button onClick={()=>editor?.chain().focus().toggleBlockquote().run()} className="rounded-lg px-3 py-2 text-xs text-stone-300 hover:bg-white/5">Quote</button>
              <div className="mx-1 hidden h-5 w-px bg-white/10 sm:block"/>
              <VoiceInput editor={editor}/>
            </div>
          </div>
          <div className="editor-wrap glass rounded-[2rem] px-5 sm:px-8 md:px-14">
            <EditorContent editor={editor}/>
          </div>
          <div className="mt-3 flex items-center justify-between px-2 text-[11px] text-stone-600"><span>Repeated words highlight after 3 occurrences.</span><span>{wordCount.toLocaleString()} words</span></div>
        </div>
      </main>
    </div>
    {popup&&<div data-synonym-popup className="fixed z-50 w-[300px] rounded-2xl border border-white/10 bg-[#131314]/95 p-4 shadow-2xl backdrop-blur-xl" style={{left:popup.left,top:popup.top}} onClick={e=>e.stopPropagation()}>
      <div className="mb-3 flex items-center justify-between"><div><div className="text-[10px] uppercase tracking-[.2em] text-red-300">Repeated word</div><div className="font-display text-xl text-white">{popup.word}</div></div><button onClick={()=>setPopup(null)} className="text-stone-500 hover:text-white">×</button></div>
      <label className="mb-3 flex items-center gap-2 text-[11px] text-stone-400"><input type="checkbox" checked={allOccurrences} onChange={e=>setAllOccurrences(e.target.checked)} className="accent-red-500"/>Replace every occurrence</label>
      <div className="flex max-h-32 flex-wrap gap-2 overflow-y-auto">{synonyms.length?synonyms.map(s=><button key={s} onClick={()=>replaceText(s)} className="rounded-full border border-white/10 bg-white/[.04] px-3 py-2 text-xs text-stone-300 hover:border-red-400/40 hover:bg-red-500/10 hover:text-red-100">{s}</button>):<span className="text-xs text-stone-600">Finding synonyms…</span>}</div>
      <p className="mt-3 text-[10px] leading-4 text-stone-600">Datamuse suggestions use the word and nearby sentence context.</p>
    </div>}
  </div>;
}