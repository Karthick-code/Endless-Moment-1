import React from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Instagram, Mail, Phone } from "lucide-react";
import { services } from "../config/services";
import contactConfig from "../config/contact";
import { Login } from "../pages/Login";
import { useAuth } from "../context/AuthContext";


export const Footer = () => {
  const { isAuthenticated, logout } = useAuth();
  

  return(
  <footer className="bg-[#1f211e] text-[#f6f2eb] mt-24">
    <div className="endless-shell py-16">
      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr_1fr] gap-12">
        <div>
          <p className="text-[10px] uppercase tracking-[.35em] text-[#d7a26d] mb-4">ENDLESS Moments</p>
          <h2 className="endless-serif text-3xl sm:text-4xl max-w-md leading-tight">
            The little seconds you never want to forget.
          </h2>
          <Link to="/contact" className="mt-7 inline-flex items-center gap-2 border border-white/20 rounded-full px-5 py-3 text-sm hover:bg-white hover:text-[#1f211e] transition">
            Plan your session <ArrowUpRight size={15} />
          </Link>
        </div>

        <div>
          <p className="text-[10px] uppercase tracking-[.25em] text-white/40 mb-5">Explore</p>
          <div className="space-y-2">
            <Link className="block text-sm text-white/70 hover:text-white" to="/">Home</Link>
            <Link className="block text-sm text-white/70 hover:text-white" to="/projects">Work</Link>
            <Link className="block text-sm text-white/70 hover:text-white" to="/contact">Contact</Link>
          </div>
          <p className="text-[10px] uppercase tracking-[.25em] text-white/40 mt-8 mb-4">Services</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            {/* {services.slice(0, 6).map(s => <Link key={s.slug} to={`/projects?category=${s.slug}`} className="text-xs text-white/60 hover:text-white">{s.title}</Link>)} */}
            {services.map(s => <Link key={s.slug} to={`/projects?category=${s.slug}`} className="text-xs text-white/60 hover:text-white">{s.title}</Link>)}

          </div>
        </div>

        <div  className="relative">
          <p className="text-[10px] uppercase tracking-[.25em] text-white/40 mb-5">Reach us</p>
          <div className="space-y-4 text-sm text-white/70">
            {contactConfig.phones.map((p,i) => <a key={i} href={`tel:${p.replace(/\s+/g,"")}`} className="flex gap-3 hover:text-white"><Phone size={15}/>{p}</a>)}
            {contactConfig.emails.map((e,i) => <a key={i} href={`mailto:${e}`} className="flex gap-3 hover:text-white break-all"><Mail size={15}/>{e}</a>)}
            {contactConfig.instagramLinks.map((u,i) => {
              const name = u.replace(/\/+$/,"").split("/").pop();
              return <a key={i} href={u} target="_blank" rel="noreferrer" className="flex gap-3 hover:text-white"><Instagram size={15}/>@{name}</a>;
            })}
          </div>
          <div className="absolute bottom-0 right-0">
          {isAuthenticated ? 
                       <button onClick={logout} className="endless-button inline-flex items-center gap-2 rounded-full bg-[#f6f2eb] text-white px-6 py-3.5 text-sm font-bold">Log out</button>: 
                       <Link to="/login" className="endless-button inline-flex items-center gap-2 rounded-full bg-[#f6f2eb] text-white px-6 py-3.5 text-sm font-bold">Admin Login </Link> 
                       }
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 mt-14 pt-6 flex flex-col sm:flex-row justify-between gap-3 text-[11px] text-white/40">
        <span>© {new Date().getFullYear()} ENDLESS Moments</span>
        <span>Capture your moments.</span>
      </div>
    </div>
  </footer>
);}
