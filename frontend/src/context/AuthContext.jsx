import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../utils/api";
import toast from "react-hot-toast";

const AuthContext=createContext(null);

export function AuthProvider({children}){
  const [user,setUser]=useState(null);
  const [accessToken,setAccessToken]=useState(null);

  const authHeaders = useMemo(()=> accessToken ? { Authorization:`Bearer ${accessToken}` } : {}, [accessToken]);

  const login=async(email,password)=>{
    const {data}=await api.post("/api/auth/login",{email,password});
    setUser(data.user); setAccessToken(data.accessToken);
    toast.success("Welcome back!");
    return data;
  };
  const register=async(name,email,password)=>{
    const {data}=await api.post("/api/auth/register",{name,email,password});
    toast.success("Registered successfully");
    return data;
  };
  const refresh=async()=>{
    const {data}=await api.get("/api/auth/refresh");
    setAccessToken(data.accessToken);
    return data.accessToken;
  };
  const logout=async()=>{
    await api.post("/api/auth/logout");
    setUser(null); setAccessToken(null);
    toast("Logged out");
  };

  useEffect(()=>{ refresh().catch(()=>{}); },[]);

  return <AuthContext.Provider value={{user,accessToken,authHeaders,login,register,refresh,logout,setUser,setAccessToken}}>{children}</AuthContext.Provider>;
}

export const useAuth=()=>useContext(AuthContext);
