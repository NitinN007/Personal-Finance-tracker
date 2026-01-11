import { NavLink } from "react-router-dom";
import { LayoutDashboard, Receipt, Tags, Target, Repeat } from "lucide-react";
import { cn } from "../lib/cn";

const links=[
  {to:"/app/dashboard", label:"Dashboard", icon:LayoutDashboard},
  {to:"/app/transactions", label:"Transactions", icon:Receipt},
  {to:"/app/categories", label:"Categories", icon:Tags},
  {to:"/app/budgets", label:"Budgets", icon:Target},
  {to:"/app/recurring", label:"Recurring", icon:Repeat},
];

export default function Sidebar(){
  return (
    <aside className="hidden md:flex md:flex-col w-64 p-4 border-r border-black/10 dark:border-white/10">
      <div className="text-xl font-bold">💸 FinTrack</div>
      <div className="mt-6 flex flex-col gap-1">
        {links.map(l=>{
          const Icon=l.icon;
          return (
            <NavLink key={l.to} to={l.to} className={({isActive})=>cn(
              "flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium",
              isActive ? "bg-black text-white dark:bg-white dark:text-black" : "hover:bg-black/5 dark:hover:bg-white/10"
            )}>
              <Icon size={18} /> {l.label}
            </NavLink>
          )
        })}
      </div>
      <div className="mt-auto pt-4 text-xs text-gray-500 dark:text-gray-400">
        MERN Finance Tracker
      </div>
    </aside>
  );
}
