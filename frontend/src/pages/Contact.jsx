import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowUpRight, Check, Instagram, Mail, Phone, Send } from "lucide-react";
import API from "../services/api";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import contactConfig from "../config/contact";
import { services } from "../config/services";

export const Contact = () => {
  const [form,setForm]=useState({name:"",email:"",phone:"",service:"",projectType:"",message:""});
  const [busy,setBusy]=useState(false), [error,setError]=useState(""), [done,setDone]=useState(false);

  const update=e=>setForm(v=>({...v,[e.target.name]:e.target.value}));
  const submit=async e=>{
    e.preventDefault();setError("");
    if(!form.name.trim()||!form.email.trim()||!form.phone.trim()||!form.message.trim()){setError("Please complete your name, email, phone and message.");return;}
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)){setError("Please enter a valid email address.");return;}
    setBusy(true);
    try{await API.post("/leads",{...form,name:form.name.trim(),email:form.email.trim(),phone:form.phone.trim(),message:form.message.trim()});setDone(true);setForm({name:"",email:"",phone:"",service:"",projectType:"",message:""});}
    catch(err){setError(err.response?.data?.msg||err.response?.data?.message||"We couldn't send your enquiry. Please try again.");}
    finally{setBusy(false);}
  };

  return <div className="endless-page"><Navbar/><main className="endless-shell py-14 sm:py-20">
    <div className="grid lg:grid-cols-[.8fr_1.2fr] gap-12 lg:gap-20">
      <div className="lg:sticky lg:top-28 lg:self-start">
        <p className="text-[10px] uppercase tracking-[.35em] text-[#9a6845] font-bold">Let's talk</p>
        <h1 className="endless-serif text-6xl sm:text-7xl leading-[.9] mt-4">Tell us what<br/><i>matters.</i></h1>
        <p className="mt-7 text-[#77766f] leading-7 max-w-md">Share the date, the people, the place, or simply the feeling you're after. We'll take it from there.</p>
        <div className="mt-10 space-y-4">
          {contactConfig.phones.map((p,i)=><a key={i} href={`tel:${p.replace(/\s+/g,"")}`} className="flex items-center gap-3 text-sm font-semibold hover:text-[#9a6845]"><span className="w-9 h-9 rounded-full bg-[#ebe3d7] grid place-items-center"><Phone size={15}/></span>{p}</a>)}
          {contactConfig.emails.map((e,i)=><a key={i} href={`mailto:${e}`} className="flex items-center gap-3 text-sm font-semibold hover:text-[#9a6845] break-all"><span className="w-9 h-9 rounded-full bg-[#ebe3d7] grid place-items-center"><Mail size={15}/></span>{e}</a>)}
          {contactConfig.instagramLinks.map((u,i)=>{const name = u.replace(/\/+$/,"").split("/").pop().split('?')[0].replace("."," ") .replace(/\b\w/g, char => char.toUpperCase());return <a key={i} href={u} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-sm font-semibold hover:text-[#9a6845]"><span className="w-9 h-9 rounded-full bg-[#ebe3d7] grid place-items-center"><Instagram size={15}/></span>@{name}</a>})}
        </div>
      </div>

      <div className="endless-card rounded-[2rem] p-6 sm:p-10">
        <AnimatePresence mode="wait">
        {done?<motion.div key="done" initial={{opacity:0,y:15}} animate={{opacity:1,y:0}} className="min-h-[560px] grid place-items-center text-center">
          <div><div className="w-16 h-16 rounded-full bg-[#d7a26d] grid place-items-center mx-auto"><Check size={28}/></div><h2 className="endless-serif text-4xl mt-7">Message received.</h2><p className="text-[#77766f] max-w-sm mx-auto mt-3 leading-6">Your enquiry is in the studio queue. We'll get back to you using the details you shared.</p><button onClick={()=>setDone(false)} className="mt-8 text-sm font-bold text-[#9a6845]">Send another enquiry</button></div>
        </motion.div>:<motion.form key="form" initial={{opacity:0}} animate={{opacity:1}} onSubmit={submit} className="space-y-6">
          <div className="flex justify-between items-end border-b border-[#ded8cd] pb-5"><div><p className="text-[10px] uppercase tracking-[.3em] text-[#9a6845] font-bold">Enquiry form</p><h2 className="text-2xl font-extrabold mt-1">Build your session</h2></div><span className="text-xs text-[#9a6845]">01 / 01</span></div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Your name"><input name="name" value={form.name} onChange={update} placeholder="Your name" required/></Field>
            <Field label="Email"><input type="email" name="email" value={form.email} onChange={update} placeholder="you@example.com" required/></Field>
            <Field label="Phone"><input name="phone" value={form.phone} onChange={update} placeholder="+91 ..." required/></Field>
            <Field label="What are you planning?"><select name="service" value={form.service} onChange={update}><option value="">Choose one</option>{services.map(s=><option key={s.slug} value={s.slug}>{s.title}</option>)}</select></Field>
          </div>
          <Field label="Event / project type"><input name="projectType" value={form.projectType} onChange={update} placeholder="Wedding, portrait, birthday, film…"/></Field>
          <Field label="Tell us more"><textarea name="message" value={form.message} onChange={update} rows={7} placeholder="Date, location, guest count, mood, ideas — whatever you already know." required/></Field>
          {error&&<div className="rounded-xl bg-red-50 text-red-700 p-4 text-sm">{error}</div>}
          <button disabled={busy} className="endless-button w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-[#1f211e] text-white px-7 py-4 font-bold disabled:opacity-60">{busy?"Sending…":"Send enquiry"} <Send size={16}/></button>
        </motion.form>}
        </AnimatePresence>
      </div>
    </div>
  </main><Footer/></div>;
};

const Field=({label,children})=><label className="block"><span className="block text-[10px] uppercase tracking-[.2em] font-bold text-[#77766f] mb-2">{label}</span>{React.cloneElement(children,{className:"w-full rounded-xl border border-[#d9d2c6] bg-[#fffdf9] px-4 py-3.5 text-sm outline-none focus:border-[#9a6845] focus:ring-2 focus:ring-[#9a6845]/10 transition"})}</label>;
