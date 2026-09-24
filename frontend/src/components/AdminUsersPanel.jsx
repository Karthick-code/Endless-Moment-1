import React, { useEffect, useState } from "react";
import { KeyRound, Plus, RefreshCw, ShieldCheck, Trash2, UserRound, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import API from "../services/api";
import { Footer } from "./Footer";

export const AdminUsersPanel = ({ currentEmail }) => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sync, setSync] = useState(false);
  const [modal, setModal] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setError("");
    setSuccess("");
  };

  const load = async () => {
    setSync(true);
    try {
      const response = await API.get("/admin/users");
      setAdmins(response.data || []);
      setError("");
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to load admin accounts.");
    } finally {
      setLoading(false);
      setSync(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const submitCreate = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      await API.post("/admin/users", { email: email.trim(), password });
      setSuccess("Admin account created successfully.");
      await load();
      setTimeout(() => setModal(null), 450);
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to create admin account.");
    }
  };

  const submitChangePassword = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      await API.put(`/admin/users/${modal.user._id}/password`, { password });
      setSuccess("Admin password changed successfully.");
      await load();
      setTimeout(() => setModal(null), 450);
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to change admin password.");
    }
  };

  const remove = async (user) => {
    if (user.isPrimaryAdmin || user.email === currentEmail) return;
    if (!window.confirm(`Delete the admin account for ${user.email}?`)) return;

    try {
      await API.delete(`/admin/users/${user._id}`);
      await load();
    } catch (err) {
      setError(err.response?.data?.msg || "Unable to delete admin account.");
    }
  };

  const openCreate = () => {
    resetForm();
    setModal({ type: "create" });
  };

  const openPassword = (user) => {
    resetForm();
    setModal({ type: "password", user });
  };

  return (
    <section className="mt-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-5">
        <div>
          <p className="text-[10px] uppercase tracking-[.3em] text-[#9a6845] font-bold">Access</p>
          <h2 className="endless-serif text-4xl mt-2">Admin users.</h2>
          <p className="text-sm text-[#77766f] mt-2 max-w-2xl">
            The primary administrator controls who can access the private studio dashboard.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={load}
            className="rounded-full border border-[#d5cec2] bg-white px-4 py-3 text-sm font-bold flex items-center gap-2"
            disabled={sync}
          >
            <RefreshCw size={15} className={sync ? "animate-spin" : ""} /> Refresh
          </button>
          <button
            onClick={openCreate}
            className="rounded-full bg-[#1f211e] text-white px-5 py-3 text-sm font-bold flex items-center gap-2"
          >
            <Plus size={16} /> Add admin
          </button>
        </div>
      </div>

      {error && !modal && <p className="mb-4 rounded-xl bg-red-50 text-red-700 p-3 text-sm">{error}</p>}

      <div className="bg-white border border-[#ded8cd] rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-[#77766f]">Loading admin accounts…</div>
        ) : admins.length === 0 ? (
          <div className="p-16 text-center text-[#77766f]">No admin accounts found.</div>
        ) : (
          <div className="divide-y divide-[#eee9e1]">
            {admins.map((user) => (
              <div key={user._id} className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0">
                  <span className="w-10 h-10 rounded-full bg-[#eee8de] grid place-items-center shrink-0">
                    {user.isPrimaryAdmin ? <ShieldCheck size={18} className="text-[#9a6845]" /> : <UserRound size={18} />}
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-bold break-all">{user.email}</p>
                      {user.isPrimaryAdmin && (
                        <span className="text-[10px] uppercase tracking-wider font-bold rounded-full bg-[#d7a26d]/25 text-[#855a37] px-2.5 py-1">
                          Primary admin
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#77766f] mt-1">
                      {user.createdAt ? `Created ${new Date(user.createdAt).toLocaleDateString()}` : "Admin access"}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {!user.isPrimaryAdmin && (
                    <>
                      <button
                        onClick={() => openPassword(user)}
                        className="rounded-full border border-[#d9d2c6] px-4 py-2.5 text-xs font-bold flex items-center gap-2"
                      >
                        <KeyRound size={14} /> Change password
                      </button>
                      <button
                        onClick={() => remove(user)}
                        className="rounded-full border border-red-200 text-red-700 px-4 py-2.5 text-xs font-bold flex items-center gap-2"
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />

      <AnimatePresence>
        {modal && (
          <div className="fixed inset-0 z-50 bg-[#1f211e]/65 backdrop-blur-sm p-4 grid place-items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="w-full max-w-lg bg-[#f6f2eb] rounded-3xl p-6 sm:p-8"
            >
              <div className="flex items-start justify-between gap-4 mb-7">
                <div>
                  <p className="text-[10px] uppercase tracking-[.3em] text-[#9a6845] font-bold">Studio access</p>
                  <h3 className="endless-serif text-3xl mt-1">
                    {modal.type === "create" ? "Add admin" : "Change password"}
                  </h3>
                  {modal.user && <p className="text-sm text-[#77766f] mt-2 break-all">{modal.user.email}</p>}
                </div>
                <button onClick={() => setModal(null)} aria-label="Close">
                  <X />
                </button>
              </div>

              <form onSubmit={modal.type === "create" ? submitCreate : submitChangePassword} className="space-y-4">
                {modal.type === "create" && (
                  <label className="block">
                    <span className="field-label">Email</span>
                    <input value={email} onChange={(e) => setEmail(e.target.value)} className="field" type="email" autoComplete="off" />
                  </label>
                )}
                <label className="block">
                  <span className="field-label">Password</span>
                  <input value={password} onChange={(e) => setPassword(e.target.value)} className="field" type="password" autoComplete="new-password" />
                </label>
                <label className="block">
                  <span className="field-label">Confirm password</span>
                  <input value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="field" type="password" autoComplete="new-password" />
                </label>

                {error && <p className="rounded-xl bg-red-50 text-red-700 p-3 text-sm">{error}</p>}
                {success && <p className="rounded-xl bg-green-50 text-green-700 p-3 text-sm">{success}</p>}

                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setModal(null)} className="rounded-full border border-[#d9d2c6] px-5 py-3 text-sm font-bold">
                    Cancel
                  </button>
                  <button className="rounded-full bg-[#1f211e] text-white px-6 py-3 text-sm font-bold">
                    {modal.type === "create" ? "Create admin" : "Save password"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};
