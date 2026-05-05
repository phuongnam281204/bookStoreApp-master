import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import axios from "axios";
import toast from "react-hot-toast";

const emptyForm = {
  name: "",
  price: "",
  category: "",
  image: "",
  images: "",
  stock: "",
  reserved: "",
  lowStockThreshold: "",
  title: "",
  supplier: "",
  author: "",
  translator: "",
  publisher: "",
  publishYear: "",
  weightGr: "",
  packageSize: "",
  pages: "",
};

function BooksAdmin() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [inventoryDrafts, setInventoryDrafts] = useState({});
  const [inventoryLogs, setInventoryLogs] = useState([]);
  const [selectedLogBookId, setSelectedLogBookId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/book");
      setBooks(res.data || []);
    } catch (err) {
      const message =
        err?.response?.data?.message || err?.message || "Failed to load";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    try {
      if (!form.image.trim()) {
        toast.error("Can nhap URL anh chinh");
        return;
      }

      const validateUrl = (value) => {
        try {
          const url = new URL(String(value));
          return url.protocol === "http:" || url.protocol === "https:";
        } catch (error) {
          return false;
        }
      };

      if (!validateUrl(form.image)) {
        toast.error("URL anh chinh khong hop le");
        return;
      }

      const galleryUrls = form.images
        .split(",")
        .map((url) => url.trim())
        .filter(Boolean);
      if (galleryUrls.some((url) => !validateUrl(url))) {
        toast.error("URL anh chi tiet khong hop le");
        return;
      }

      const payload = {
        name: form.name,
        price: form.price,
        category: form.category,
        image: form.image,
        images: form.images,
        stock: form.stock,
        reserved: form.reserved,
        lowStockThreshold: form.lowStockThreshold,
        title: form.title,
        supplier: form.supplier,
        author: form.author,
        translator: form.translator,
        publisher: form.publisher,
        publishYear: form.publishYear,
        weightGr: form.weightGr,
        packageSize: form.packageSize,
        pages: form.pages,
      };

      if (editingId) {
        await axios.put(`/book/${editingId}`, payload, {
          withCredentials: true,
        });
        toast.success("Book updated");
      } else {
        await axios.post("/book", payload, {
          withCredentials: true,
        });
        toast.success("Book created");
      }

      setForm(emptyForm);
      setEditingId(null);
      setSelectedLogBookId(null);
      await load();
    } catch (err) {
      const message =
        err?.response?.data?.message || err?.message || "Save failed";
      toast.error(message);
    }
  };

  const startEdit = (b) => {
    setEditingId(b._id);
    setForm({
      name: b.name || "",
      price: b.price ?? "",
      category: b.category || "",
      image: b.image || "",
      images: Array.isArray(b.images) ? b.images.join(", ") : "",
      stock: b.stock ?? "",
      reserved: b.reserved ?? "",
      lowStockThreshold: b.lowStockThreshold ?? "",
      title: b.title || "",
      supplier: b.supplier || "",
      author: b.author || "",
      translator: b.translator || "",
      publisher: b.publisher || "",
      publishYear: b.publishYear ?? "",
      weightGr: b.weightGr ?? "",
      packageSize: b.packageSize || "",
      pages: b.pages ?? "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const remove = async (id) => {
    if (!confirm("Delete this book?")) return;
    try {
      await axios.delete(`/book/${id}`, { withCredentials: true });
      toast.success("Book deleted");
      await load();
    } catch (err) {
      const message =
        err?.response?.data?.message || err?.message || "Delete failed";
      toast.error(message);
    }
  };

  const updateDraft = (id, patch) => {
    setInventoryDrafts((prev) => ({
      ...prev,
      [id]: { ...prev[id], ...patch },
    }));
  };

  const applyInventory = async (id, type) => {
    const draft = inventoryDrafts[id] || {};
    const qty = Number(draft.qty || 0);
    if (!Number.isFinite(qty) || qty <= 0) {
      toast.error("Nhap so luong hop le");
      return;
    }

    try {
      await axios.post(
        `/book/${id}/inventory`,
        { type, quantity: qty, note: draft.note || "" },
        { withCredentials: true },
      );
      toast.success("Da cap nhat ton kho");
      updateDraft(id, { qty: "", note: "" });
      await load();
      if (selectedLogBookId === id) {
        await loadInventoryLogs(id);
      }
    } catch (err) {
      const message =
        err?.response?.data?.message || err?.message || "Cap nhat that bai";
      toast.error(message);
    }
  };

  const loadInventoryLogs = async (id) => {
    try {
      const res = await axios.get(`/book/${id}/inventory-logs`, {
        withCredentials: true,
      });
      setInventoryLogs(res.data || []);
      setSelectedLogBookId(id);
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Khong tai duoc lich su";
      toast.error(message);
    }
  };

  return (
    <>
      <Navbar />
      <div className="max-w-screen-2xl container mx-auto md:px-20 px-4 min-h-screen pt-28">
        <h1 className="text-2xl font-bold">Admin: Books</h1>

        <form
          onSubmit={submit}
          className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <input
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Name"
            className="px-3 py-2 border rounded-md dark:bg-slate-900 dark:border-slate-700"
            required
          />
          <input
            value={form.price}
            onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
            placeholder="Price"
            type="number"
            min={0}
            className="px-3 py-2 border rounded-md dark:bg-slate-900 dark:border-slate-700"
            required
          />
          <input
            value={form.category}
            onChange={(e) =>
              setForm((f) => ({ ...f, category: e.target.value }))
            }
            placeholder="Category (Free/Paid)"
            className="px-3 py-2 border rounded-md dark:bg-slate-900 dark:border-slate-700"
          />
          <input
            value={form.image}
            onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
            placeholder="URL anh chinh"
            className="px-3 py-2 border rounded-md dark:bg-slate-900 dark:border-slate-700"
            required
          />
          <input
            value={form.stock}
            onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
            placeholder="Ton kho (stock)"
            type="number"
            min={0}
            className="px-3 py-2 border rounded-md dark:bg-slate-900 dark:border-slate-700"
          />
          <input
            value={form.reserved}
            onChange={(e) =>
              setForm((f) => ({ ...f, reserved: e.target.value }))
            }
            placeholder="Dang giu (reserved)"
            type="number"
            min={0}
            className="px-3 py-2 border rounded-md dark:bg-slate-900 dark:border-slate-700"
          />
          <input
            value={form.lowStockThreshold}
            onChange={(e) =>
              setForm((f) => ({ ...f, lowStockThreshold: e.target.value }))
            }
            placeholder="Canh bao sap het"
            type="number"
            min={0}
            className="px-3 py-2 border rounded-md dark:bg-slate-900 dark:border-slate-700"
          />
          <textarea
            value={form.images}
            onChange={(e) => setForm((f) => ({ ...f, images: e.target.value }))}
            placeholder="Danh sach URL anh (phan cach boi dau phay)"
            rows={2}
            className="px-3 py-2 border rounded-md dark:bg-slate-900 dark:border-slate-700 md:col-span-2"
          />
          <input
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="Title"
            className="px-3 py-2 border rounded-md dark:bg-slate-900 dark:border-slate-700 md:col-span-2"
          />
          <input
            value={form.supplier}
            onChange={(e) =>
              setForm((f) => ({ ...f, supplier: e.target.value }))
            }
            placeholder="Tên Nhà Cung Cấp"
            className="px-3 py-2 border rounded-md dark:bg-slate-900 dark:border-slate-700"
          />
          <input
            value={form.author}
            onChange={(e) => setForm((f) => ({ ...f, author: e.target.value }))}
            placeholder="Tác giả"
            className="px-3 py-2 border rounded-md dark:bg-slate-900 dark:border-slate-700"
          />
          <input
            value={form.translator}
            onChange={(e) =>
              setForm((f) => ({ ...f, translator: e.target.value }))
            }
            placeholder="Người Dịch"
            className="px-3 py-2 border rounded-md dark:bg-slate-900 dark:border-slate-700"
          />
          <input
            value={form.publisher}
            onChange={(e) =>
              setForm((f) => ({ ...f, publisher: e.target.value }))
            }
            placeholder="NXB"
            className="px-3 py-2 border rounded-md dark:bg-slate-900 dark:border-slate-700"
          />
          <input
            value={form.publishYear}
            onChange={(e) =>
              setForm((f) => ({ ...f, publishYear: e.target.value }))
            }
            placeholder="Năm XB"
            type="number"
            min={0}
            className="px-3 py-2 border rounded-md dark:bg-slate-900 dark:border-slate-700"
          />
          <input
            value={form.weightGr}
            onChange={(e) =>
              setForm((f) => ({ ...f, weightGr: e.target.value }))
            }
            placeholder="Trọng lượng (gr)"
            type="number"
            min={0}
            className="px-3 py-2 border rounded-md dark:bg-slate-900 dark:border-slate-700"
          />
          <input
            value={form.packageSize}
            onChange={(e) =>
              setForm((f) => ({ ...f, packageSize: e.target.value }))
            }
            placeholder="Kích Thước Bao Bì"
            className="px-3 py-2 border rounded-md dark:bg-slate-900 dark:border-slate-700"
          />
          <input
            value={form.pages}
            onChange={(e) => setForm((f) => ({ ...f, pages: e.target.value }))}
            placeholder="Số trang"
            type="number"
            min={0}
            className="px-3 py-2 border rounded-md dark:bg-slate-900 dark:border-slate-700"
          />

          <div className="flex gap-3 md:col-span-2">
            <button className="px-4 py-2 bg-pink-500 text-white rounded-md">
              {editingId ? "Update" : "Create"}
            </button>
            {editingId ? (
              <button
                type="button"
                className="px-4 py-2 border rounded-md dark:border-slate-700"
                onClick={() => {
                  setEditingId(null);
                  setForm(emptyForm);
                  setSelectedLogBookId(null);
                }}
              >
                Cancel
              </button>
            ) : null}
          </div>
        </form>

        <div className="mt-10">
          {loading ? (
            <p>Loading...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Reserved</th>
                    <th>Available</th>
                    <th>Alert</th>
                    <th>Inventory</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {books.map((b) => {
                    const stock = Number(b.stock ?? b.quantity ?? 0);
                    const reserved = Number(b.reserved ?? 0);
                    const available = Math.max(0, stock - reserved);
                    const threshold = Number(b.lowStockThreshold ?? 5);
                    return (
                      <tr key={b._id}>
                        <td>{b.name}</td>
                        <td>{b.category}</td>
                        <td>${b.price}</td>
                        <td>{stock}</td>
                        <td>{reserved}</td>
                        <td>{available}</td>
                        <td>
                          {available <= threshold ? (
                            <span className="rounded-full bg-rose-100 px-2 py-1 text-xs font-semibold text-rose-700">
                              Sap het
                            </span>
                          ) : (
                            <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">
                              On
                            </span>
                          )}
                        </td>
                        <td>
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                              <input
                                value={inventoryDrafts[b._id]?.qty || ""}
                                onChange={(e) =>
                                  updateDraft(b._id, { qty: e.target.value })
                                }
                                placeholder="Qty"
                                type="number"
                                min={1}
                                className="w-20 px-2 py-1 border rounded-md dark:bg-slate-900 dark:border-slate-700"
                              />
                              <button
                                type="button"
                                className="px-2.5 py-1 rounded-md bg-emerald-500 text-white text-xs"
                                onClick={() => applyInventory(b._id, "in")}
                              >
                                Nhap
                              </button>
                              <button
                                type="button"
                                className="px-2.5 py-1 rounded-md bg-amber-500 text-white text-xs"
                                onClick={() => applyInventory(b._id, "out")}
                              >
                                Xuat
                              </button>
                            </div>
                            <input
                              value={inventoryDrafts[b._id]?.note || ""}
                              onChange={(e) =>
                                updateDraft(b._id, { note: e.target.value })
                              }
                              placeholder="Ghi chu"
                              className="px-2 py-1 border rounded-md text-xs dark:bg-slate-900 dark:border-slate-700"
                            />
                            <button
                              type="button"
                              className="text-xs text-slate-600 hover:text-slate-900 dark:text-slate-300"
                              onClick={() => loadInventoryLogs(b._id)}
                            >
                              Xem lich su
                            </button>
                          </div>
                        </td>
                        <td className="flex gap-2">
                          <button
                            className="px-3 py-1 border rounded-md dark:border-slate-700"
                            onClick={() => startEdit(b)}
                          >
                            Edit
                          </button>
                          <button
                            className="px-3 py-1 bg-red-500 text-white rounded-md"
                            onClick={() => remove(b._id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {selectedLogBookId ? (
          <div className="mt-8">
            <h2 className="text-lg font-semibold">Lich su kho</h2>
            {inventoryLogs.length ? (
              <div className="mt-3 overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Qty</th>
                      <th>Note</th>
                      <th>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventoryLogs.map((log) => (
                      <tr key={log._id}>
                        <td>{log.type}</td>
                        <td>{log.quantity}</td>
                        <td>{log.note || "-"}</td>
                        <td>
                          {log.createdAt
                            ? new Date(log.createdAt).toLocaleString("vi-VN")
                            : ""}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="mt-3 text-sm opacity-70">Chua co lich su</p>
            )}
          </div>
        ) : null}
      </div>
      <Footer />
    </>
  );
}

export default BooksAdmin;
