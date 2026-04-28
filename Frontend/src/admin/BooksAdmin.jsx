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
  const [imageFile, setImageFile] = useState(null);
  const [editingId, setEditingId] = useState(null);

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
      const payload = new FormData();
      payload.append("name", form.name);
      payload.append("price", form.price);
      payload.append("category", form.category);
      payload.append("title", form.title);
      payload.append("supplier", form.supplier);
      payload.append("author", form.author);
      payload.append("translator", form.translator);
      payload.append("publisher", form.publisher);
      payload.append("publishYear", form.publishYear);
      payload.append("weightGr", form.weightGr);
      payload.append("packageSize", form.packageSize);
      payload.append("pages", form.pages);
      if (imageFile) payload.append("image", imageFile);

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
      setImageFile(null);
      setEditingId(null);
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
    setImageFile(null);
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
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files && e.target.files[0];
              setImageFile(file || null);
            }}
            className="px-3 py-2 border rounded-md dark:bg-slate-900 dark:border-slate-700"
          />
          {form.image ? (
            <p className="text-xs opacity-70 md:col-span-2">
              Ảnh hiện tại: {form.image}
            </p>
          ) : null}
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
                  setImageFile(null);
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
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {books.map((b) => (
                    <tr key={b._id}>
                      <td>{b.name}</td>
                      <td>{b.category}</td>
                      <td>${b.price}</td>
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
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}

export default BooksAdmin;
