import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import axios from "axios";
import toast from "react-hot-toast";

const emptyForm = {
  name: "",
  price: "",
  category: "",
  genres: [],
  ageGroup: "",
  image: "",
  images: "",
  stock: "",
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
  isHidden: false,
};

const genreOptions = [
  "Comedy",
  "Adventure",
  "Action",
  "Romance",
  "Horror",
  "Mystery",
  "Slice of Life",
  "School Life",
  "Fantasy",
];

const ageOptions = ["3+", "6+", "10+", "13+", "16+", "18+"];

const parseSeries = (name) => {
  const text = String(name || "").trim();
  if (!text) return null;

  const patterns = [
    /(.*?)(?:\s*[-:])?\s*(?:Tap|T\u1eadp)\s*(\d+)\b/i,
    /(.*?)(?:\s*[-:])?\s*Vol\.?\s*(\d+)\b/i,
    /(.*?)(?:\s*[-:])?\s*Episode\s*(\d+)\b/i,
  ];

  for (const regex of patterns) {
    const match = text.match(regex);
    if (match && match[1]) {
      const seriesName = String(match[1]).trim();
      if (!seriesName) return null;
      const volume = String(match[2] || "").trim();
      return {
        seriesName,
        seriesKey: seriesName.toLowerCase(),
        volumeLabel: volume,
      };
    }
  }

  return null;
};

const getStockMeta = (book) => {
  const stock = Number(book.stock ?? book.quantity ?? 0);
  const reserved = Number(book.reserved ?? 0);
  const available = Math.max(0, stock - reserved);
  const threshold = Number(book.lowStockThreshold ?? 5);
  const soldCount = Number(book.soldCount ?? 0);
  const total = available + soldCount;
  const remainingPct = total > 0 ? Math.round((available / total) * 100) : 0;
  return {
    stock,
    reserved,
    available,
    threshold,
    soldCount,
    total,
    remainingPct,
    isOut: available <= 0,
    isLow: available > 0 && available <= threshold,
  };
};

