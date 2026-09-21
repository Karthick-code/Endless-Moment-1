import React,{useEffect,useMemo,useState} from "react";
import {Link,useLocation,useNavigate} from "react-router-dom";
import {AnimatePresence,motion} from "motion/react";
import {Plus,RefreshCw,Search,Users,Inbox,CheckCircle2,Clock3,X,Pencil,LogOut} from "lucide-react";
import {useAuth} from "../context/AuthContext";
import API from "../services/api";
import {Navbar} from "../components/Navbar";

const initial={name:"",email:"",phone:"",message:"",status:"new",requirements:"",paymentAmount:"",advancePayment:""};

export const Dashboard=()=>{
 const {isAuthenticated,logout}=useAuth(), nav=useNavigate(), loc=useLocation();
 const [leads,setLeads]=useState([]),[loading,setLoading]=useState(true),[sync,setSync]=useState(false),[query,setQuery]=useState("");
 const [modal,setModal]=useState(null),[form,setForm]=useState(initial),[error,setError]=useState(""),[saving,setSaving]=useState(false);
 useEffect(()=>{if(!isAuthenticated)nav("/login")},[isAuthenticated,nav]);
 const load=()=>{setSync(true);API.get("/leads").then(r=>setLeads(r.data||[])).catch(()=>{}).finally(()=>{setLoading(false);setSync(false)})};
 useEffect(()=>{if(isAuthenticated)load()},[isAuthenticated]);
 const customers=leads.filter(x=>x.status==="converted"), newLeads=leads.filter(x=>x.status==="new"), contacted=leads.filter(x=>x.status==="contacted");
 const customerTab=loc.pathname.includes("customers");
 const list=(customerTab?customers:leads).filter(l=>`${l.name} ${l.email} ${l.phone}`.toLowerCase().includes(query.toLowerCase()));
 const openAdd=()=>{setForm(initial);setError("");setModal("add")};
 const openEdit=l=>{setForm({...initial,...l});setError("");setModal(l)};
 const save=async e=>{e.preventDefault();setError("");if(!form.name.trim()||!form.email.trim()||!form.phone.trim()){setError("Name, email and phone are required.");return}setSaving(true);try{
   const payload={name:form.name.trim(),email:form.email.trim(),phone:form.phone.trim(),message:form.message.trim(),status:form.status,requirements:form.requirements.trim(),paymentAmount:form.paymentAmount.trim(),advancePayment:form.advancePayment.trim()};
   if(modal==="add"){const r=await API.post("/leads",payload);setLeads(v=>[r.data,...v])}else{const r=await API.put(`/leads/${modal._id}`,payload);setLeads(v=>v.map(x=>x._id===modal._id?{...x,...r.data}:x))}
   setModal(null);
 }catch(err){setError(err.response?.data?.msg||"Could not save this client.")}finally{setSaving(false)}};
 const stats=[["All enquiries",leads.length,Inbox],["New",newLeads.length,Clock3],["Contacted",contacted.length,Users],["Clients",customers.length,CheckCircle2]];
 if(!isAuthenticated)return null;
 return <div className="min-h-screen bg-[#f6f2eb] text-[#1f211e]">
   <Navbar/>
   <main className="endless-shell py-10 sm:py-14">
    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-[#ded8cd] pb-8">
      <div><p className="text-[10px] uppercase tracking-[.35em] text-[#9a6845] font-bold">Studio desk</p><h1 className="endless-serif text-5xl mt-2">People behind the stories.</h1><p className="text-sm text-[#77766f] mt-3">Manage enquiries, follow-ups and confirmed clients in one place.</p></div>
      <div className="flex gap-2"><button onClick={load} className="rounded-full border border-[#d5cec2] bg-white px-4 py-3 text-sm font-bold flex gap-2 items-center"><RefreshCw size={15} className={sync?"animate-spin":""}/> Refresh</button><button onClick={openAdd} className="rounded-full bg-[#1f211e] text-white px-5 py-3 text-sm font-bold flex gap-2 items-center"><Plus size={16}/> Add client</button></div>
    </div>
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 my-8">{stats.map(([label,n,Icon])=><div key={label} className="bg-white border border-[#ded8cd] rounded-2xl p-5"><Icon size={19} className="text-[#9a6845]"/><p className="text-xs text-[#77766f] mt-6">{label}</p><p className="text-3xl font-extrabold mt-1">{n}</p></div>)}</div>
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
      <div className="flex rounded-full bg-[#ebe5db] p-1 w-fit"><Link to="/dashboard" className={`px-5 py-2 rounded-full text-xs font-bold ${!customerTab?"bg-white shadow-sm":""}`}>Enquiries</Link><Link to="/dashboard/customers" className={`px-5 py-2 rounded-full text-xs font-bold ${customerTab?"bg-white shadow-sm":""}`}>Clients</Link></div>
      <div className="relative w-full sm:w-72"><Search className="absolute left-3 top-3 size-4 text-[#999]"/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search people…" className="w-full rounded-full border border-[#d9d2c6] bg-white pl-10 pr-4 py-2.5 text-sm outline-none"/></div>
    </div>
    <div className="bg-white border border-[#ded8cd] rounded-2xl overflow-hidden">
      {loading?<div className="p-16 text-center text-[#77766f]">Loading client records…</div>:list.length===0?<div className="p-16 text-center text-[#77766f]">No matching records.</div>:
      <div className="divide-y divide-[#eee9e1]">{list.map(l=><div key={l._id} className="p-5 hover:bg-[#fcfaf6] flex flex-col lg:flex-row lg:items-center gap-4 justify-between">
        <div className="min-w-0"><div className="flex items-center gap-2"><h3 className="font-bold truncate">{l.name}</h3><Status value={l.status}/></div><p className="text-xs text-[#77766f] mt-1">{l.email} · {l.phone}</p><p className="text-sm text-[#5e5d58] mt-3 max-w-2xl line-clamp-2">{l.message||l.requirements||"No message provided."}</p></div>
        <button onClick={()=>openEdit(l)} className="shrink-0 rounded-full border border-[#d9d2c6] px-4 py-2 text-xs font-bold flex items-center gap-2"><Pencil size={14}/> Edit</button>
      </div>)}</div>}
    </div>
   </main>
   <AnimatePresence>{modal&&<div className="fixed inset-0 z-50 bg-[#1f211e]/65 backdrop-blur-sm p-4 grid place-items-center"><motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} exit={{opacity:0,y:20}} className="w-full max-w-2xl max-h-[90vh] overflow-auto bg-[#f6f2eb] rounded-3xl p-6 sm:p-8">
     <div className="flex justify-between mb-7"><div><p className="text-[10px] uppercase tracking-[.3em] text-[#9a6845] font-bold">Client record</p><h2 className="endless-serif text-3xl mt-1">{modal==="add"?"Add client":"Edit client"}</h2></div><button onClick={()=>setModal(null)}><X/></button></div>
     <form onSubmit={save} className="space-y-4"><div className="grid sm:grid-cols-2 gap-4"><Input label="Name" value={form.name} set={v=>setForm({...form,name:v})}/><Input label="Email" value={form.email} set={v=>setForm({...form,email:v})}/><Input label="Phone" value={form.phone} set={v=>setForm({...form,phone:v})}/><label className="block"><span className="field-label">Status</span><select value={form.status} onChange={e=>setForm({...form,status:e.target.value})} className="field"><option value="new">New</option><option value="contacted">Contacted</option><option value="converted">Client</option></select></label></div><Input label="Requirements" value={form.requirements} set={v=>setForm({...form,requirements:v})}/><Input label="Payment amount" value={form.paymentAmount} set={v=>setForm({...form,paymentAmount:v})}/><Input label="Advance payment" value={form.advancePayment} set={v=>setForm({...form,advancePayment:v})}/><label className="block"><span className="field-label">Notes</span><textarea rows="4" value={form.message} onChange={e=>setForm({...form,message:e.target.value})} className="field resize-none"/></label>{error&&<p className="text-sm text-red-700 bg-red-50 rounded-xl p-3">{error}</p>}<div className="flex justify-end gap-2 pt-2"><button type="button" onClick={()=>setModal(null)} className="rounded-full border border-[#d9d2c6] px-5 py-3 font-bold text-sm">Cancel</button><button disabled={saving} className="rounded-full bg-[#1f211e] text-white px-6 py-3 font-bold text-sm">{saving?"Saving…":"Save record"}</button></div></form>
   </motion.div></div>}</AnimatePresence>
 </div>
};
const Input=({label,value,set})=><label className="block"><span className="field-label">{label}</span><input value={value||""} onChange={e=>set(e.target.value)} className="field"/></label>;
const Status=({value})=><span className={`text-[10px] font-bold uppercase tracking-wider rounded-full px-2.5 py-1 ${value==="converted"?"bg-green-100 text-green-700":value==="contacted"?"bg-amber-100 text-amber-700":"bg-[#eee8de] text-[#77766f]"}`}>{value==="converted"?"client":value}</span>;
