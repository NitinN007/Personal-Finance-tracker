import { Moon, Sun, LogOut, Menu } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { cn } from "../lib/cn";

export default function Topbar({ onMenuClick }) {
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();

  return (
    <header className="flex items-center justify-between gap-3 px-4 md:px-6 py-4 border-b border-black/10 dark:border-white/10">
      <div className="flex items-center gap-3">
        {/* ✅ Mobile menu button */}
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 rounded-xl border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/10"
        >
          <Menu size={18} />
        </button>

        <div className="text-sm text-gray-600 dark:text-gray-300">
          {user ? (
            <>
              Hi, <span className="font-semibold">{user.name}</span> 👋
            </>
          ) : (
            "Welcome"
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className={cn(
            "p-2 rounded-xl border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/10"
          )}
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {user && (
          <button
            onClick={logout}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black"
          >
            <LogOut size={18} /> Logout
          </button>
        )}
      </div>
    </header>
  );
}
