import { useEffect, useMemo, useState } from "react";
import { api } from "../utils/api";
import { useAuth } from "../context/AuthContext";
import Card from "../components/Card";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2, RefreshCw } from "lucide-react";

export default function Transactions() {
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

  // data
  const [transactions, setTransactions] = useState([]);
  const [total, setTotal] = useState(0);

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  // filters
  const [type, setType] = useState(""); // income | expense | ""
  const [categoryId, setCategoryId] = useState("");
  const [search, setSearch] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  // pagination
  const [page, setPage] = useState(1);
  const limit = 10;

  // modal
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("create"); // create | edit
  const [editId, setEditId] = useState(null);

  // form
  const [fType, setFType] = useState("expense");
  const [fAmount, setFAmount] = useState("");
  const [fCategoryId, setFCategoryId] = useState("");
  const [fDate, setFDate] = useState(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [fNote, setFNote] = useState("");

  const load = async () => {
    try {
      setLoading(true);

      const query = new URLSearchParams();
      query.set("page", page);
      query.set("limit", limit);

      if (type) query.set("type", type);
      if (categoryId) query.set("categoryId", categoryId);
      if (search) query.set("search", search);
      if (from) query.set("from", from);
      if (to) query.set("to", to);

      const [txRes, catRes] = await Promise.all([
        api.get(`/api/transactions?${query.toString()}`, headers),
        api.get("/api/categories", headers),
      ]);

      setTransactions(txRes.data.items);
      setTotal(txRes.data.total);
      setCategories(catRes.data);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to load transactions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken) load();
  }, [accessToken, page]);

  const openCreateModal = () => {
    setMode("create");
    setEditId(null);
    setFType("expense");
    setFAmount("");
    setFCategoryId("");
    setFDate(new Date().toISOString().slice(0, 10));
    setFNote("");
    setOpen(true);
  };

  const openEditModal = (tx) => {
    setMode("edit");
    setEditId(tx._id);
    setFType(tx.type);
    setFAmount(String(tx.amount));
    setFCategoryId(tx.categoryId?._id || "");
    setFDate(new Date(tx.date).toISOString().slice(0, 10));
    setFNote(tx.note || "");
    setOpen(true);
  };

  const submit = async (e) => {
    e.preventDefault();

    try {
      if (!fAmount || Number(fAmount) <= 0) return toast.error("Enter valid amount");
      if (!fCategoryId) return toast.error("Select category");
      if (!fDate) return toast.error("Select date");

      const payload = {
        type: fType,
        amount: Number(fAmount),
        categoryId: fCategoryId,
        date: fDate,
        note: fNote,
      };

      if (mode === "create") {
        await api.post("/api/transactions", payload, headers);
        toast.success("Transaction added ✅");
      } else {
        await api.put(`/api/transactions/${editId}`, payload, headers);
        toast.success("Transaction updated ✅");
      }

      setOpen(false);
      load();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to save");
    }
  };

  const remove = async (id) => {
    if (!confirm("Delete this transaction?")) return;

    try {
      await api.delete(`/api/transactions/${id}`, headers);
      toast.success("Deleted ✅");
      load();
    } catch {
      toast.error("Delete failed");
    }
  };

  const totalPages = Math.ceil(total / limit);

  // modal categories according to type
  const modalCategories = useMemo(
    () => categories.filter((c) => c.type === fType),
    [categories, fType]
  );

  return (
    <div>
      {/* header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold">Transactions</h1>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            Add, manage and filter your income & expenses.
          </p>
        </div>

        <div className="flex gap-2 flex-wrap">
          <button
            onClick={load}
            className="px-4 py-2 rounded-xl border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/10 flex items-center gap-2"
          >
            <RefreshCw size={18} /> Refresh
          </button>

          <button
            onClick={openCreateModal}
            className="px-4 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black flex items-center gap-2"
          >
            <Plus size={18} /> Add Transaction
          </button>
        </div>
      </div>

      {/* filters */}
      <Card className="p-4 mt-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className={selectClass}
          >
            <option value="" className="bg-white text-black">
              All Types
            </option>
            <option value="income" className="bg-white text-black">
              Income
            </option>
            <option value="expense" className="bg-white text-black">
              Expense
            </option>
          </select>

          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className={selectClass}
          >
            <option value="" className="bg-white text-black">
              All Categories
            </option>
            {categories
              .filter((c) => (type ? c.type === type : true))
              .map((c) => (
                <option key={c._id} value={c._id} className="bg-white text-black">
                  {c.name}
                </option>
              ))}
          </select>

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search note..."
            className={inputClass}
          />

          <input
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            type="date"
            className={inputClass}
          />

          <input value={to} onChange={(e) => setTo(e.target.value)} type="date" className={inputClass} />
        </div>

        <div className="flex gap-2 justify-end mt-3">
          <button
            onClick={() => {
              setPage(1);
              load();
            }}
            className="px-4 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black"
          >
            Apply Filters
          </button>

          <button
            onClick={() => {
              setType("");
              setCategoryId("");
              setSearch("");
              setFrom("");
              setTo("");
              setPage(1);
              setTimeout(load, 0);
            }}
            className="px-4 py-2 rounded-xl border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/10"
          >
            Reset
          </button>
        </div>
      </Card>

      {/* table */}
      <Card className="p-4 mt-4">
        {loading ? (
          <p className="text-gray-500 dark:text-gray-400">Loading...</p>
        ) : transactions.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">No transactions found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-gray-500 dark:text-gray-400">
                <tr>
                  <th className="py-2">Date</th>
                  <th>Type</th>
                  <th>Category</th>
                  <th>Amount</th>
                  <th>Note</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>

              <tbody>
                {transactions.map((tx) => (
                  <tr
                    key={tx._id}
                    className="border-t border-black/5 dark:border-white/10"
                  >
                    <td className="py-2">
                      {new Date(tx.date).toLocaleDateString()}
                    </td>

                    <td>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          tx.type === "income"
                            ? "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300"
                            : "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300"
                        }`}
                      >
                        {tx.type}
                      </span>
                    </td>

                    <td>{tx.categoryId?.name}</td>

                    <td className="font-semibold">₹ {tx.amount}</td>

                    <td className="text-gray-500 dark:text-gray-400">
                      {tx.note || "-"}
                    </td>

                    <td className="text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEditModal(tx)}
                          className="p-2 rounded-xl border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/10"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => remove(tx._id)}
                          className="p-2 rounded-xl border border-black/10 dark:border-white/10 hover:bg-red-500 hover:text-white transition"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* pagination */}
        <div className="flex items-center justify-between mt-4 text-sm">
          <p className="text-gray-500 dark:text-gray-400">
            Page {page} of {totalPages || 1} • Total {total}
          </p>

          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-4 py-2 rounded-xl border border-black/10 dark:border-white/10 disabled:opacity-40"
            >
              Prev
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-4 py-2 rounded-xl border border-black/10 dark:border-white/10 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </Card>

      {/* modal */}
      {open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-zinc-950 border border-black/10 dark:border-white/10 shadow-lg p-6">
            <h2 className="text-xl font-bold">
              {mode === "create" ? "Add Transaction" : "Edit Transaction"}
            </h2>

            <form onSubmit={submit} className="mt-5 space-y-4">
              <div>
                <label className="text-sm font-medium">Type</label>
                <select
                  value={fType}
                  onChange={(e) => {
                    setFType(e.target.value);
                    setFCategoryId("");
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

              <div>
                <label className="text-sm font-medium">Amount</label>
                <input
                  value={fAmount}
                  onChange={(e) => setFAmount(e.target.value)}
                  type="number"
                  className={`mt-2 w-full ${inputClass}`}
                  placeholder="500"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Category</label>
                <select
                  value={fCategoryId}
                  onChange={(e) => setFCategoryId(e.target.value)}
                  className={`mt-2 w-full ${selectClass}`}
                >
                  <option value="" className="bg-white text-black">
                    Select category
                  </option>
                  {modalCategories.map((c) => (
                    <option key={c._id} value={c._id} className="bg-white text-black">
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">Date</label>
                <input
                  value={fDate}
                  onChange={(e) => setFDate(e.target.value)}
                  type="date"
                  className={`mt-2 w-full ${inputClass}`}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Note</label>
                <input
                  value={fNote}
                  onChange={(e) => setFNote(e.target.value)}
                  className={`mt-2 w-full ${inputClass}`}
                  placeholder="Optional note..."
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
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