function BooksAdmin() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [inventoryDrafts, setInventoryDrafts] = useState({});
  const [inventoryLogs, setInventoryLogs] = useState([]);
  const [selectedLogBookId, setSelectedLogBookId] = useState(null);
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [activeTab, setActiveTab] = useState("list");
  const [searchText, setSearchText] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterGenre, setFilterGenre] = useState("");
  const [filterStock, setFilterStock] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortDir, setSortDir] = useState("asc");
  const [includeHidden, setIncludeHidden] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [expandedSeries, setExpandedSeries] = useState(new Set());
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [bulkForm, setBulkForm] = useState({
    price: "",
    stock: "",
    lowStockThreshold: "",
    category: "",
    isHidden: "",
  });
  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const genresDropdownRef = useRef(null);
  const modalRoot = typeof document !== "undefined" ? document.body : null;

  const dynamicCategories = useMemo(() => {
    const list = books
      .map((b) => String(b?.category || "").trim())
      .filter(Boolean);
    return Array.from(new Set(list));
  }, [books]);

  const buildQuery = () => ({
    search: searchText || undefined,
    category: filterCategory || undefined,
    genre: filterGenre || undefined,
    stockStatus: filterStock || undefined,
    minPrice: minPrice || undefined,
    maxPrice: maxPrice || undefined,
    sortBy: sortBy || undefined,
    sortDir: sortDir || undefined,
    includeHidden: includeHidden ? "true" : undefined,
  });

  const load = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/book", { params: buildQuery() });
      setBooks(res.data || []);
      setSelectedIds(new Set());
    } catch (err) {
      const message =
        err?.response?.data?.message || err?.message || "Failed to load";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const loadSummary = async () => {
    setSummaryLoading(true);
    try {
      const res = await axios.get("/order/admin/summary", {
        withCredentials: true,
      });
      setSummary(res.data || null);
    } catch (err) {
      const message =
        err?.response?.data?.message || err?.message || "Failed to load";
      toast.error(message);
    } finally {
      setSummaryLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "dashboard") {
      loadSummary();
      return;
    }
    load();
  }, [
    activeTab,
    searchText,
    filterCategory,
    filterGenre,
    filterStock,
    minPrice,
    maxPrice,
    sortBy,
    sortDir,
    includeHidden,
  ]);

  const submit = async (e) => {
    e.preventDefault();
    try {
      if (!form.image.trim()) {
        toast.error("Cần nhập URL ảnh chính");
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
        toast.error("URL ảnh chính không hợp lệ");
        return;
      }

      const galleryUrls = form.images
        .split(",")
        .map((url) => url.trim())
        .filter(Boolean);
      if (galleryUrls.some((url) => !validateUrl(url))) {
        toast.error("URL ảnh chi tiết không hợp lệ");
        return;
      }

      const payload = {
        name: form.name,
        price: form.price,
        category: form.category,
        genres: form.genres,
        ageGroup: form.ageGroup,
        image: form.image,
        images: form.images,
        stock: form.stock,
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
        isHidden: Boolean(form.isHidden),
      };

      if (editingId) {
        await axios.put(`/book/${editingId}`, payload, {
          withCredentials: true,
        });
        toast.success("Đã cập nhật sách");
      } else {
        await axios.post("/book", payload, {
          withCredentials: true,
        });
        toast.success("Đã thêm sách");
      }

      setForm(emptyForm);
      setEditingId(null);
      setSelectedLogBookId(null);
      setShowFormModal(false);
      await load();
    } catch (err) {
      const message =
        err?.response?.data?.message || err?.message || "Lưu thất bại";
      toast.error(message);
    }
  };

  const startEdit = (b) => {
    setEditingId(b._id);
    setShowCustomCategory(false);
    setForm({
      name: b.name || "",
      price: b.price ?? "",
      category: b.category || "",
      genres: Array.isArray(b.genres) ? b.genres : [],
      ageGroup: b.ageGroup || "",
      image: b.image || "",
      images: Array.isArray(b.images) ? b.images.join(", ") : "",
      stock: b.stock ?? "",
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
      isHidden: Boolean(b.isHidden),
    });
    setShowFormModal(true);
  };

  const startCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowCustomCategory(dynamicCategories.length === 0);
    setShowFormModal(true);
  };

  const remove = async (id) => {
    if (!confirm("Xóa sách này?")) return;
    try {
      await axios.delete(`/book/${id}`, { withCredentials: true });
      toast.success("Đã xóa sách");
      await load();
    } catch (err) {
      const message =
        err?.response?.data?.message || err?.message || "Xóa thất bại";
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
      toast.error("Nhập số lượng hợp lệ");
      return;
    }

    try {
      await axios.post(
        `/book/${id}/inventory`,
        { type, quantity: qty, note: draft.note || "" },
        { withCredentials: true },
      );
      toast.success("Đã cập nhật tồn kho");
      updateDraft(id, { qty: "", note: "" });
      await load();
      if (selectedLogBookId === id) {
        await loadInventoryLogs(id);
      }
    } catch (err) {
      const message =
        err?.response?.data?.message || err?.message || "Cập nhật thất bại";
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
        "Không tải được lịch sử";
      toast.error(message);
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSelectGroup = (bookIds) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      const allSelected = bookIds.every((id) => next.has(id));
      if (allSelected) {
        bookIds.forEach((id) => next.delete(id));
      } else {
        bookIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const toggleSelectAll = (bookIds) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      const allSelected = bookIds.every((id) => next.has(id));
      if (allSelected) {
        bookIds.forEach((id) => next.delete(id));
      } else {
        bookIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const toggleSeries = (key) => {
    setExpandedSeries((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const applyBulkUpdate = async () => {
    const ids = Array.from(selectedIds);
    if (!ids.length) {
      toast.error("Chọn ít nhất 1 sách");
      return;
    }

    const updates = {};
    if (bulkForm.price !== "") updates.price = bulkForm.price;
    if (bulkForm.stock !== "") updates.stock = bulkForm.stock;
    if (bulkForm.lowStockThreshold !== "") {
      updates.lowStockThreshold = bulkForm.lowStockThreshold;
    }
    if (bulkForm.category !== "") updates.category = bulkForm.category;
    if (bulkForm.isHidden !== "")
      updates.isHidden = bulkForm.isHidden === "true";

    if (!Object.keys(updates).length) {
      toast.error("Chưa nhập thông tin cập nhật");
      return;
    }

    try {
      await axios.patch(
        "/book/bulk",
        { ids, action: "update", updates },
        { withCredentials: true },
      );
      toast.success("Đã cập nhật hàng loạt");
      setBulkModalOpen(false);
      setBulkForm({
        price: "",
        stock: "",
        lowStockThreshold: "",
        category: "",
        isHidden: "",
      });
      await load();
    } catch (err) {
      const message =
        err?.response?.data?.message || err?.message || "Cập nhật thất bại";
      toast.error(message);
    }
  };

  const applyBulkAction = async (action) => {
    const ids = Array.from(selectedIds);
    if (!ids.length) {
      toast.error("Chọn ít nhất 1 sách");
      return;
    }

    if (action === "delete" && !confirm("Xóa các sách đã chọn?")) return;
    if (action === "hide" && !confirm("Ẩn các sách đã chọn?")) return;

    try {
      await axios.patch(
        "/book/bulk",
        { ids, action },
        { withCredentials: true },
      );
      toast.success("Đã cập nhật");
      await load();
    } catch (err) {
      const message =
        err?.response?.data?.message || err?.message || "Cập nhật thất bại";
      toast.error(message);
    }
  };

  const openBulkModal = () => {
    if (!selectedIds.size) {
      toast.error("Chọn ít nhất 1 sách");
      return;
    }
    setBulkModalOpen(true);
  };

  const seriesRows = useMemo(() => {
    const map = new Map();
    const order = [];
    const singles = [];

    for (const book of books) {
      const meta = parseSeries(book.name);
      if (!meta) {
        singles.push({ type: "book", book });
        continue;
      }

      if (!map.has(meta.seriesKey)) {
        map.set(meta.seriesKey, {
          type: "series",
          seriesName: meta.seriesName,
          seriesKey: meta.seriesKey,
          books: [],
        });
        order.push(meta.seriesKey);
      }
      map.get(meta.seriesKey).books.push({ book, volume: meta.volumeLabel });
    }

    const rows = [];
    for (const key of order) {
      const group = map.get(key);
      if (group.books.length <= 1) {
        rows.push({ type: "book", book: group.books[0].book });
      } else {
        rows.push(group);
      }
    }

    return [...rows, ...singles];
  }, [books]);

  const visibleBookIds = useMemo(() => {
    const ids = [];
    for (const row of seriesRows) {
      if (row.type === "series") {
        row.books.forEach((b) => ids.push(b.book._id));
      } else {
        ids.push(row.book._id);
      }
    }
    return ids;
  }, [seriesRows]);

  const renderStockCell = (meta) => {
    const badge = meta.isOut ? "Hết hàng" : meta.isLow ? "Sắp hết" : "Ổn";
    const badgeClass = meta.isOut
      ? "bg-rose-500 text-white"
      : meta.isLow
        ? "bg-amber-200 text-amber-900"
        : "bg-emerald-100 text-emerald-700";
    const barClass = meta.isOut
      ? "bg-rose-500"
      : meta.isLow
        ? "bg-amber-500"
        : "bg-emerald-500";

    return (
      <div className="min-w-[220px]">
        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold">Tồn:</span> {meta.stock}
          <span className="font-semibold">Đặt:</span> {meta.reserved}
          <span className="font-semibold">Còn:</span> {meta.available}
        </div>
        <div className="mt-2 h-2 w-full rounded-full bg-slate-200">
          <div
            className={`h-2 rounded-full ${barClass}`}
            style={{ width: `${meta.remainingPct}%` }}
          />
        </div>
        <div className="mt-2 flex items-center justify-between text-xs">
          <span className="text-slate-500">Còn lại {meta.remainingPct}%</span>
          <span
            className={`rounded-full px-2 py-0.5 font-semibold ${badgeClass}`}
          >
            {badge}
          </span>
        </div>
      </div>
    );
  };

  return (
    <>
      <Navbar />
      <div className="max-w-screen-2xl container mx-auto md:px-20 px-4 min-h-screen pt-28">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold">Quản trị: Sách</h1>
          <div className="relative z-10 flex items-center gap-2 pointer-events-auto">
            <button
              type="button"
              className="px-4 py-2 rounded-md border dark:border-slate-700 pointer-events-auto"
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                startCreate();
              }}
            >
              Thêm sách
            </button>
            <button
              type="button"
              className="px-4 py-2 rounded-md bg-slate-900 text-white pointer-events-auto"
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                openBulkModal();
              }}
            >
              Cập nhật hàng loạt
            </button>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2 border-b pb-2">
          {[
            { id: "dashboard", label: "Tổng quan" },
            { id: "list", label: "Danh sách" },
            { id: "inventory", label: "Nhập kho" },
          ].map((tab) => (
            <button
              key={tab.id}
              className={`px-4 py-2 rounded-md text-sm ${
                activeTab === tab.id
                  ? "bg-slate-900 text-white"
                  : "border dark:border-slate-700"
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab !== "dashboard" ? (
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-8 gap-3">
            <input
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Tìm theo tên / nhóm"
              className="lg:col-span-2 px-3 py-2 border rounded-md dark:bg-slate-900 dark:border-slate-700"
            />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 border rounded-md dark:bg-slate-900 dark:border-slate-700"
            >
              <option value="">Tất cả nhóm</option>
              {dynamicCategories.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <select
              value={filterGenre}
              onChange={(e) => setFilterGenre(e.target.value)}
              className="px-3 py-2 border rounded-md dark:bg-slate-900 dark:border-slate-700"
            >
              <option value="">Tất cả thể loại</option>
              {genreOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <select
              value={filterStock}
              onChange={(e) => setFilterStock(e.target.value)}
              className="px-3 py-2 border rounded-md dark:bg-slate-900 dark:border-slate-700"
            >
              <option value="">Tất cả tồn kho</option>
              <option value="in">Còn hàng</option>
              <option value="out">Hết hàng</option>
              <option value="low">Sắp hết</option>
            </select>
            <input
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              placeholder="Giá từ"
              type="number"
              min={0}
              className="px-3 py-2 border rounded-md dark:bg-slate-900 dark:border-slate-700"
            />
            <input
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="Giá đến"
              type="number"
              min={0}
              className="px-3 py-2 border rounded-md dark:bg-slate-900 dark:border-slate-700"
            />
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="flex-1 px-3 py-2 border rounded-md dark:bg-slate-900 dark:border-slate-700"
              >
                <option value="name">Tên A-Z</option>
                <option value="price">Giá</option>
                <option value="available">Tồn thực tế</option>
                <option value="stock">Tồn kho</option>
              </select>
              <button
                type="button"
                className="px-3 py-2 border rounded-md dark:border-slate-700"
                onClick={() =>
                  setSortDir((prev) => (prev === "asc" ? "desc" : "asc"))
                }
              >
                {sortDir === "asc" ? "Tăng" : "Giảm"}
              </button>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={includeHidden}
                onChange={(e) => setIncludeHidden(e.target.checked)}
              />
              Hiện ẩn
            </label>
          </div>
        ) : null}

        {activeTab === "dashboard" ? (
          <div className="mt-8">
            {summaryLoading ? (
              <p>Đang tải...</p>
            ) : summary ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="rounded-xl border p-4 bg-white">
                    <p className="text-xs uppercase text-slate-500">
                      Tổng đầu sách
                    </p>
                    <p className="text-3xl font-bold mt-2">
                      {summary.totalBooks}
                    </p>
                  </div>
                  <div className="rounded-xl border p-4 bg-white">
                    <p className="text-xs uppercase text-slate-500">
                      Sắp hết (&lt;=5)
                    </p>
                    <p className="text-3xl font-bold mt-2">
                      {summary.lowStockCount}
                    </p>
                  </div>
                  <div className="rounded-xl border p-4 bg-white">
                    <p className="text-xs uppercase text-slate-500">
                      Doanh thu 7 ngày
                    </p>
                    <p className="text-3xl font-bold mt-2">
                      {summary.revenue7d?.toLocaleString("vi-VN")} VND
                    </p>
                  </div>
                </div>
                <div className="mt-6">
                  <h2 className="text-lg font-semibold">Đơn hàng gần nhất</h2>
                  <div className="mt-3 overflow-x-auto">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Khách</th>
                          <th>Tổng</th>
                          <th>Trạng thái</th>
                          <th>Thanh toán</th>
                          <th>Thời gian</th>
                        </tr>
                      </thead>
                      <tbody>
                        {summary.recentOrders?.map((order) => (
                          <tr key={order._id}>
                            <td>{order._id}</td>
                            <td>
                              {order.userId?.fullname ||
                                order.userId?.email ||
                                "-"}
                            </td>
                            <td>{order.total?.toLocaleString("vi-VN")} VND</td>
                            <td>{order.status}</td>
                            <td>{order.paymentStatus}</td>
                            <td>
                              {order.createdAt
                                ? new Date(order.createdAt).toLocaleString(
                                    "vi-VN",
                                  )
                                : ""}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            ) : (
              <p>Không có dữ liệu</p>
            )}
          </div>
        ) : null}

        {activeTab === "list" ? (
          <div className="mt-8">
            {loading ? (
              <p>Đang tải...</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th>
                        <input
                          type="checkbox"
                          checked={
                            visibleBookIds.length > 0 &&
                            visibleBookIds.every((id) => selectedIds.has(id))
                          }
                          onChange={() => toggleSelectAll(visibleBookIds)}
                        />
                      </th>
                      <th>Tên sách</th>
                      <th>Nhóm</th>
                      <th>Giá</th>
                      <th>Tồn kho</th>
                      <th>Trạng thái</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {seriesRows.map((row) => {
                      if (row.type === "series") {
                        const bookIds = row.books.map((b) => b.book._id);
                        const allSelected = bookIds.every((id) =>
                          selectedIds.has(id),
                        );
                        const stockTotals = row.books.reduce(
                          (acc, curr) => {
                            const meta = getStockMeta(curr.book);
                            acc.stock += meta.stock;
                            acc.reserved += meta.reserved;
                            acc.available += meta.available;
                            acc.soldCount += meta.soldCount;
                            acc.threshold = Math.min(
                              acc.threshold,
                              meta.threshold,
                            );
                            return acc;
                          },
                          {
                            stock: 0,
                            reserved: 0,
                            available: 0,
                            soldCount: 0,
                            threshold: Number.MAX_SAFE_INTEGER,
                          },
                        );
                        const summaryMeta = getStockMeta({
                          stock: stockTotals.stock,
                          reserved: stockTotals.reserved,
                          lowStockThreshold:
                            stockTotals.threshold === Number.MAX_SAFE_INTEGER
                              ? 5
                              : stockTotals.threshold,
                          soldCount: stockTotals.soldCount,
                        });
                        return (
                          <Fragment key={row.seriesKey}>
                            <tr className="bg-slate-50">
                              <td>
                                <input
                                  type="checkbox"
                                  checked={allSelected}
                                  onChange={() => toggleSelectGroup(bookIds)}
                                />
                              </td>
                              <td className="font-semibold">
                                <button
                                  className="mr-2 text-slate-500"
                                  onClick={() => toggleSeries(row.seriesKey)}
                                >
                                  {expandedSeries.has(row.seriesKey)
                                    ? "-"
                                    : "+"}
                                </button>
                                {row.seriesName}
                                <span className="ml-2 text-xs text-slate-500">
                                  ({row.books.length} tập)
                                </span>
                              </td>
                              <td>-</td>
                              <td>-</td>
                              <td>{renderStockCell(summaryMeta)}</td>
                              <td>
                                <span className="text-xs text-slate-500">
                                  Bộ sách
                                </span>
                              </td>
                              <td></td>
                            </tr>
                            {expandedSeries.has(row.seriesKey)
                              ? row.books.map((entry) => {
                                  const meta = getStockMeta(entry.book);
                                  return (
                                    <tr key={entry.book._id}>
                                      <td>
                                        <input
                                          type="checkbox"
                                          checked={selectedIds.has(
                                            entry.book._id,
                                          )}
                                          onChange={() =>
                                            toggleSelect(entry.book._id)
                                          }
                                        />
                                      </td>
                                      <td>
                                        {entry.book.name}
                                        {entry.volume ? (
                                          <span className="ml-2 text-xs text-slate-400">
                                            Tập {entry.volume}
                                          </span>
                                        ) : null}
                                      </td>
                                      <td>{entry.book.category}</td>
                                      <td>{entry.book.price}</td>
                                      <td>{renderStockCell(meta)}</td>
                                      <td>
                                        {entry.book.isHidden ? (
                                          <span className="text-xs text-slate-400">
                                            Ẩn
                                          </span>
                                        ) : (
                                          <span className="text-xs text-emerald-600">
                                            Hiện
                                          </span>
                                        )}
                                      </td>
                                      <td className="flex gap-2">
                                        <button
                                          className="px-3 py-1 border rounded-md dark:border-slate-700"
                                          onClick={() => startEdit(entry.book)}
                                        >
                                          Sửa
                                        </button>
                                        <button
                                          className="px-3 py-1 bg-red-500 text-white rounded-md"
                                          onClick={() => remove(entry.book._id)}
                                        >
                                          Xóa
                                        </button>
                                      </td>
                                    </tr>
                                  );
                                })
                              : null}
                          </Fragment>
                        );
                      }

                      const meta = getStockMeta(row.book);
                      return (
                        <tr key={row.book._id}>
                          <td>
                            <input
                              type="checkbox"
                              checked={selectedIds.has(row.book._id)}
                              onChange={() => toggleSelect(row.book._id)}
                            />
                          </td>
                          <td>{row.book.name}</td>
                          <td>{row.book.category}</td>
                          <td>{row.book.price}</td>
                          <td>{renderStockCell(meta)}</td>
                          <td>
                            {row.book.isHidden ? (
                              <span className="text-xs text-slate-400">Ẩn</span>
                            ) : (
                              <span className="text-xs text-emerald-600">
                                Hiện
                              </span>
                            )}
                          </td>
                          <td className="flex gap-2">
                            <button
                              className="px-3 py-1 border rounded-md dark:border-slate-700"
                              onClick={() => startEdit(row.book)}
                            >
                              Sửa
                            </button>
                            <button
                              className="px-3 py-1 bg-red-500 text-white rounded-md"
                              onClick={() => remove(row.book._id)}
                            >
                              Xóa
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
        ) : null}

        {activeTab === "inventory" ? (
          <div className="mt-8">
            {loading ? (
              <p>Đang tải...</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Tên sách</th>
                      <th>Tồn kho</th>
                      <th>Nhập / Xuất</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {books.map((b) => {
                      const meta = getStockMeta(b);
                      return (
                        <tr key={b._id}>
                          <td>{b.name}</td>
                          <td>
                            <div className="text-xs">
                              Tồn {meta.stock} | Đặt trước {meta.reserved} | Còn{" "}
                              {meta.available}
                            </div>
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
                                  Nhập
                                </button>
                                <button
                                  type="button"
                                  className="px-2.5 py-1 rounded-md bg-amber-500 text-white text-xs"
                                  onClick={() => applyInventory(b._id, "out")}
                                >
                                  Xuất
                                </button>
                              </div>
                              <input
                                value={inventoryDrafts[b._id]?.note || ""}
                                onChange={(e) =>
                                  updateDraft(b._id, { note: e.target.value })
                                }
                                placeholder="Ghi chú"
                                className="px-2 py-1 border rounded-md text-xs dark:bg-slate-900 dark:border-slate-700"
                              />
                            </div>
                          </td>
                          <td>
                            <button
                              type="button"
                              className="text-xs text-slate-600 hover:text-slate-900 dark:text-slate-300"
                              onClick={() => loadInventoryLogs(b._id)}
                            >
                              Xem lịch sử
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {selectedLogBookId ? (
              <div className="mt-8">
                <h2 className="text-lg font-semibold">Lịch sử kho</h2>
                {inventoryLogs.length ? (
                  <div className="mt-3 overflow-x-auto">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Loại</th>
                          <th>Số lượng</th>
                          <th>Ghi chú</th>
                          <th>Thời gian</th>
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
                                ? new Date(log.createdAt).toLocaleString(
                                    "vi-VN",
                                  )
                                : ""}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="mt-3 text-sm opacity-70">Chưa có lịch sử</p>
                )}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      {showFormModal && modalRoot
        ? createPortal(
            <div
              className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
              style={{ backgroundColor: "rgba(0, 0, 0, 0.4)" }}
            >
              <div className="w-full max-w-4xl rounded-xl bg-white p-6 shadow-xl">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">
                    {editingId ? "Cập nhật sách" : "Thêm sách"}
                  </h2>
                  <button
                    className="text-slate-500"
                    onClick={() => setShowFormModal(false)}
                  >
                    Đóng
                  </button>
                </div>
                <form
                  onSubmit={submit}
                  className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  <input
                    value={form.name}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, name: e.target.value }))
                    }
                    placeholder="Tên sách"
                    className="px-3 py-2 border rounded-md dark:bg-slate-900 dark:border-slate-700"
                    required
                  />
                  <input
                    value={form.price}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, price: e.target.value }))
                    }
                    placeholder="Giá"
                    type="number"
                    min={0}
                    className="px-3 py-2 border rounded-md dark:bg-slate-900 dark:border-slate-700"
                    required
                  />
                  <div className="flex gap-2">
                    {!showCustomCategory ? (
                      <>
                        <select
                          value={form.category}
                          onChange={(e) =>
                            setForm((f) => ({ ...f, category: e.target.value }))
                          }
                          className="flex-1 px-3 py-2 border rounded-md dark:bg-slate-900 dark:border-slate-700"
                        >
                          <option value="">Chọn nhóm sản phẩm</option>
                          {dynamicCategories.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          className="px-3 py-2 border border-rose-500 text-rose-500 rounded-md text-sm whitespace-nowrap"
                          onClick={() => setShowCustomCategory(true)}
                        >
                          + Thêm mới
                        </button>
                      </>
                    ) : (
                      <>
                        <input
                          value={form.category}
                          onChange={(e) =>
                            setForm((f) => ({ ...f, category: e.target.value }))
                          }
                          placeholder="Nhập tên nhóm sản phẩm mới"
                          className="flex-1 px-3 py-2 border rounded-md dark:bg-slate-900 dark:border-slate-700"
                        />
                        <button
                          type="button"
                          className="px-3 py-2 border border-slate-500 text-slate-500 rounded-md text-sm whitespace-nowrap"
                          onClick={() => {
                            setShowCustomCategory(false);
                            setForm((f) => ({ ...f, category: "" }));
                          }}
                        >
                          Hủy
                        </button>
                      </>
                    )}
                  </div>
                  <details className="relative" ref={genresDropdownRef}>
                    <summary className="cursor-pointer list-none rounded-md border px-3 py-2 dark:border-slate-700 dark:bg-slate-900">
                      {form.genres.length
                        ? `Thể loại: ${form.genres.join(", ")}`
                        : "Chọn thể loại"}
                    </summary>
                    <div className="absolute z-10 mt-2 max-h-56 w-full overflow-auto rounded-md border bg-white p-3 shadow-md dark:border-slate-700 dark:bg-slate-900">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {genreOptions.map((opt) => (
                          <label key={opt} className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              className="h-4 w-4 rounded border-slate-300 text-rose-500 focus:ring-rose-500"
                              checked={form.genres.includes(opt)}
                              onChange={() =>
                                setForm((f) => ({
                                  ...f,
                                  genres: f.genres.includes(opt)
                                    ? f.genres.filter((g) => g !== opt)
                                    : [...f.genres, opt],
                                }))
                              }
                              onClick={() => {
                                if (genresDropdownRef.current) {
                                  genresDropdownRef.current.open = false;
                                }
                              }}
                            />
                            <span>{opt}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </details>
                  <select
                    value={form.ageGroup}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, ageGroup: e.target.value }))
                    }
                    className="px-3 py-2 border rounded-md dark:bg-slate-900 dark:border-slate-700"
                  >
                    <option value="">Chọn độ tuổi</option>
                    {ageOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                  <input
                    value={form.image}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, image: e.target.value }))
                    }
                    placeholder="URL ảnh chính"
                    className="px-3 py-2 border rounded-md dark:bg-slate-900 dark:border-slate-700"
                    required
                  />
                  <input
                    value={form.stock}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, stock: e.target.value }))
                    }
                    placeholder="Tồn kho (stock)"
                    type="number"
                    min={0}
                    className="px-3 py-2 border rounded-md dark:bg-slate-900 dark:border-slate-700"
                  />
                  <input
                    value={form.lowStockThreshold}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        lowStockThreshold: e.target.value,
                      }))
                    }
                    placeholder="Cảnh báo sắp hết"
                    type="number"
                    min={0}
                    className="px-3 py-2 border rounded-md dark:bg-slate-900 dark:border-slate-700"
                  />
                  <textarea
                    value={form.images}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, images: e.target.value }))
                    }
                    placeholder="Danh sách URL ảnh (phân cách bởi dấu phẩy)"
                    rows={2}
                    className="px-3 py-2 border rounded-md dark:bg-slate-900 dark:border-slate-700 md:col-span-2"
                  />
                  <textarea
                    value={form.title}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, title: e.target.value }))
                    }
                    placeholder="Tiêu đề (mô tả sản phẩm)"
                    rows={4}
                    className="px-3 py-2 border rounded-md dark:bg-slate-900 dark:border-slate-700 md:col-span-2"
                  />
                  <input
                    value={form.supplier}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, supplier: e.target.value }))
                    }
                    placeholder="Tên nhà cung cấp"
                    className="px-3 py-2 border rounded-md dark:bg-slate-900 dark:border-slate-700"
                  />
                  <input
                    value={form.author}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, author: e.target.value }))
                    }
                    placeholder="Tác giả"
                    className="px-3 py-2 border rounded-md dark:bg-slate-900 dark:border-slate-700"
                  />
                  <input
                    value={form.translator}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, translator: e.target.value }))
                    }
                    placeholder="Người dịch"
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
                    placeholder="Kích thước bao bì"
                    className="px-3 py-2 border rounded-md dark:bg-slate-900 dark:border-slate-700"
                  />
                  <input
                    value={form.pages}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, pages: e.target.value }))
                    }
                    placeholder="Số trang"
                    type="number"
                    min={0}
                    className="px-3 py-2 border rounded-md dark:bg-slate-900 dark:border-slate-700"
                  />
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={form.isHidden}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, isHidden: e.target.checked }))
                      }
                    />
                    Ẩn sản phẩm
                  </label>

                  <div className="flex gap-3 md:col-span-2">
                    <button className="px-4 py-2 bg-pink-500 text-white rounded-md">
                      {editingId ? "Cập nhật" : "Tạo mới"}
                    </button>
                    <button
                      type="button"
                      className="px-4 py-2 border rounded-md"
                      onClick={() => {
                        setShowFormModal(false);
                        setEditingId(null);
                        setForm(emptyForm);
                      }}
                    >
                      Hủy
                    </button>
                  </div>
                </form>
              </div>
            </div>,
            modalRoot,
          )
        : null}

      {bulkModalOpen && modalRoot
        ? createPortal(
            <div
              className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
              style={{ backgroundColor: "rgba(0, 0, 0, 0.4)" }}
            >
              <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Cập nhật hàng loạt</h2>
                  <button
                    className="text-slate-500"
                    onClick={() => setBulkModalOpen(false)}
                  >
                    Đóng
                  </button>
                </div>
                <div className="mt-4 grid grid-cols-1 gap-3">
                  <input
                    value={bulkForm.price}
                    onChange={(e) =>
                      setBulkForm((f) => ({ ...f, price: e.target.value }))
                    }
                    placeholder="Giá mới"
                    type="number"
                    min={0}
                    className="px-3 py-2 border rounded-md"
                  />
                  <input
                    value={bulkForm.stock}
                    onChange={(e) =>
                      setBulkForm((f) => ({ ...f, stock: e.target.value }))
                    }
                    placeholder="Stock mới"
                    type="number"
                    min={0}
                    className="px-3 py-2 border rounded-md"
                  />
                  <input
                    value={bulkForm.lowStockThreshold}
                    onChange={(e) =>
                      setBulkForm((f) => ({
                        ...f,
                        lowStockThreshold: e.target.value,
                      }))
                    }
                    placeholder="Cảnh báo sắp hết"
                    type="number"
                    min={0}
                    className="px-3 py-2 border rounded-md"
                  />
                  <input
                    value={bulkForm.category}
                    onChange={(e) =>
                      setBulkForm((f) => ({ ...f, category: e.target.value }))
                    }
                    placeholder="Nhóm sản phẩm"
                    className="px-3 py-2 border rounded-md"
                  />
                  <select
                    value={bulkForm.isHidden}
                    onChange={(e) =>
                      setBulkForm((f) => ({ ...f, isHidden: e.target.value }))
                    }
                    className="px-3 py-2 border rounded-md"
                  >
                    <option value="">Không đổi trạng thái ẩn</option>
                    <option value="true">Ẩn</option>
                    <option value="false">Hiện</option>
                  </select>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    className="px-4 py-2 rounded-md bg-slate-900 text-white"
                    onClick={applyBulkUpdate}
                  >
                    Áp dụng
                  </button>
                  <button
                    className="px-4 py-2 rounded-md border"
                    onClick={() => applyBulkAction("hide")}
                  >
                    Ẩn nhiều
                  </button>
                  <button
                    className="px-4 py-2 rounded-md border"
                    onClick={() => applyBulkAction("show")}
                  >
                    Hiện nhiều
                  </button>
                  <button
                    className="px-4 py-2 rounded-md bg-red-500 text-white"
                    onClick={() => applyBulkAction("delete")}
                  >
                    Xóa nhiều
                  </button>
                </div>
              </div>
            </div>,
            modalRoot,
          )
        : null}

      <Footer />
    </>
  );
}

export default BooksAdmin;
