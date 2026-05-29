import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authAPI } from "../utils/api";
const Ctx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]     = useState(null);
  const [loading, setLoad]  = useState(true);

  useEffect(()=>{
    const restore = async()=>{
      const tok = localStorage.getItem("rf_token");
      if(!tok){ setLoad(false); return; }
      try{ const d=await authAPI.getMe(); setUser(d.user); }
      catch{ localStorage.removeItem("rf_token"); }
      finally{ setLoad(false); }
    };
    restore();
  },[]);

  const login = useCallback(async(creds)=>{
    const d = await authAPI.login(creds);
    localStorage.setItem("rf_token", d.token);
    setUser(d.user); return d.user;
  },[]);

  const register = useCallback(async(data)=>{
    const d = await authAPI.register(data);
    localStorage.setItem("rf_token", d.token);
    setUser(d.user); return d.user;
  },[]);

  const logout = useCallback(async()=>{
    try{ await authAPI.logout(); }catch{}
    localStorage.removeItem("rf_token");
    setUser(null);
  },[]);

  const updateUser = useCallback((u)=>setUser(p=>({...p,...u})),[]);

  return (
    <Ctx.Provider value={{ user, loading, isAuth:!!user, login, register, logout, updateUser }}>
      {children}
    </Ctx.Provider>
  );
}
export const useAuth = ()=>{ const c=useContext(Ctx); if(!c) throw new Error("useAuth outside AuthProvider"); return c; };
