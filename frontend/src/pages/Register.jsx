import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

const schema=z.object({name:z.string().min(2), email:z.string().email(), password:z.string().min(4)});

export default function Register(){
  const nav=useNavigate();
  const {register:reg}=useAuth();
  const {register,handleSubmit,formState:{errors,isSubmitting}}=useForm({resolver:zodResolver(schema)});

  const onSubmit=async(values)=>{
    const data=await reg(values.name, values.email, values.password);
    toast.success("Now login");
    nav("/login");
  };

  return (
    <div className="min-h-screen grid place-items-center bg-zinc-50 dark:bg-zinc-950 p-4">
      <motion.form initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-md rounded-3xl border border-black/10 dark:border-white/10 bg-white dark:bg-black/40 shadow p-6">
        <h1 className="text-2xl font-bold">Create account</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Start tracking your money</p>

        <div className="mt-5">
          <label className="text-sm font-medium">Name</label>
          <input className="mt-2 w-full rounded-xl border p-3 bg-transparent" {...register("name")} placeholder="Nitin"/>
          {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
        </div>

        <div className="mt-4">
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
          {isSubmitting?"Creating...":"Create account"}
        </button>
        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">Already? <Link className="underline" to="/login">Login</Link></p>
      </motion.form>
    </div>
  );
}
