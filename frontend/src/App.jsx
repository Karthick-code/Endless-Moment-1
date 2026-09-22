


import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { Home } from "./pages/Home";
import { Projects } from "./pages/Projects";
import { Contact } from "./pages/Contact";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Roads */}
          <Route path="/" element={<Home />} />
          <Route path="/projects" element={<Projects />} />
          {/* <Route path="/projects/:category" element={<Projects />} /> */}
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />

          {/* Secure Admin Dashboard & CRM tabs */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/leads" element={<Dashboard />} />
          <Route path="/dashboard/customers" element={<Dashboard />} />

          {/* Direct undefined requests back to Home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}


