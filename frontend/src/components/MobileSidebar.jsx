import { NavLink } from "react-router-dom";
import { LayoutDashboard, Receipt, Tags, Target, Repeat, X } from "lucide-react";
import { cn } from "../lib/cn";

const links = [
  { to: "/app/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/app/transactions", label: "Transactions", icon: Receipt },
  { to: "/app/categories", label: "Categories", icon: Tags },
  { to: "/app/budgets", label: "Budgets", icon: Target },
  { to: "/app/recurring", label: "Recurring", icon: Repeat },
];

export default function MobileSidebar({ open, onClose }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      {/* overlay */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* drawer */}
      <div className="absolute left-0 top-0 h-full w-72 bg-white dark:bg-zinc-950 border-r border-black/10 dark:border-white/10 p-4">
        <div className="flex items-center justify-between">
          <div className="text-xl font-bold">💸 FinTrack</div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl border border-black/10 dark:border-white/10"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-6 flex flex-col gap-1">
          {links.map((l) => {
            const Icon = l.icon;
            return (
              <NavLink
                key={l.to}
                to={l.to}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium",
                    isActive
                      ? "bg-black text-white dark:bg-white dark:text-black"
                      : "hover:bg-black/5 dark:hover:bg-white/10"
                  )
                }
              >
                <Icon size={18} />
                {l.label}
              </NavLink>
            );
          })}
        </div>

        <div className="mt-auto pt-4 text-xs text-gray-500 dark:text-gray-400 absolute bottom-4 left-4">
          MERN Finance Tracker
        </div>
      </div>
    </div>
  );
}
