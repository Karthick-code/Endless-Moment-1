import React, { createContext, useState, useEffect } from "react";

export const AuthContext = createContext(undefined);

const readBoolean = (value) => value === "true";

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [email, setEmail] = useState(null);
  const [role, setRole] = useState(null);
  const [isPrimaryAdmin, setIsPrimaryAdmin] = useState(false);

  useEffect(() => {
    const savedToken = localStorage.getItem("photo_studio_token");
    const savedEmail = localStorage.getItem("photo_studio_email");
    const savedRole = localStorage.getItem("photo_studio_role");
    const savedIsPrimaryAdmin = localStorage.getItem("photo_studio_is_primary_admin");
    const loginTime = localStorage.getItem("photo_studio_login_time");

    if (savedToken && savedEmail) {
      const maxAgeMs = 3 * 60 * 60 * 1000;
      const isExpired = loginTime && Date.now() - parseInt(loginTime, 10) > maxAgeMs;

      if (isExpired) {
        localStorage.removeItem("photo_studio_token");
        localStorage.removeItem("photo_studio_email");
        localStorage.removeItem("photo_studio_role");
        localStorage.removeItem("photo_studio_is_primary_admin");
        localStorage.removeItem("photo_studio_login_time");
        setToken(null);
        setEmail(null);
        setRole(null);
        setIsPrimaryAdmin(false);
      } else {
        setToken(savedToken);
        setEmail(savedEmail);
        setRole(savedRole || "admin");
        setIsPrimaryAdmin(readBoolean(savedIsPrimaryAdmin));
      }
    }
  }, []);

  const login = (newToken, newEmail, newRole = "admin", newIsPrimaryAdmin = false) => {
    localStorage.setItem("photo_studio_token", newToken);
    localStorage.setItem("photo_studio_email", newEmail);
    localStorage.setItem("photo_studio_role", newRole);
    localStorage.setItem("photo_studio_is_primary_admin", String(newIsPrimaryAdmin));
    localStorage.setItem("photo_studio_login_time", Date.now().toString());
    setToken(newToken);
    setEmail(newEmail);
    setRole(newRole);
    setIsPrimaryAdmin(newIsPrimaryAdmin);
  };

  const logout = () => {
    localStorage.removeItem("photo_studio_token");
    localStorage.removeItem("photo_studio_email");
    localStorage.removeItem("photo_studio_role");
    localStorage.removeItem("photo_studio_is_primary_admin");
    localStorage.removeItem("photo_studio_login_time");
    setToken(null);
    setEmail(null);
    setRole(null);
    setIsPrimaryAdmin(false);
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider
      value={{
        token,
        email,
        role,
        isPrimaryAdmin,
        isAuthenticated,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
