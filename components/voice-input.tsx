"use client";
import{useEffect,useState}from"react";
import type{Editor}from"@tiptap/core";
import{api}from"@/lib/api-client";
type SpeechCtor=new()=>SpeechRecognition;
const languages=[["English","en-IN"],["Hindi","hi-IN"],["Telugu","te-IN"],["Tamil","ta-IN"],["Kannada","kn-IN"],["Malayalam","ml-IN"],["Marathi","mr-IN"],["Bengali","bn-IN"],["Urdu","ur-IN"],["Spanish","es-ES"],["French","fr-FR"],["German","de-DE"],["Japanese","ja-JP"]] as const;
export function VoiceInput({editor}:{editor:Editor|null}){
  const[recognition,setRecognition]=useState<SpeechRecognition|null>(null);
  const[Ctor]=useState<SpeechCtor|null>(()=>typeof window==="undefined"?null:((window.SpeechRecognition??window.webkitSpeechRecognition) as SpeechCtor|null));
  const[listening,setListening]=useState(false);const[supported,setSupported]=useState(true);const[language,setLanguage]=useState("en-IN");const[translate,setTranslate]=useState(false);const[status,setStatus]=useState("Ready to dictate");const[startPos,setStartPos]=useState(0);const[endPos,setEndPos]=useState(0);const[finalText,setFinalText]=useState("");
  useEffect(()=>{if(!Ctor)setSupported(false);},[Ctor]);
  useEffect(()=>()=>{recognition?.abort();},[recognition]);
  const replaceRange=(text:string)=>{if(!editor)return;editor.chain().focus().insertContentAt({from:startPos,to:endPos},text).run();setEndPos(editor.state.selection.from);};
  const start=()=>{if(!editor||!Ctor){setStatus("Use Chrome/Edge for speech input.");return;}const r=new Ctor();r.lang=language;r.continuous=true;r.interimResults=true;setStartPos(editor.state.selection.from);setEndPos(editor.state.selection.from);setFinalText("");
    r.onstart=()=>{setListening(true);setStatus("Listening…");};
    r.onresult=(event:SpeechRecognitionEvent)=>{let all="";let interim="";for(let i=0;i<event.results.length;i++){const result=event.results[i];if(result.isFinal)all+=result[0].transcript+" ";else interim+=result[0].transcript;}setFinalText(all.trim());const combined=(all+interim).trim();if(combined)replaceRange(combined+" ");};
    r.onerror=(event:SpeechRecognitionErrorEvent)=>{setListening(false);setStatus("Mic error: "+event.error);};
    r.onend=async()=>{setListening(false);const raw=finalText.trim();if(translate&&raw){try{const d=await api<{translation?:string}>("/tools/translate",{method:"POST",body:JSON.stringify({text:raw,source:language})});replaceRange((d.translation??raw)+" ");setStatus("Translated");}catch{setStatus("Saved");}}else setStatus("Saved");};
    setRecognition(r);r.start();
  };
  const stop=()=>{recognition?.stop();setListening(false);};
  return <div className="flex flex-wrap items-center gap-2"><button disabled={!supported} onClick={listening?stop:start} className={"inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs "+(listening?"voice-active border-red-400/50 bg-red-500/15 text-red-200":"border-white/10 bg-white/[.03] text-stone-300")}><span>{listening?"■":"🎙"}</span>{listening?"Stop voice":"Voice"}</button><select value={language} onChange={e=>setLanguage(e.target.value)} className="rounded-full border border-white/10 bg-black/30 px-3 py-2 text-xs text-stone-300">{languages.map(([label,code])=><option key={code} value={code}>{label}</option>)}</select><label className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[.03] px-3 py-2 text-xs text-stone-400"><input type="checkbox" checked={translate} onChange={e=>setTranslate(e.target.checked)} className="accent-red-500"/>Translate</label><span className="text-[11px] text-stone-600">{status}</span></div>;
}