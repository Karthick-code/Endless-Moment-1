import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Lock, Mail } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";

export const Login=()=>{
  const {login,isAuthenticated}=useAuth(), nav=useNavigate();
  const [email,setEmail]=useState(""),[password,setPassword]=useState(""),[loading,setLoading]=useState(false),[error,setError]=useState("");
  useEffect(()=>{if(isAuthenticated)nav("/dashboard")},[isAuthenticated,nav]);
  const submit=async e=>{e.preventDefault();setError("");if(!email||!password){setError("Email and password are required.");return;}setLoading(true);try{const r=await API.post("/auth/login",{email:email.trim(),password});login(r.data.token,r.data.email);nav("/dashboard")}catch(err){setError(err.response?.data?.msg||"Authentication failed.")}finally{setLoading(false)}};
  return <div className="endless-page"><Navbar/><main className="endless-shell min-h-[calc(100vh-76px)] grid place-items-center py-16"><div className="w-full max-w-md endless-card rounded-[2rem] p-7 sm:p-10">
    <p className="text-[10px] uppercase tracking-[.35em] text-[#9a6845] font-bold">Private studio</p><h1 className="endless-serif text-4xl mt-3">Welcome back.</h1><p className="text-sm text-[#77766f] mt-2">Sign in to manage enquiries and your portfolio.</p>
    <form onSubmit={submit} className="mt-8 space-y-5">
      <label className="block"><span className="text-xs font-bold">Email</span><div className="mt-2 relative"><Mail className="absolute left-4 top-3.5 text-[#999] size-4"/><input type="email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full rounded-xl border border-[#d9d2c6] bg-white pl-11 pr-4 py-3.5 outline-none focus:border-[#9a6845]" placeholder="admin@example.com"/></div></label>
      <label className="block"><span className="text-xs font-bold">Password</span><div className="mt-2 relative"><Lock className="absolute left-4 top-3.5 text-[#999] size-4"/><input type="password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full rounded-xl border border-[#d9d2c6] bg-white pl-11 pr-4 py-3.5 outline-none focus:border-[#9a6845]" placeholder="••••••••"/></div></label>
      {error&&<p className="rounded-xl bg-red-50 text-red-700 p-3 text-sm">{error}</p>}
      <button disabled={loading} className="w-full rounded-xl bg-[#1f211e] text-white py-4 font-bold flex items-center justify-center gap-2">{loading?"Signing in…":"Open studio"}<ArrowRight size={16}/></button>
    </form>
  </div></main><Footer/></div>
}
