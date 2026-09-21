import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowDownRight, ArrowUpRight, Camera, Play, Sparkles } from "lucide-react";
import API from "../services/api";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { services } from "../config/services";

export const Home = () => {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    API.get("/projects").then(r => setProjects(r.data || [])).catch(() => setProjects([]));
  }, []);

  const featured = projects.slice(0, 3);
  const heroImage = featured[0]?.images?.[0];

  return (
    <div className="endless-page">
      <Navbar />

      <main>
        <section className="endless-shell pt-10 sm:pt-16 pb-20">
          <div className="grid lg:grid-cols-[.8fr_1.4fr] gap-10 items-end">
            <div className="endless-rise">
              <p className="text-[10px] uppercase tracking-[.35em] font-bold text-[#9a6845] mb-5">Photography · Film · Stories</p>
              <h1 className="endless-serif text-[clamp(3.7rem,8vw,8.5rem)] leading-[.86] tracking-[-.06em]">
                Keep the<br /><i>feeling.</i>
              </h1>
              <p className="mt-8 max-w-sm text-[15px] leading-7 text-[#6f6e68]">
                ENDLESS Moments creates photographs and films that feel like you were there again — not just images that prove you were.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/projects" className="endless-button inline-flex items-center gap-2 rounded-full bg-[#1f211e] text-white px-6 py-3.5 text-sm font-bold">
                  Explore the work <ArrowUpRight size={16}/>
                </Link>
                <Link to="/contact" className="inline-flex items-center gap-2 rounded-full border border-[#cfc7ba] px-6 py-3.5 text-sm font-bold hover:bg-white transition">
                  Tell us your date <ArrowDownRight size={16}/>
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="aspect-[4/5] overflow-hidden bg-[#ddd5c9] rounded-[2rem]">
                {heroImage ? <img src={heroImage} alt={featured[0]?.title || "ENDLESS Moments"} className="w-full h-full object-cover" referrerPolicy="no-referrer"/> :
                  <div className="h-full grid place-items-center text-[#8d8579]"><Camera size={54} strokeWidth={1}/></div>}
              </div>
              <div className="absolute left-5 bottom-5 bg-[#f6f2eb]/90 backdrop-blur-md rounded-2xl px-4 py-3 max-w-[220px]">
                <p className="text-[9px] uppercase tracking-[.22em] text-[#9a6845] font-bold">Our approach</p>
                <p className="text-sm mt-1 font-semibold">Quiet direction. Honest frames. Beautiful chaos.</p>
              </div>
              <div className="absolute -right-3 top-8 hidden sm:grid w-20 h-20 rounded-full bg-[#d7a26d] place-items-center text-[#1f211e]">
                <span className="text-[10px] font-bold uppercase tracking-widest text-center">Made<br/>with<br/>feeling</span>
              </div>
            </div>
          </div>
        </section>

        <section className="overflow-hidden border-y border-[#ded8cd] py-4 bg-[#eee8de]">
          <div className="endless-marquee whitespace-nowrap flex gap-12 w-max">
            {[...Array(2)].flatMap((_, j) => ["WEDDINGS","PRE-WEDDINGS","PORTRAITS","CELEBRATIONS","CINEMATIC FILMS","ALBUMS"].map(x => <span key={`${j}-${x}`} className="text-[11px] font-bold tracking-[.25em] text-[#77736a]">{x} ·</span>))}
          </div>
        </section>

        <section className="endless-shell py-24">
          <div className="grid lg:grid-cols-[.65fr_1.35fr] gap-14">
            <div>
              <p className="text-[10px] uppercase tracking-[.3em] text-[#9a6845] font-bold">What we make</p>
              <h2 className="endless-serif text-4xl sm:text-5xl leading-tight mt-3">Every story needs its own language.</h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {services.map((service, i) => {
                const Icon = service.icon;
                return <Link key={service.slug} to={`/projects?category=${service.slug}`} className="group endless-card rounded-2xl p-6 hover:-translate-y-1 transition-transform">
                  <div className="flex justify-between"><Icon size={22} strokeWidth={1.5} className="text-[#9a6845]"/><span className="text-[10px] text-[#aaa39a]">0{i+1}</span></div>
                  <h3 className="mt-8 font-bold text-base">{service.title}</h3>
                  <p className="mt-2 text-sm text-[#77766f] leading-6">{service.description}</p>
                  <ArrowUpRight className="mt-5 opacity-0 group-hover:opacity-100 text-[#9a6845] transition" size={17}/>
                </Link>;
              })}
            </div>
          </div>
        </section>

        <section className="endless-shell pb-24">
          <div className="flex items-end justify-between mb-8">
            <div><p className="text-[10px] uppercase tracking-[.3em] text-[#9a6845] font-bold">Selected work</p><h2 className="endless-serif text-4xl mt-2">Recent stories</h2></div>
            <Link to="/projects" className="hidden sm:flex items-center gap-2 text-sm font-bold">See everything <ArrowUpRight size={15}/></Link>
          </div>
          <div className="grid md:grid-cols-12 gap-4">
            {featured.map((p,i) => <motion.article key={p._id} initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*.1}} className={`${i===0 ? "md:col-span-7 md:row-span-2" : "md:col-span-5"} group`}>
              <div className={`${i===0 ? "aspect-[4/5]" : "aspect-[16/10]"} rounded-2xl overflow-hidden bg-[#ddd5c9]`}>
                {p.images?.[0] && <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover group-hover:scale-[1.03] transition duration-700" referrerPolicy="no-referrer"/>}
              </div>
              <div className="pt-3 flex justify-between gap-4"><div><h3 className="font-bold">{p.title}</h3><p className="text-xs text-[#8a877f] mt-1">{p.category || "Story"}</p></div><ArrowUpRight size={16}/></div>
            </motion.article>)}
          </div>
        </section>

        <section className="bg-[#1f211e] text-[#f6f2eb]">
          <div className="endless-shell py-24 grid lg:grid-cols-[1fr_auto] items-end gap-10">
            <div><p className="text-[10px] uppercase tracking-[.35em] text-[#d7a26d] font-bold">Your turn</p><h2 className="endless-serif text-5xl sm:text-7xl leading-[.9] mt-4 max-w-3xl">Let's make something you'll want to replay.</h2></div>
            <Link to="/contact" className="endless-button inline-flex items-center justify-center gap-2 rounded-full bg-[#d7a26d] text-[#1f211e] px-7 py-4 font-bold">Start a conversation <ArrowUpRight size={17}/></Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};
