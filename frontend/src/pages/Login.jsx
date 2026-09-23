import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, CheckCircle2, Lock, Mail } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";

export const Login=()=>{
  const {login,isAuthenticated}=useAuth(), nav=useNavigate();
  const [params,setParams]=useSearchParams();
  const resetToken=params.get("reset")||"";
  const [mode,setMode]=useState(resetToken?"reset":"login");
  const [email,setEmail]=useState(""),[password,setPassword]=useState(""),[confirmPassword,setConfirmPassword]=useState("");
  const [loading,setLoading]=useState(false),[error,setError]=useState(""),[success,setSuccess]=useState("");

  useEffect(()=>{if(isAuthenticated)nav("/dashboard")},[isAuthenticated,nav]);
  useEffect(()=>{if(resetToken){setMode("reset");clearMessages()}},[resetToken]);

  const clearMessages=()=>{setError("");setSuccess("")};

  const submit=async e=>{
    e.preventDefault();clearMessages();
    if(!email||!password){setError("Email and password are required.");return;}
    setLoading(true);
    try{
      const r=await API.post("/auth/login",{email:email.trim(),password});
      login(r.data.token,r.data.email,r.data.role,r.data.isPrimaryAdmin);
      nav("/dashboard");
    }catch(err){setError(err.response?.data?.msg||"Authentication failed.")}finally{setLoading(false)}
  };

  const requestReset=async e=>{
    e.preventDefault();clearMessages();
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())){setError("Please enter a valid email address.");return;}
    setLoading(true);
    try{const r=await API.post("/auth/forgot-password",{email:email.trim()});setSuccess(r.data?.msg||"Check your email for a password reset link.");}
    catch(err){setError(err.response?.data?.msg||"Unable to start password reset.")}finally{setLoading(false)}
  };

  const resetPassword=async e=>{
    e.preventDefault();clearMessages();
    if(password.length<8){setError("Password must be at least 8 characters long.");return;}
    if(password!==confirmPassword){setError("Passwords do not match.");return;}
    if(!resetToken){setError("This reset link is missing its token.");return;}
    setLoading(true);
    try{
      const r=await API.post("/auth/reset-password",{token:resetToken,password});
      setSuccess(r.data?.msg||"Password changed successfully. You can now sign in.");
      setPassword("");setConfirmPassword("");
      setMode("login");
      setParams({}, {replace:true});
    }catch(err){setError(err.response?.data?.msg||"Unable to reset password.")}finally{setLoading(false)}
  };

  const header={login:{eyebrow:"Private studio",title:"Welcome back.",description:"Sign in to manage enquiries and your portfolio."},forgot:{eyebrow:"Account recovery",title:"Reset your password.",description:"Enter an admin email and we'll send a secure reset link."},reset:{eyebrow:"Secure reset",title:"Choose a new password.",description:"This link is valid for 30 minutes and can only be used once."}}[mode];

  return <div className="endless-page"><Navbar/><main className="endless-shell min-h-[calc(100vh-76px)] grid place-items-center py-16"><div className="w-full max-w-md endless-card rounded-[2rem] p-7 sm:p-10">
    <p className="text-[10px] uppercase tracking-[.35em] text-[#9a6845] font-bold">{header.eyebrow}</p><h1 className="endless-serif text-4xl mt-3">{header.title}</h1><p className="text-sm text-[#77766f] mt-2">{header.description}</p>

    {mode==="login"&&<form onSubmit={submit} className="mt-8 space-y-5">
      <label className="block"><span className="text-xs font-bold">Email</span><div className="mt-2 relative"><Mail className="absolute left-4 top-3.5 text-[#999] size-4"/><input type="email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full rounded-xl border border-[#d9d2c6] bg-white pl-11 pr-4 py-3.5 outline-none focus:border-[#9a6845]" placeholder="admin@example.com" autoComplete="username"/></div></label>
      <label className="block"><span className="text-xs font-bold">Password</span><div className="mt-2 relative"><Lock className="absolute left-4 top-3.5 text-[#999] size-4"/><input type="password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full rounded-xl border border-[#d9d2c6] bg-white pl-11 pr-4 py-3.5 outline-none focus:border-[#9a6845]" placeholder="••••••••" autoComplete="current-password"/></div></label>
      {error&&<p className="rounded-xl bg-red-50 text-red-700 p-3 text-sm">{error}</p>}{success&&<p className="rounded-xl bg-green-50 text-green-700 p-3 text-sm">{success}</p>}
      <button disabled={loading} className="w-full rounded-xl bg-[#1f211e] text-white py-4 font-bold flex items-center justify-center gap-2 disabled:opacity-60">{loading?"Signing in…":"Open studio"}<ArrowRight size={16}/></button>
      <button type="button" onClick={()=>{setMode("forgot");clearMessages()}} className="w-full text-sm font-bold text-[#9a6845]">Forgot password?</button>
    </form>}

    {mode==="forgot"&&<form onSubmit={requestReset} className="mt-8 space-y-5">
      <label className="block"><span className="text-xs font-bold">Admin email</span><div className="mt-2 relative"><Mail className="absolute left-4 top-3.5 text-[#999] size-4"/><input type="email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full rounded-xl border border-[#d9d2c6] bg-white pl-11 pr-4 py-3.5 outline-none focus:border-[#9a6845]" placeholder="admin@example.com" autoComplete="email"/></div></label>
      {error&&<p className="rounded-xl bg-red-50 text-red-700 p-3 text-sm">{error}</p>}{success&&<p className="rounded-xl bg-green-50 text-green-700 p-3 text-sm flex gap-2 items-start"><CheckCircle2 size={17} className="mt-0.5 shrink-0"/>{success}</p>}
      <button disabled={loading} className="w-full rounded-xl bg-[#1f211e] text-white py-4 font-bold flex items-center justify-center gap-2 disabled:opacity-60">{loading?"Sending link…":"Send reset link"}<ArrowRight size={16}/></button>
      <button type="button" onClick={()=>{setMode("login");clearMessages()}} className="w-full text-sm font-bold text-[#77766f] flex justify-center items-center gap-2"><ArrowLeft size={15}/> Back to sign in</button>
    </form>}

    {mode==="reset"&&<form onSubmit={resetPassword} className="mt-8 space-y-5">
      <label className="block"><span className="text-xs font-bold">New password</span><input type="password" value={password} onChange={e=>setPassword(e.target.value)} className="mt-2 w-full rounded-xl border border-[#d9d2c6] bg-white px-4 py-3.5 outline-none focus:border-[#9a6845]" placeholder="At least 8 characters" autoComplete="new-password"/></label>
      <label className="block"><span className="text-xs font-bold">Confirm password</span><input type="password" value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} className="mt-2 w-full rounded-xl border border-[#d9d2c6] bg-white px-4 py-3.5 outline-none focus:border-[#9a6845]" placeholder="Repeat your password" autoComplete="new-password"/></label>
      {error&&<p className="rounded-xl bg-red-50 text-red-700 p-3 text-sm">{error}</p>}{success&&<p className="rounded-xl bg-green-50 text-green-700 p-3 text-sm flex gap-2 items-start"><CheckCircle2 size={17} className="mt-0.5 shrink-0"/>{success}</p>}
      <button disabled={loading} className="w-full rounded-xl bg-[#1f211e] text-white py-4 font-bold flex items-center justify-center gap-2 disabled:opacity-60">{loading?"Saving password…":"Set new password"}<ArrowRight size={16}/></button>
    </form>}
  </div></main><Footer/></div>
}
