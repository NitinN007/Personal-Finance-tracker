import { useEffect, useMemo, useState } from "react";
import { api } from "../utils/api";
import { useAuth } from "../context/AuthContext";
import Card from "../components/Card";
import toast from "react-hot-toast";
import { Plus, Trash2, Tags, RefreshCw } from "lucide-react";

export default function Categories() {
  const { accessToken } = useAuth();

  const headers = useMemo(
    () => ({ headers: { Authorization: `Bearer ${accessToken}` } }),
    [accessToken]
  );

  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);

  // UI state
  const [tab, setTab] = useState("expense"); // expense | income
  const [open, setOpen] = useState(false);

  // modal form
  const [name, setName] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/api/categories", headers);
      setCategories(data);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken) load();
  }, [accessToken]);

  const filtered = useMemo(
    () => categories.filter((c) => c.type === tab),
    [categories, tab]
  );

  const createCategory = async (e) => {
    e.preventDefault();
    try {
      if (!name.trim()) return toast.error("Category name required");

      await api.post(
        "/api/categories",
        { name: name.trim(), type: tab },
        headers
      );

      toast.success("Category added ✅");
      setName("");
      setOpen(false);
      load();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to create");
    }
  };

  const deleteCategory = async (catId) => {
    try {
      await api.delete(`/api/categories/${catId}`, headers);
      toast.success("Category deleted ✅");
      load();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div>
      {/* header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold">Categories</h1>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            Manage income & expense categories.
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
            <Plus size={18} /> Add Category
          </button>
        </div>
      </div>

      {/* tabs */}
      <div className="mt-6 flex gap-2">
        <button
          onClick={() => setTab("expense")}
          className={`px-4 py-2 rounded-xl text-sm font-semibold border ${
            tab === "expense"
              ? "bg-black text-white dark:bg-white dark:text-black"
              : "border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/10"
          }`}
        >
          Expense
        </button>

        <button
          onClick={() => setTab("income")}
          className={`px-4 py-2 rounded-xl text-sm font-semibold border ${
            tab === "income"
              ? "bg-black text-white dark:bg-white dark:text-black"
              : "border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/10"
          }`}
        >
          Income
        </button>
      </div>

      {/* categories list */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <p className="text-gray-500 dark:text-gray-400">Loading...</p>
        ) : filtered.length === 0 ? (
          <Card className="p-4">
            <p className="text-gray-500 dark:text-gray-400">
              No categories found.
            </p>
          </Card>
        ) : (
          filtered.map((cat) => (
            <Card key={cat._id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-black/5 dark:bg-white/10">
                    <Tags size={18} />
                  </div>

                  <div>
                    <p className="font-semibold text-lg">{cat.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {cat.isDefault ? "Default category" : "Custom category"}
                    </p>
                  </div>
                </div>

                {!cat.isDefault ? (
                  <button
                    onClick={() => deleteCategory(cat._id)}
                    className="p-2 rounded-xl border border-black/10 dark:border-white/10 hover:bg-red-500 hover:text-white transition"
                    title="Delete category"
                  >
                    <Trash2 size={18} />
                  </button>
                ) : (
                  <span className="text-xs px-3 py-1 rounded-full bg-black/5 dark:bg-white/10 text-gray-600 dark:text-gray-300">
                    Locked
                  </span>
                )}
              </div>
            </Card>
          ))
        )}
      </div>

      {/* modal */}
      {open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-zinc-950 border border-black/10 dark:border-white/10 shadow-lg p-6">
            <h2 className="text-xl font-bold">Add Category</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Create a new {tab} category
            </p>

            <form onSubmit={createCategory} className="mt-5 space-y-4">
              <div>
                <label className="text-sm font-medium">Category Name</label>
                <input
                  className="mt-2 w-full rounded-xl border p-3 bg-transparent"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Groceries"
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
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
