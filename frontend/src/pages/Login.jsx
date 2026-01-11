import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const schema=z.object({email:z.string().email(), password:z.string().min(4)});

export default function Login(){
  const nav=useNavigate();
  const {login}=useAuth();
  const {register,handleSubmit,formState:{errors,isSubmitting}}=useForm({resolver:zodResolver(schema)});

  const onSubmit=async(values)=>{
    await login(values.email, values.password);
    nav("/app/dashboard");
  };

  return (
    <div className="min-h-screen grid place-items-center bg-zinc-50 dark:bg-zinc-950 p-4">
      <motion.form initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-md rounded-3xl border border-black/10 dark:border-white/10 bg-white dark:bg-black/40 shadow p-6">
        <h1 className="text-2xl font-bold">Login</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Welcome back to FinTrack</p>

        <div className="mt-5">
          <label className="text-sm font-medium">Email</label>
          <input className="mt-2 w-full rounded-xl border p-3 bg-transparent" {...register("email")} placeholder="you@gmail.com"/>
          {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
        </div>

        <div className="mt-4">
          <label className="text-sm font-medium">Password</label>
          <input type="password" className="mt-2 w-full rounded-xl border p-3 bg-transparent" {...register("password")} placeholder="••••••••"/>
          {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
        </div>

        <button disabled={isSubmitting} className="mt-6 w-full rounded-xl bg-black text-white dark:bg-white dark:text-black py-3 font-semibold">
          {isSubmitting?"Logging in...":"Login"}
        </button>
        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">No account? <Link className="underline" to="/register">Create one</Link></p>
      </motion.form>
    </div>
  );
}
