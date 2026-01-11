import { useEffect, useMemo, useState } from "react";
import { api } from "../utils/api";
import { useAuth } from "../context/AuthContext";
import Card from "../components/Card";
import toast from "react-hot-toast";
import { Plus, RefreshCw, Target } from "lucide-react";

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

export default function Budgets() {
  const { accessToken } = useAuth();

  const headers = useMemo(
    () => ({ headers: { Authorization: `Bearer ${accessToken}` } }),
    [accessToken]
  );

  // ✅ common input/select style (fix theme + dropdown)
  const inputClass =
    "rounded-xl border border-black/10 dark:border-white/10 p-3 " +
    "bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 " +
    "outline-none focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20";

  const selectClass =
    "rounded-xl border border-black/10 dark:border-white/10 p-3 " +
    "bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 " +
    "outline-none focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20";

  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const [categories, setCategories] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [summary, setSummary] = useState(null);

  const [loading, setLoading] = useState(false);

  // modal state
  const [open, setOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [limit, setLimit] = useState("");

  const load = async () => {
    if (!accessToken) return;

    try {
      setLoading(true);

      const [cRes, bRes, sRes] = await Promise.all([
        api.get("/api/categories", headers),
        api.get(`/api/budgets?month=${month}&year=${year}`, headers),
        api.get(`/api/dashboard/month-summary?month=${month}&year=${year}`, headers),
      ]);

      setCategories(cRes.data);
      setBudgets(bRes.data);
      setSummary(sRes.data);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to load budgets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [accessToken, month, year]);

  const expenseCategories = useMemo(
    () => categories.filter((c) => c.type === "expense"),
    [categories]
  );

  const budgetMap = useMemo(() => {
    const mp = new Map();
    budgets.forEach((b) => mp.set(b.categoryId?._id || b.categoryId, b));
    return mp;
  }, [budgets]);

  const spentMap = useMemo(() => {
    // from summary.categoryExpense = [{_id: "Food", total: 2000}, ...]
    const mp = new Map();
    if (!summary?.categoryExpense) return mp;
    summary.categoryExpense.forEach((x) => mp.set(x._id, x.total));
    return mp;
  }, [summary]);

  const openBudgetModal = (categoryId) => {
    setSelectedCategoryId(categoryId);

    const existing = budgets.find(
      (b) => (b.categoryId?._id || b.categoryId) === categoryId
    );

    setLimit(existing?.limit ? String(existing.limit) : "");
    setOpen(true);
  };

  const saveBudget = async (e) => {
    e.preventDefault();

    try {
      if (!selectedCategoryId) return toast.error("Select category");
      if (!limit || Number(limit) <= 0) return toast.error("Enter valid budget limit");

      await api.post(
        "/api/budgets",
        {
          categoryId: selectedCategoryId,
          month,
          year,
          limit: Number(limit),
        },
        headers
      );

      toast.success("Budget saved ✅");
      setOpen(false);
      load();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to save budget");
    }
  };

  return (
    <div>
      {/* header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold">Budgets</h1>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            Set monthly category budgets and track spending.
          </p>
        </div>

        <div className="flex gap-2 flex-wrap">
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className={selectClass}
          >
            {Array.from({ length: 12 }).map((_, i) => (
              <option
                key={i + 1}
                value={i + 1}
                className="bg-white text-black"
              >
                Month {i + 1}
              </option>
            ))}
          </select>

          <input
            className={`w-28 ${inputClass}`}
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
          />

          <button
            onClick={load}
            className="px-4 py-2 rounded-xl border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/10 flex items-center gap-2"
          >
            <RefreshCw size={18} /> Refresh
          </button>

          <button
            onClick={() => {
              setSelectedCategoryId("");
              setLimit("");
              setOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black flex items-center gap-2"
          >
            <Plus size={18} /> Set Budget
          </button>
        </div>
      </div>

      {/* list */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <p className="text-gray-500 dark:text-gray-400">Loading...</p>
        ) : expenseCategories.length === 0 ? (
          <Card className="p-4">
            <p className="text-gray-500 dark:text-gray-400">
              No expense categories found.
            </p>
          </Card>
        ) : (
          expenseCategories.map((cat) => {
            const b = budgetMap.get(cat._id);
            const budgetLimit = b?.limit || 0;
            const spent = spentMap.get(cat.name) || 0;

            const percent =
              budgetLimit > 0 ? clamp((spent / budgetLimit) * 100, 0, 999) : 0;

            const status =
              budgetLimit === 0
                ? "no_budget"
                : percent < 80
                ? "good"
                : percent < 100
                ? "warn"
                : "danger";

            return (
              <Card key={cat._id} className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-black/5 dark:bg-white/10">
                        <Target size={18} />
                      </div>
                      <div>
                        <p className="text-lg font-bold">{cat.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {status === "no_budget"
                            ? "No budget set"
                            : `${percent.toFixed(0)}% used`}
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => openBudgetModal(cat._id)}
                    className="px-3 py-2 rounded-xl border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/10 text-sm"
                  >
                    {budgetLimit ? "Edit" : "Set"}
                  </button>
                </div>

                <div className="mt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Spent</span>
                    <span className="font-semibold">₹ {spent}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-gray-500 dark:text-gray-400">Budget</span>
                    <span className="font-semibold">
                      {budgetLimit ? `₹ ${budgetLimit}` : "—"}
                    </span>
                  </div>
                </div>

                {/* progress */}
                <div className="mt-4">
                  <div className="h-3 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                    <div
                      className={`h-3 rounded-full ${
                        status === "good"
                          ? "bg-green-500"
                          : status === "warn"
                          ? "bg-yellow-500"
                          : status === "danger"
                          ? "bg-red-500"
                          : "bg-gray-400"
                      }`}
                      style={{
                        width: `${budgetLimit ? clamp(percent, 0, 100) : 0}%`,
                      }}
                    />
                  </div>

                  {status === "warn" && (
                    <p className="mt-2 text-sm text-yellow-600">
                      ⚠️ You crossed 80% of budget
                    </p>
                  )}
                  {status === "danger" && (
                    <p className="mt-2 text-sm text-red-600">
                      ❌ Budget exceeded
                    </p>
                  )}
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* modal */}
      {open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-zinc-950 border border-black/10 dark:border-white/10 shadow-lg p-6">
            <h2 className="text-xl font-bold">Set Budget</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Budget for {month}/{year}
            </p>

            <form onSubmit={saveBudget} className="mt-5 space-y-4">
              <div>
                <label className="text-sm font-medium">Category</label>
                <select
                  className={`mt-2 w-full ${selectClass}`}
                  value={selectedCategoryId}
                  onChange={(e) => setSelectedCategoryId(e.target.value)}
                >
                  <option value="" className="bg-white text-black">
                    Select category
                  </option>

                  {expenseCategories.map((c) => (
                    <option
                      key={c._id}
                      value={c._id}
                      className="bg-white text-black"
                    >
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">Monthly Limit</label>
                <input
                  className={`mt-2 w-full ${inputClass}`}
                  value={limit}
                  onChange={(e) => setLimit(e.target.value)}
                  type="number"
                  placeholder="4000"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="px-4 py-2 rounded-xl border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/10"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black"
                >
                  Save Budget
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
