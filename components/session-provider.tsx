"use client";
import {createContext,useCallback,useContext,useEffect,useMemo,useState} from "react";
import {api} from "@/lib/api-client";
type User={id:string;name:string|null;email:string};
type AuthContextValue={user:User|null;loading:boolean;login:(email:string,password:string)=>Promise<void>;register:(name:string,email:string,password:string)=>Promise<void>;logout:()=>Promise<void>;refresh:()=>Promise<void>};
const AuthContext=createContext<AuthContextValue|null>(null);
export function useAuth(){const value=useContext(AuthContext);if(!value)throw new Error("useAuth must be inside AuthProvider");return value;}
export function AppSessionProvider({children}:{children:React.ReactNode}){const[user,setUser]=useState<User|null>(null);const[loading,setLoading]=useState(true);
const refresh=useCallback(async()=>{try{const data=await api("/auth/me");setUser(data.user??null);}catch{setUser(null);}finally{setLoading(false);}},[]);
useEffect(()=>{refresh();},[refresh]);
const value=useMemo<AuthContextValue>(()=>({user,loading,refresh,login:async(email,password)=>{const data=await api("/auth/login",{method:"POST",body:JSON.stringify({email,password})});setUser(data.user);},register:async(name,email,password)=>{const data=await api("/auth/register",{method:"POST",body:JSON.stringify({name,email,password})});setUser(data.user);},logout:async()=>{try{await api("/auth/logout",{method:"POST"});}finally{setUser(null);}}}),[user,loading,refresh]);
return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;}