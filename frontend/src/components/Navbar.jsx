import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowUpRight, Menu, X, LogOut, LayoutDashboard } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export const Navbar = () => {
  const { isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const links = [
    { name: "Home", path: "/" },
    { name: "Work", path: "/projects" },
    // { name: "Contact", path: "/contact" },
  ];

  const active = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-[#f6f2eb]/90 backdrop-blur-xl border-b border-[#ded8cd]">
      <div className="endless-shell h-[76px] flex items-center justify-between">
        <Link to="/" className="group flex items-center gap-3" onClick={() => setOpen(false)}>
          <div className="w-10 h-10 rounded-full bg-[#1f211e] text-[#f6f2eb] grid place-items-center text-xs font-bold tracking-[.16em]">
            EM
          </div>
          <div>
            <div className="endless-display font-extrabold tracking-[-.04em] text-[17px]">ENDLESS</div>
            <div className="text-[9px] uppercase tracking-[.32em] text-[#9a6845]">Moments</div>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {links.map((link) => (
            <Link key={link.path} to={link.path}
              className={`text-[13px] font-semibold transition-colors ${active(link.path) ? "text-[#9a6845]" : "text-[#62615b] hover:text-[#1f211e]"}`}>
              {link.name}
            </Link>
          ))}
          {isAuthenticated && (
            <>
              <Link to="/dashboard" className="text-[#62615b] hover:text-[#1f211e] flex items-center gap-1.5 text-[13px] font-semibold">
                <LayoutDashboard size={15} /> Studio
              </Link>
              <button onClick={logout} className="text-[#9a6845] text-[12px] font-bold">Sign out</button>
            </>
          )}
          <Link to="/contact" className="endless-button inline-flex items-center gap-2 bg-[#1f211e] text-white px-5 py-3 rounded-full text-[12px] font-bold">
            Start a story <ArrowUpRight size={15} />
          </Link>
        </nav>

        <button className="md:hidden p-2" onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-[#ded8cd] bg-[#f6f2eb] px-5 py-5 space-y-2">
          {links.map((link) => (
            <Link key={link.path} to={link.path} onClick={() => setOpen(false)}
              className={`block py-3 text-lg font-semibold ${active(link.path) ? "text-[#9a6845]" : ""}`}>
              {link.name}
            </Link>
          ))}
          {isAuthenticated && (
            <div className="border-t border-[#ded8cd] pt-3 flex gap-4">
              <Link to="/dashboard" onClick={() => setOpen(false)} className="font-semibold">Studio</Link>
              <button onClick={() => { logout(); setOpen(false); }} className="text-[#9a6845]">Sign out</button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
