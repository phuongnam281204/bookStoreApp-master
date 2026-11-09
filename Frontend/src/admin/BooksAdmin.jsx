import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import AdminLayout, {
  EmptyState,
  LoadingRows,
  Modal,
  PageHeader,
  Pill,
  formatDateTime,
  formatVnd,
} from "./AdminLayout";

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

const Thumb = ({ src }) =>
  src ? (
    <img src={src} alt="" loading="lazy" className="h-12 w-9 shrink-0 rounded-sm object-cover shadow-sm" />
  ) : (
    <div className="h-12 w-9 shrink-0 rounded-sm bg-ink/10" />
  );

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
  const genresDropdownRef = useRef(null);

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

  useEffect(() => {
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

  const setField = (key) => (e) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const closeForm = () => {
    setShowFormModal(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const logBook = books.find((b) => b._id === selectedLogBookId);

  const renderStock = (meta) => {
    const tone = meta.isOut ? "bad" : meta.isLow ? "warn" : "good";
    const bar = meta.isOut ? "bg-sale" : meta.isLow ? "bg-amber-500" : "bg-emerald-600";
    return (
      <div className="min-w-[170px]">
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-medium tabular-nums">Còn {meta.available}</span>
          <Pill tone={tone}>{meta.isOut ? "Hết hàng" : meta.isLow ? "Sắp hết" : "Ổn"}</Pill>
        </div>
        <div className="mt-1.5 h-1 w-full rounded-full bg-ink/10">
          <div className={`h-1 rounded-full ${bar}`} style={{ width: `${meta.remainingPct}%` }} />
        </div>
        <p className="mt-1 text-[11px] tabular-nums text-muted">
          Tồn {meta.stock} · Giữ chỗ {meta.reserved} · Đã bán {meta.soldCount}
        </p>
      </div>
    );
  };

  const bookRow = (book, volume, nested = false) => {
    const meta = getStockMeta(book);
    return (
      <tr key={book._id} className={selectedIds.has(book._id) ? "bg-accent/5" : ""}>
        <td className="w-10">
          <input
            type="checkbox"
            className="checkbox checkbox-sm checkbox-primary"
            checked={selectedIds.has(book._id)}
            onChange={() => toggleSelect(book._id)}
            aria-label={`Chọn ${book.name}`}
          />
        </td>
        <td>
          <div className={`flex min-w-[240px] items-center gap-3 ${nested ? "pl-6" : ""}`}>
            <Thumb src={book.image} />
            <div className="min-w-0">
              <p className="line-clamp-2 font-medium leading-snug">{book.name}</p>
              <p className="mt-0.5 text-xs text-muted">
                {volume ? `Tập ${volume} · ` : ""}
                {book.category || "Chưa phân nhóm"}
              </p>
            </div>
          </div>
        </td>
        <td className="whitespace-nowrap text-right tabular-nums">{formatVnd(book.price)}</td>
        <td>{renderStock(meta)}</td>
        <td>
          {book.isHidden ? <Pill>Đang ẩn</Pill> : <Pill tone="good">Hiển thị</Pill>}
        </td>
        <td>
          <div className="flex justify-end gap-2">
            <button className="btn-xs-line" onClick={() => startEdit(book)}>
              Sửa
            </button>
            <button className="btn-xs-danger" onClick={() => remove(book._id)} aria-label={`Xóa ${book.name}`}>
              Xóa
            </button>
          </div>
        </td>
      </tr>
    );
  };

  const tabs = [
    { id: "list", label: "Danh sách" },
    { id: "inventory", label: "Nhập / xuất kho" },
  ];

  return (
    <AdminLayout>
      <PageHeader
        title="Sách & kho"
        description={loading ? "Đang tải…" : `${books.length} đầu sách khớp bộ lọc`}
        actions={
          <button type="button" className="btn-xs-solid" onClick={startCreate}>
            + Thêm sách
          </button>
        }
      />

      <div className="mt-4 flex gap-6 border-b border-line" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            className={`-mb-px border-b-2 pb-3 pt-2 text-sm transition-colors ${
              activeTab === tab.id
                ? "border-accent font-semibold text-ink"
                : "border-transparent text-muted hover:text-ink"
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-[2fr_1fr_1fr_1fr]">
        <input
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="Tìm theo tên / nhóm"
          className="field col-span-2 md:col-span-4 xl:col-span-1"
          aria-label="Tìm sách"
        />
        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="field" aria-label="Nhóm">
          <option value="">Tất cả nhóm</option>
          {dynamicCategories.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <select value={filterGenre} onChange={(e) => setFilterGenre(e.target.value)} className="field" aria-label="Thể loại">
          <option value="">Tất cả thể loại</option>
          {genreOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <select value={filterStock} onChange={(e) => setFilterStock(e.target.value)} className="field col-span-2 md:col-span-1" aria-label="Tồn kho">
          <option value="">Mọi tình trạng kho</option>
          <option value="in">Còn hàng</option>
          <option value="low">Sắp hết</option>
          <option value="out">Hết hàng</option>
        </select>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
        <div className="flex items-center gap-2">
          <input
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            placeholder="Giá từ"
            type="number"
            min={0}
            className="field h-9 w-28"
            aria-label="Giá từ"
          />
          <span className="text-muted">–</span>
          <input
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="đến"
            type="number"
            min={0}
            className="field h-9 w-28"
            aria-label="Giá đến"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted">Sắp xếp</span>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="field h-9 w-36" aria-label="Sắp xếp theo">
            <option value="name">Tên A–Z</option>
            <option value="price">Giá</option>
            <option value="available">Tồn thực tế</option>
            <option value="stock">Tồn kho</option>
          </select>
          <button
            type="button"
            className="btn-xs-line w-20"
            onClick={() => setSortDir((prev) => (prev === "asc" ? "desc" : "asc"))}
            aria-label="Đổi chiều sắp xếp"
          >
            {sortDir === "asc" ? "↑ Tăng" : "↓ Giảm"}
          </button>
        </div>
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            className="toggle toggle-sm toggle-primary"
            checked={includeHidden}
            onChange={(e) => setIncludeHidden(e.target.checked)}
          />
          Gồm sách đang ẩn
        </label>
      </div>

      {activeTab === "list" ? (
        <div className="mt-6">
          {selectedIds.size > 0 ? (
            <div className="sticky top-[104px] z-20 mb-3 flex flex-wrap items-center gap-2 rounded-lg bg-ink px-4 py-2.5 text-paper shadow-lg lg:top-4">
              <span className="mr-auto text-sm font-medium">Đã chọn {selectedIds.size} sách</span>
              <button className="h-8 rounded-md px-3 text-sm hover:bg-paper/15" onClick={openBulkModal}>
                Sửa hàng loạt
              </button>
              <button className="h-8 rounded-md px-3 text-sm hover:bg-paper/15" onClick={() => applyBulkAction("show")}>
                Hiện
              </button>
              <button className="h-8 rounded-md px-3 text-sm hover:bg-paper/15" onClick={() => applyBulkAction("hide")}>
                Ẩn
              </button>
              <button className="h-8 rounded-md bg-sale px-3 text-sm font-medium text-white hover:brightness-110" onClick={() => applyBulkAction("delete")}>
                Xóa
              </button>
              <button
                className="h-8 rounded-md px-2 text-sm opacity-70 hover:opacity-100"
                onClick={() => setSelectedIds(new Set())}
                aria-label="Bỏ chọn"
              >
                ✕
              </button>
            </div>
          ) : null}

          {loading ? (
            <LoadingRows rows={6} />
          ) : !seriesRows.length ? (
            <EmptyState
              title="Không có sách phù hợp"
              hint="Thử bỏ bớt bộ lọc, hoặc thêm sách mới."
              action={
                <button className="btn-xs-solid" onClick={startCreate}>
                  + Thêm sách
                </button>
              }
            />
          ) : (
            <div className="panel overflow-x-auto">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th className="w-10">
                      <input
                        type="checkbox"
                        className="checkbox checkbox-sm checkbox-primary"
                        checked={
                          visibleBookIds.length > 0 &&
                          visibleBookIds.every((id) => selectedIds.has(id))
                        }
                        onChange={() => toggleSelectAll(visibleBookIds)}
                        aria-label="Chọn tất cả"
                      />
                    </th>
                    <th>Sách</th>
                    <th className="!text-right">Giá</th>
                    <th>Tồn kho</th>
                    <th>Hiển thị</th>
                    <th className="!text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {seriesRows.map((row) => {
                    if (row.type !== "series") return bookRow(row.book);

                    const bookIds = row.books.map((b) => b.book._id);
                    const allSelected = bookIds.every((id) => selectedIds.has(id));
                    const expanded = expandedSeries.has(row.seriesKey);
                    const totals = row.books.reduce(
                      (acc, curr) => {
                        const meta = getStockMeta(curr.book);
                        acc.stock += meta.stock;
                        acc.reserved += meta.reserved;
                        acc.soldCount += meta.soldCount;
                        acc.threshold = Math.min(acc.threshold, meta.threshold);
                        return acc;
                      },
                      { stock: 0, reserved: 0, soldCount: 0, threshold: Number.MAX_SAFE_INTEGER },
                    );
                    const summaryMeta = getStockMeta({
                      stock: totals.stock,
                      reserved: totals.reserved,
                      lowStockThreshold:
                        totals.threshold === Number.MAX_SAFE_INTEGER ? 5 : totals.threshold,
                      soldCount: totals.soldCount,
                    });
                    const prices = row.books.map((b) => Number(b.book.price) || 0);
                    const minP = Math.min(...prices);
                    const maxP = Math.max(...prices);

                    return (
                      <Fragment key={row.seriesKey}>
                        <tr className="bg-surface/60">
                          <td>
                            <input
                              type="checkbox"
                              className="checkbox checkbox-sm checkbox-primary"
                              checked={allSelected}
                              onChange={() => toggleSelectGroup(bookIds)}
                              aria-label={`Chọn cả bộ ${row.seriesName}`}
                            />
                          </td>
                          <td>
                            <button
                              type="button"
                              className="flex min-w-[240px] items-center gap-3 text-left"
                              onClick={() => toggleSeries(row.seriesKey)}
                              aria-expanded={expanded}
                            >
                              <div className="relative h-12 w-9 shrink-0">
                                <img
                                  src={row.books[1]?.book.image || row.books[0].book.image}
                                  alt=""
                                  className="absolute left-1 top-0 h-11 w-8 rounded-sm object-cover opacity-60"
                                />
                                <img
                                  src={row.books[0].book.image}
                                  alt=""
                                  className="absolute -left-0.5 top-1 h-11 w-8 rounded-sm object-cover shadow"
                                />
                              </div>
                              <div>
                                <p className="font-semibold">{row.seriesName}</p>
                                <p className="text-xs text-muted">
                                  <span className={`mr-1 inline-block transition-transform ${expanded ? "rotate-90" : ""}`}>
                                    ›
                                  </span>
                                  Bộ {row.books.length} tập · {expanded ? "Thu gọn" : "Xem các tập"}
                                </p>
                              </div>
                            </button>
                          </td>
                          <td className="whitespace-nowrap text-right tabular-nums text-muted">
                            {minP === maxP ? formatVnd(minP) : `${formatVnd(minP)} – ${formatVnd(maxP)}`}
                          </td>
                          <td>{renderStock(summaryMeta)}</td>
                          <td />
                          <td />
                        </tr>
                        {expanded
                          ? row.books.map((entry) => bookRow(entry.book, entry.volume, true))
                          : null}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : null}

      {activeTab === "inventory" ? (
        <div className="mt-6">
          {loading ? (
            <LoadingRows rows={6} />
          ) : !books.length ? (
            <EmptyState title="Không có sách phù hợp" />
          ) : (
            <div className="panel overflow-x-auto">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Sách</th>
                    <th>Tồn kho</th>
                    <th>Nhập / xuất</th>
                    <th className="!text-right">Lịch sử</th>
                  </tr>
                </thead>
                <tbody>
                  {books.map((b) => {
                    const meta = getStockMeta(b);
                    const draft = inventoryDrafts[b._id] || {};
                    return (
                      <tr key={b._id}>
                        <td>
                          <div className="flex items-center gap-3">
                            <Thumb src={b.image} />
                            <p className="line-clamp-2 min-w-[180px] max-w-[260px] font-medium leading-snug">{b.name}</p>
                          </div>
                        </td>
                        <td>{renderStock(meta)}</td>
                        <td>
                          <div className="flex min-w-[300px] flex-wrap items-center gap-2">
                            <input
                              value={draft.qty || ""}
                              onChange={(e) => updateDraft(b._id, { qty: e.target.value })}
                              placeholder="SL"
                              type="number"
                              min={1}
                              className="field h-9 w-20"
                              aria-label={`Số lượng cho ${b.name}`}
                            />
                            <input
                              value={draft.note || ""}
                              onChange={(e) => updateDraft(b._id, { note: e.target.value })}
                              placeholder="Ghi chú"
                              className="field h-9 w-36 flex-1"
                              aria-label={`Ghi chú cho ${b.name}`}
                            />
                            <button type="button" className="btn-xs-solid" onClick={() => applyInventory(b._id, "in")}>
                              + Nhập
                            </button>
                            <button type="button" className="btn-xs-line" onClick={() => applyInventory(b._id, "out")}>
                              − Xuất
                            </button>
                          </div>
                        </td>
                        <td className="text-right">
                          <button
                            type="button"
                            className="link-draw text-sm text-accent"
                            onClick={() => loadInventoryLogs(b._id)}
                          >
                            Xem
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

      <Modal
        open={Boolean(selectedLogBookId)}
        onClose={() => setSelectedLogBookId(null)}
        title="Lịch sử kho"
        side="right"
      >
        {logBook ? (
          <div className="mb-5 flex items-center gap-3">
            <Thumb src={logBook.image} />
            <div>
              <p className="font-medium leading-snug">{logBook.name}</p>
              <p className="text-xs text-muted">Còn {getStockMeta(logBook).available} cuốn có thể bán</p>
            </div>
          </div>
        ) : null}
        {inventoryLogs.length ? (
          <ol className="relative space-y-4 border-l border-line pl-5">
            {inventoryLogs.map((log) => {
              const isIn = log.type === "in";
              return (
                <li key={log._id} className="relative">
                  <span
                    className={`absolute -left-[25px] top-1.5 h-2.5 w-2.5 rounded-full ring-4 ring-paper ${
                      isIn ? "bg-emerald-600" : "bg-amber-500"
                    }`}
                  />
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium tabular-nums">
                      {isIn ? "Nhập" : log.type === "out" ? "Xuất" : log.type} {isIn ? "+" : "−"}
                      {log.quantity}
                    </p>
                    <span className="text-xs text-muted">{formatDateTime(log.createdAt)}</span>
                  </div>
                  {log.note ? <p className="mt-0.5 text-sm text-muted">{log.note}</p> : null}
                </li>
              );
            })}
          </ol>
        ) : (
          <p className="text-sm text-muted">Chưa có lịch sử nhập/xuất.</p>
        )}
      </Modal>

      <Modal
        open={showFormModal}
        onClose={closeForm}
        title={editingId ? "Sửa sách" : "Thêm sách"}
        size="max-w-3xl"
        footer={
          <>
            <button type="button" className="btn-xs-line" onClick={closeForm}>
              Hủy
            </button>
            <button type="submit" form="book-form" className="btn-xs-solid">
              {editingId ? "Lưu thay đổi" : "Thêm sách"}
            </button>
          </>
        }
      >
        <form id="book-form" onSubmit={submit} className="space-y-7">
          <fieldset className="grid gap-4 md:grid-cols-2">
            <legend className="mb-3 font-display text-base font-medium">Thông tin cơ bản</legend>
            <div className="md:col-span-2">
              <label className="field-label" htmlFor="bf-name">Tên sách *</label>
              <input id="bf-name" value={form.name} onChange={setField("name")} className="field" required />
            </div>
            <div>
              <label className="field-label" htmlFor="bf-price">Giá (VND) *</label>
              <input id="bf-price" value={form.price} onChange={setField("price")} type="number" min={0} className="field" required />
            </div>
            <div>
              <label className="field-label" htmlFor="bf-cat">Nhóm sản phẩm</label>
              <div className="flex gap-2">
                {!showCustomCategory ? (
                  <>
                    <select id="bf-cat" value={form.category} onChange={setField("category")} className="field">
                      <option value="">Chọn nhóm</option>
                      {dynamicCategories.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                    <button type="button" className="btn-xs-line h-10 shrink-0" onClick={() => setShowCustomCategory(true)}>
                      + Mới
                    </button>
                  </>
                ) : (
                  <>
                    <input
                      id="bf-cat"
                      value={form.category}
                      onChange={setField("category")}
                      placeholder="Tên nhóm mới"
                      className="field"
                    />
                    <button
                      type="button"
                      className="btn-xs-line h-10 shrink-0"
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
            </div>
            <div>
              <label className="field-label" htmlFor="bf-age">Độ tuổi</label>
              <select id="bf-age" value={form.ageGroup} onChange={setField("ageGroup")} className="field">
                <option value="">Chọn độ tuổi</option>
                {ageOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <span className="field-label">Thể loại</span>
              <div className="flex flex-wrap gap-2" ref={genresDropdownRef}>
                {genreOptions.map((opt) => {
                  const on = form.genres.includes(opt);
                  return (
                    <button
                      key={opt}
                      type="button"
                      aria-pressed={on}
                      onClick={() =>
                        setForm((f) => ({
                          ...f,
                          genres: on ? f.genres.filter((g) => g !== opt) : [...f.genres, opt],
                        }))
                      }
                      className={`h-8 rounded-full border px-3 text-sm transition-colors ${
                        on
                          ? "border-accent bg-accent text-accent-ink"
                          : "border-line text-muted hover:border-ink/40 hover:text-ink"
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="field-label" htmlFor="bf-title">Mô tả</label>
              <textarea id="bf-title" value={form.title} onChange={setField("title")} rows={4} className="field" />
            </div>
          </fieldset>

          <fieldset className="grid gap-4 md:grid-cols-[96px_1fr]">
            <legend className="mb-3 font-display text-base font-medium">Hình ảnh</legend>
            <div className="hidden h-32 w-24 overflow-hidden rounded-sm bg-ink/10 md:block">
              {form.image ? <img src={form.image} alt="" className="h-full w-full object-cover" /> : null}
            </div>
            <div className="space-y-4">
              <div>
                <label className="field-label" htmlFor="bf-img">URL ảnh bìa *</label>
                <input id="bf-img" value={form.image} onChange={setField("image")} placeholder="https://…" className="field" required />
              </div>
              <div>
                <label className="field-label" htmlFor="bf-imgs">Ảnh chi tiết (phân cách bằng dấu phẩy)</label>
                <textarea id="bf-imgs" value={form.images} onChange={setField("images")} rows={2} className="field" />
              </div>
            </div>
          </fieldset>

          <fieldset className="grid grid-cols-2 gap-4">
            <legend className="mb-3 font-display text-base font-medium">Kho</legend>
            <div>
              <label className="field-label" htmlFor="bf-stock">Tồn kho</label>
              <input id="bf-stock" value={form.stock} onChange={setField("stock")} type="number" min={0} className="field" />
            </div>
            <div>
              <label className="field-label" htmlFor="bf-low">Cảnh báo khi còn ≤</label>
              <input id="bf-low" value={form.lowStockThreshold} onChange={setField("lowStockThreshold")} type="number" min={0} placeholder="5" className="field" />
            </div>
            <label className="col-span-2 flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="toggle toggle-sm toggle-primary"
                checked={form.isHidden}
                onChange={(e) => setForm((f) => ({ ...f, isHidden: e.target.checked }))}
              />
              Ẩn sách khỏi cửa hàng
            </label>
          </fieldset>

          <fieldset className="grid gap-4 md:grid-cols-2">
            <legend className="mb-3 font-display text-base font-medium">Chi tiết xuất bản</legend>
            {[
              ["author", "Tác giả"],
              ["translator", "Người dịch"],
              ["publisher", "Nhà xuất bản"],
              ["supplier", "Nhà cung cấp"],
            ].map(([key, label]) => (
              <div key={key}>
                <label className="field-label" htmlFor={`bf-${key}`}>{label}</label>
                <input id={`bf-${key}`} value={form[key]} onChange={setField(key)} className="field" />
              </div>
            ))}
            <div className="grid grid-cols-2 gap-4 md:col-span-2 md:grid-cols-4">
              {[
                ["publishYear", "Năm XB", "number"],
                ["pages", "Số trang", "number"],
                ["weightGr", "Trọng lượng (g)", "number"],
                ["packageSize", "Kích thước", "text"],
              ].map(([key, label, type]) => (
                <div key={key}>
                  <label className="field-label" htmlFor={`bf-${key}`}>{label}</label>
                  <input
                    id={`bf-${key}`}
                    value={form[key]}
                    onChange={setField(key)}
                    type={type}
                    min={type === "number" ? 0 : undefined}
                    className="field"
                  />
                </div>
              ))}
            </div>
          </fieldset>
        </form>
      </Modal>

      <Modal
        open={bulkModalOpen}
        onClose={() => setBulkModalOpen(false)}
        title={`Sửa ${selectedIds.size} sách`}
        size="max-w-md"
        footer={
          <>
            <button type="button" className="btn-xs-line" onClick={() => setBulkModalOpen(false)}>
              Hủy
            </button>
            <button type="button" className="btn-xs-solid" onClick={applyBulkUpdate}>
              Áp dụng
            </button>
          </>
        }
      >
        <p className="mb-4 text-sm text-muted">Chỉ những ô bạn điền mới được thay đổi.</p>
        <div className="grid grid-cols-2 gap-4">
          {[
            ["price", "Giá mới", "number"],
            ["stock", "Tồn kho mới", "number"],
            ["lowStockThreshold", "Cảnh báo khi còn ≤", "number"],
            ["category", "Nhóm sản phẩm", "text"],
          ].map(([key, label, type]) => (
            <div key={key}>
              <label className="field-label" htmlFor={`bulk-${key}`}>{label}</label>
              <input
                id={`bulk-${key}`}
                value={bulkForm[key]}
                onChange={(e) => setBulkForm((f) => ({ ...f, [key]: e.target.value }))}
                type={type}
                min={type === "number" ? 0 : undefined}
                className="field"
              />
            </div>
          ))}
          <div className="col-span-2">
            <label className="field-label" htmlFor="bulk-hidden">Hiển thị</label>
            <select
              id="bulk-hidden"
              value={bulkForm.isHidden}
              onChange={(e) => setBulkForm((f) => ({ ...f, isHidden: e.target.value }))}
              className="field"
            >
              <option value="">Không đổi</option>
              <option value="true">Ẩn</option>
              <option value="false">Hiện</option>
            </select>
          </div>
        </div>
      </Modal>
    </AdminLayout>
  );
}

export default BooksAdmin;
