import { useEffect, useMemo, useState } from "react";
import { api } from "../utils/api";
import { useAuth } from "../context/AuthContext";
import Card from "../components/Card";
import toast from "react-hot-toast";
import { Plus, RefreshCw } from "lucide-react";

export default function Recurring() {
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

  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(false);

  // modal
  const [open, setOpen] = useState(false);

  // form state
  const [type, setType] = useState("expense");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [note, setNote] = useState("");
  const [frequency, setFrequency] = useState("monthly");
  const [interval, setInterval] = useState(1);
  const [startDate, setStartDate] = useState(() =>
    new Date().toISOString().slice(0, 10)
  );

  const [categories, setCategories] = useState([]);

  const load = async () => {
    try {
      setLoading(true);

      const [r1, r2] = await Promise.all([
        api.get("/api/recurring", headers),
        api.get("/api/categories", headers),
      ]);

      setRules(r1.data);
      setCategories(r2.data);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to load recurring rules");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken) load();
  }, [accessToken]);

  const createRule = async (e) => {
    e.preventDefault();

    try {
      if (!amount || Number(amount) <= 0) return toast.error("Enter valid amount");
      if (!categoryId) return toast.error("Select category");
      if (!startDate) return toast.error("Select start date");

      await api.post(
        "/api/recurring",
        {
          type,
          amount: Number(amount),
          categoryId,
          note,
          frequency,
          interval: Number(interval),
          startDate,
        },
        headers
      );

      toast.success("Recurring rule added ✅");
      setOpen(false);

      // reset
      setAmount("");
      setNote("");
      setInterval(1);

      load();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Create failed");
    }
  };

  const toggleRule = async (id) => {
    try {
      await api.patch(`/api/recurring/${id}/toggle`, {}, headers);
      toast.success("Updated ✅");
      load();
    } catch {
      toast.error("Failed to update");
    }
  };

  const filteredCategories = useMemo(() => {
    return categories.filter((c) => c.type === type);
  }, [categories, type]);

  return (
    <div>
      {/* HEADER */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold">Recurring</h1>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            Auto-generate transactions (Rent, EMI, Subscription etc.)
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={load}
            className="px-4 py-2 rounded-xl border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/10 flex items-center gap-2"
          >
            <RefreshCw size={18} /> Refresh
          </button>

          <button
            onClick={() => setOpen(true)}
            className="px-4 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black flex items-center gap-2"
          >
            <Plus size={18} /> Add Rule
          </button>
        </div>
      </div>

      {/* LIST */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <p className="text-gray-500 dark:text-gray-400">Loading...</p>
        ) : rules.length === 0 ? (
          <Card className="p-4">
            <p className="text-gray-500 dark:text-gray-400">
              No recurring rules yet. Add one.
            </p>
          </Card>
        ) : (
          rules.map((r) => (
            <Card key={r._id} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-lg">
                    {r.categoryId?.name || "Category"}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {r.type.toUpperCase()} • {r.frequency} • every {r.interval}
                  </p>
                </div>

                <div
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    r.isActive
                      ? "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300"
                      : "bg-gray-200 text-gray-700 dark:bg-white/10 dark:text-gray-300"
                  }`}
                >
                  {r.isActive ? "ACTIVE" : "PAUSED"}
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <p className="text-xl font-bold">₹ {r.amount}</p>

                <button
                  onClick={() => toggleRule(r._id)}
                  className="px-3 py-2 rounded-xl border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/10 text-sm"
                >
                  {r.isActive ? "Pause" : "Resume"}
                </button>
              </div>

              <div className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                Next Run:{" "}
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {new Date(r.nextRunAt).toLocaleString()}
                </span>
              </div>

              {r.note ? (
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                  Note: {r.note}
                </p>
              ) : null}
            </Card>
          ))
        )}
      </div>

      {/* MODAL */}
      {open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-zinc-950 border border-black/10 dark:border-white/10 shadow-lg p-6">
            <h2 className="text-xl font-bold">Add Recurring Rule</h2>

            <form onSubmit={createRule} className="mt-5 space-y-4">
              {/* Type */}
              <div>
                <label className="text-sm font-medium">Type</label>
                <select
                  value={type}
                  onChange={(e) => {
                    setType(e.target.value);
                    setCategoryId("");
                  }}
                  className={`mt-2 w-full ${selectClass}`}
                >
                  <option value="expense" className="bg-white text-black">
                    Expense
                  </option>
                  <option value="income" className="bg-white text-black">
                    Income
                  </option>
                </select>
              </div>

              {/* Amount */}
              <div>
                <label className="text-sm font-medium">Amount</label>
                <input
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  type="number"
                  className={`mt-2 w-full ${inputClass}`}
                  placeholder="5000"
                />
              </div>

              {/* Category */}
              <div>
                <label className="text-sm font-medium">Category</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className={`mt-2 w-full ${selectClass}`}
                >
                  <option value="" className="bg-white text-black">
                    Select category
                  </option>

                  {filteredCategories.map((c) => (
                    <option key={c._id} value={c._id} className="bg-white text-black">
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Frequency + interval */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">Frequency</label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                    className={`mt-2 w-full ${selectClass}`}
                  >
                    <option value="daily" className="bg-white text-black">
                      Daily
                    </option>
                    <option value="weekly" className="bg-white text-black">
                      Weekly
                    </option>
                    <option value="monthly" className="bg-white text-black">
                      Monthly
                    </option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium">Interval</label>
                  <input
                    value={interval}
                    onChange={(e) => setInterval(e.target.value)}
                    type="number"
                    min={1}
                    className={`mt-2 w-full ${inputClass}`}
                    placeholder="1"
                  />
                </div>
              </div>

              {/* startDate */}
              <div>
                <label className="text-sm font-medium">Start Date</label>
                <input
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  type="date"
                  className={`mt-2 w-full ${inputClass}`}
                />
              </div>

              {/* note */}
              <div>
                <label className="text-sm font-medium">Note (optional)</label>
                <input
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className={`mt-2 w-full ${inputClass}`}
                  placeholder="Netflix / EMI / Rent"
                />
              </div>

              {/* actions */}
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
                  Save Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
