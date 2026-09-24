import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "prosemirror-state";
import { Decoration, DecorationSet } from "prosemirror-view";
import type { Node as PMNode } from "prosemirror-model";
import { getRepeatedWords, normalizeWord } from "@/lib/words";

export const repeatedWordsPluginKey=new PluginKey("noval-repeated-words");

type WordClickPayload={word:string;from:number;to:number};

function findWordRange(doc:PMNode,pos:number){let found:WordClickPayload|null=null;doc.descendants((node,nodePos)=>{if(found||!node.isText||!node.text)return;const text=node.text;const regex=/[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)?/gu;let match:RegExpExecArray|null;while((match=regex.exec(text))){const from=nodePos+match.index;const to=from+match[0].length;if(pos>=from&&pos<=to){found={word:match[0],from,to};break;}}});return found;}

function buildDecorations(doc:PMNode){const repeated=getRepeatedWords(doc.textContent,3);const decorations:Decoration[]=[];doc.descendants((node,nodePos)=>{if(!node.isText||!node.text)return;const regex=/[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)?/gu;let match:RegExpExecArray|null;while((match=regex.exec(node.text))){if(repeated.has(normalizeWord(match[0]))){const from=nodePos+match.index;const to=from+match[0].length;decorations.push(Decoration.inline(from,to,{class:"repeated-word","data-repeated-word":normalizeWord(match[0])}));}}});return DecorationSet.create(doc,decorations);}

export const RepeatedWords=Extension.create<{onWordClick?:(payload:WordClickPayload)=>void}>({
  name:"repeatedWords",
  addOptions(){return {onWordClick:undefined};},
  addProseMirrorPlugins(){const onWordClick=this.options.onWordClick;return [new Plugin({
    key:repeatedWordsPluginKey,
    state:{init:(_,state)=>buildDecorations(state.doc),apply:(tr,old)=>tr.docChanged?buildDecorations(tr.doc):old},
    props:{decorations(state){return repeatedWordsPluginKey.getState(state);},handleClick(view,pos,event){const target=event.target as HTMLElement|null;const repeated=target?.closest?.("[data-repeated-word]") as HTMLElement|null;if(!repeated)return false;const range=findWordRange(view.state.doc,pos);if(range){onWordClick?.(range);return true;}return false;}}
  })];}
});