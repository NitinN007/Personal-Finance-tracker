import { cn } from "../lib/cn";
export default function Card({className, children}){
  return <div className={cn("rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-black/40 shadow-sm", className)}>{children}</div>;
}
