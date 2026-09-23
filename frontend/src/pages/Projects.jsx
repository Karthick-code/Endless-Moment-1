import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, X, Upload, Pencil, Trash2, ArrowUpRight, Image as ImageIcon } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useSearchParams } from "react-router-dom";
import API from "../services/api";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { services } from "../config/services";

export const Projects = () => {
  const { isAuthenticated } = useAuth();
  const [projects,setProjects]=useState([]), [loading,setLoading]=useState(true);
  const [show,setShow]=useState(false), [editing,setEditing]=useState(null);
  const [title,setTitle]=useState(""), [description,setDescription]=useState(""), [category,setCategory]=useState(""), [imagesText,setImagesText]=useState("");
  const [error,setError]=useState(""), [success,setSuccess]=useState(""), [uploading,setUploading]=useState(false);
  const [params,setParams]=useSearchParams();
  const selected=params.get("category")||"";

  const load=()=>{setLoading(true); API.get("/projects").then(r=>setProjects(r.data||[])).catch(()=>setProjects([])).finally(()=>setLoading(false));};
  useEffect(load,[]);

  const filtered=useMemo(()=>selected?projects.filter(p=>(p.category||"other")===selected):projects,[projects,selected]);
  const reset=()=>{setTitle("");setDescription("");setCategory("");setImagesText("");setEditing(null);setError("");setSuccess("");};

  const submit=async e=>{
    e.preventDefault(); setError(""); setSuccess("");
    const images=imagesText.split("\n").map(x=>x.trim()).filter(Boolean);
    if(!title.trim()||!description.trim()||!category||!images.length){setError("Title, description, category and at least one image are required.");return;}
    try{
      const payload={title:title.trim(),description:description.trim(),category,images};
      editing?await API.put(`/projects/${editing._id}`,payload):await API.post("/projects",payload);
      setSuccess(editing?"Project updated.":"Project published."); reset(); load(); setShow(false);
    }catch(err){setError(err.response?.data?.msg||"Could not save the project.");}
  };

  const upload=async e=>{
    const files=Array.from(e.target.files||[]); if(!files.length)return; setUploading(true);setError("");
    try{
      const urls=[];
      for(const file of files){
        if(!file.type.startsWith("image/"))continue;
        if(file.size>5*1024*1024)throw new Error(`${file.name} is larger than 5 MB.`);
        const dataUri=await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=reject;r.readAsDataURL(file);});
        const r=await API.post("/media/upload",{dataUri});
        if(!r.data?.url) throw new Error("Cloudinary returned no image URL.");
        urls.push(r.data.url);
      }
      setImagesText(v=>[...v.split("\n").filter(Boolean),...urls].join("\n"));
    }catch(err){setError(err.response?.data?.error||err.response?.data?.msg||err.message||"Upload failed.");}finally{setUploading(false);e.target.value="";}
  };

  const edit=p=>{setEditing(p);setTitle(p.title||"");setDescription(p.description||"");setCategory(p.category||"");setImagesText((p.images||[]).join("\n"));setError("");setShow(true);};
  const remove=async p=>{if(!window.confirm(`Delete "${p.title}"?`))return;try{await API.delete(`/projects/${p._id}`);load();}catch(e){setError("Could not delete project.");}};

  return <div className="endless-page"><Navbar/><main className="endless-shell py-14 sm:py-20">
    <div className="flex flex-col md:flex-row justify-between gap-8 items-end border-b border-[#ded8cd] pb-10">
      <div><p className="text-[10px] uppercase tracking-[.35em] text-[#9a6845] font-bold">The archive</p><h1 className="endless-serif text-5xl sm:text-7xl mt-3">Stories we've kept.</h1><p className="text-[#77766f] max-w-xl mt-5 leading-7">A collection of celebrations, portraits, films and in-between moments. Browse by the kind of story you want to tell.</p></div>
      {isAuthenticated&&<button onClick={()=>{reset();setShow(true)}} className="rounded-full bg-[#1f211e] text-white px-5 py-3 text-sm font-bold inline-flex gap-2 items-center"><Plus size={16}/> Add work</button>}
    </div>

    <div className="flex flex-wrap gap-2 py-7">
      <button onClick={()=>setParams({})} className={`rounded-full px-4 py-2 text-xs font-bold ${!selected?"bg-[#1f211e] text-white":"bg-white border border-[#ded8cd]"}`}>All</button>
      {services.map(s=><button key={s.slug} onClick={()=>setParams({category:s.slug})} className={`rounded-full px-4 py-2 text-xs font-bold ${selected===s.slug?"bg-[#d7a26d] text-[#1f211e]":"bg-white border border-[#ded8cd] text-[#6f6e68]"}`}>{s.title}</button>)}
    </div>

    {loading?<div className="py-24 text-center text-[#8c887f]">Loading the archive…</div>:
      filtered.length===0?<div className="py-24 text-center endless-card rounded-2xl"><ImageIcon className="mx-auto mb-3 text-[#9a6845]"/><p>No work in this collection yet.</p></div>:
      <div className="grid md:grid-cols-2 gap-x-7 gap-y-14">
        {filtered.map((p,i)=><motion.article key={p._id} initial={{opacity:0,y:18}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:(i%4)*.05}} className="group">
          <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-[#ddd5c9] relative">
            {p.images?.[0]&&<img src={p.images[0]} alt={p.title} className="w-full h-full object-cover group-hover:scale-[1.025] transition duration-700" referrerPolicy="no-referrer"/>}
            {isAuthenticated&&<div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition"><button onClick={()=>edit(p)} className="w-9 h-9 grid place-items-center bg-white rounded-full"><Pencil size={15}/></button><button onClick={()=>remove(p)} className="w-9 h-9 grid place-items-center bg-white rounded-full text-red-600"><Trash2 size={15}/></button></div>}
          </div>
          <div className="pt-4 flex justify-between gap-4"><div><p className="text-[10px] uppercase tracking-[.22em] text-[#9a6845] font-bold">{p.category||"Story"}</p><h2 className="endless-serif text-2xl mt-1">{p.title}</h2><p className="text-sm text-[#77766f] mt-2 max-w-lg leading-6">{p.description}</p></div><ArrowUpRight size={18} className="mt-1 shrink-0"/></div>
        </motion.article>)}
      </div>
    }
  </main>

  <AnimatePresence>{show&&<div className="fixed inset-0 z-50 bg-[#1f211e]/70 backdrop-blur-sm p-4 grid place-items-center">
    <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} exit={{opacity:0,y:20}} className="w-full max-w-xl max-h-[90vh] overflow-auto bg-[#f6f2eb] rounded-3xl p-6 sm:p-8">
      <div className="flex justify-between items-start mb-6"><div><p className="text-[10px] uppercase tracking-[.3em] text-[#9a6845] font-bold">Studio editor</p><h3 className="endless-serif text-3xl mt-1">{editing?"Edit story":"Add story"}</h3></div><button onClick={()=>setShow(false)}><X/></button></div>
      <form onSubmit={submit} className="space-y-4">
        <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Project title" className="w-full rounded-xl border border-[#d9d2c6] bg-white px-4 py-3 outline-none focus:border-[#9a6845]"/>
        <select value={category} onChange={e=>setCategory(e.target.value)} className="w-full rounded-xl border border-[#d9d2c6] bg-white px-4 py-3 outline-none"><option value="">Choose a category</option>{services.map(s=><option key={s.slug} value={s.slug}>{s.title}</option>)}</select>
        <textarea value={description} onChange={e=>setDescription(e.target.value)} rows={4} placeholder="Describe the story…" className="w-full rounded-xl border border-[#d9d2c6] bg-white px-4 py-3 outline-none resize-none"/>
        <textarea value={imagesText} onChange={e=>setImagesText(e.target.value)} rows={4} placeholder="Image URLs — one per line" className="w-full rounded-xl border border-[#d9d2c6] bg-white px-4 py-3 outline-none resize-none"/>
        <label className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-[#bdb4a5] bg-white px-4 py-4 cursor-pointer text-sm font-semibold"><Upload size={17}/>{uploading?"Uploading…":"Upload images"}<input type="file" accept="image/*" multiple className="hidden" onChange={upload}/></label>
        {error&&<p className="text-sm text-red-700 bg-red-50 rounded-xl p-3">{error}</p>}{success&&<p className="text-sm text-green-700 bg-green-50 rounded-xl p-3">{success}</p>}
        <div className="flex justify-end gap-2 pt-2"><button type="button" onClick={()=>setShow(false)} className="px-5 py-3 rounded-full border border-[#d9d2c6] font-semibold">Cancel</button><button disabled={uploading} className="px-6 py-3 rounded-full bg-[#1f211e] text-white font-bold">{editing?"Save changes":"Publish story"}</button></div>
      </form>
    </motion.div>
  </div>}</AnimatePresence>
  <Footer/></div>;
};
