"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Editor } from "@tiptap/core";

const languages=[
  ["English","en-IN"],["Hindi","hi-IN"],["Telugu","te-IN"],["Tamil","ta-IN"],["Kannada","kn-IN"],["Malayalam","ml-IN"],["Marathi","mr-IN"],["Bengali","bn-IN"],["Urdu","ur-IN"],["Spanish","es-ES"],["French","fr-FR"],["German","de-DE"],["Japanese","ja-JP"]
] as const;

export function VoiceInput({editor}:{editor:Editor|null}){
  const recognitionRef=useRef<SpeechRecognition|null>(null);
  const voiceStartRef=useRef<number|null>(null);
  const voiceEndRef=useRef<number|null>(null);
  const latestTranscriptRef=useRef("");
  const [language,setLanguage]=useState("en-IN");
  const [translate,setTranslate]=useState(false);
  const [listening,setListening]=useState(false);
  const [supported,setSupported]=useState(true);
  const [interim,setInterim]=useState("");
  const [message,setMessage]=useState("Ready to dictate");

  const speechCtor=useMemo(()=>typeof window==="undefined"?null:(window.SpeechRecognition??window.webkitSpeechRecognition),[]);
  useEffect(()=>{if(!speechCtor)setSupported(false);},[speechCtor]);

  const replaceVoiceRange=(text:string)=>{
    if(!editor)return;
    const from=voiceStartRef.current??editor.state.selection.from;
    const to=voiceEndRef.current??from;
    editor.chain().focus().insertContentAt({from,to},text).run();
    voiceStartRef.current=from;
    voiceEndRef.current=editor.state.selection.from;
  };

  const start=()=>{
    if(!editor||!speechCtor){setMessage("Speech recognition is not supported in this browser.");return;}
    const recognition=new speechCtor();
    recognition.continuous=true;recognition.interimResults=true;recognition.lang=language;
    const cursor=editor.state.selection.from;voiceStartRef.current=cursor;voiceEndRef.current=cursor;latestTranscriptRef.current="";
    recognition.onstart=()=>{setListening(true);setMessage("Listening… speak naturally.");};
    recognition.onresult=(event)=>{
      let finalText="";let interimText="";
      for(let i=0;i<event.results.length;i++){const result=event.results[i];if(result.isFinal)finalText+=result[0].transcript+" ";else interimText+=result[0].transcript;}
      const combined=(finalText+interimText).trim();
      latestTranscriptRef.current=finalText.trim();
      setInterim(interimText);
      replaceVoiceRange(combined+(combined?" ":""));
    };
    recognition.onerror=(event)=>{setListening(false);setMessage("Mic error: "+event.error);};
    recognition.onend=async()=>{
      setListening(false);setInterim("");
      const raw=latestTranscriptRef.current.trim();
      if(translate&&raw){
        setMessage("Translating to English…");
        try{
          const response=await fetch("/api/translate",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({text:raw,source:language.split("-")[0]})});
          const data=await response.json();
          if(response.ok&&data.translation){replaceVoiceRange(data.translation+" ");}
          setMessage(response.ok?"Saved in English":"Saved in spoken language");
        }catch{setMessage("Saved in spoken language");}
      }else setMessage("Saved to the chapter");
    };
    recognitionRef.current=recognition;
    try{recognition.start();}catch{setMessage("Microphone could not start.");}
  };

  const stop=()=>recognitionRef.current?.stop();

  useEffect(()=>()=>recognitionRef.current?.abort(),[]);

  return <div className="flex flex-wrap items-center gap-2">
    <button type="button" aria-label="Voice writing" disabled={!supported} onClick={listening?stop:start} className={"inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs transition "+(listening?"voice-active border-red-400/50 bg-red-500/15 text-red-200":"border-white/10 bg-white/[.03] text-stone-300 hover:bg-white/[.06]")}>
      <span className={"grid h-6 w-6 place-items-center rounded-full "+(listening?"bg-red-500 text-white":"bg-white/10")}>{listening?"■":"🎙"}</span>{listening?"Stop voice":"Voice"}
    </button>
    <select value={language} onChange={e=>setLanguage(e.target.value)} className="rounded-full border border-white/10 bg-black/30 px-3 py-2 text-xs text-stone-300 outline-none">
      {languages.map(([label,code])=><option key={code} value={code}>{label}</option>)}
    </select>
    <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/10 bg-white/[.03] px-3 py-2 text-xs text-stone-400">
      <input type="checkbox" checked={translate} onChange={e=>setTranslate(e.target.checked)} className="accent-red-500"/>Translate to English
    </label>
    <span className="max-w-[250px] truncate text-[11px] text-stone-600">{message}{interim?" · “"+interim+"…”":""}</span>
  </div>;
}