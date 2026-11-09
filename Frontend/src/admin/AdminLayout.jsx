import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Link, NavLink } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthProvider";
import { useCart } from "../context/CartProvider";

export const formatVnd = (value) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

export const formatDateTime = (value) =>
  value
    ? new Date(value).toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

export const errorMessage = (err, fallback) =>
  err?.response?.data?.message || err?.message || fallback;

const icons = {
  dashboard: "M4 13h6V4H4v9Zm0 7h6v-5H4v5Zm10 0h6v-9h-6v9Zm0-16v5h6V4h-6Z",
  books:
    "M5 4.5A2.5 2.5 0 0 1 7.5 2H19v16H7.5a1.5 1.5 0 0 0 0 3H19v1H7.5A2.5 2.5 0 0 1 5 19.5v-15ZM8 6v2h8V6H8Z",
  orders:
    "M7 4V2h10v2h3v18H4V4h3Zm0 2H6v14h12V6h-1v2H7V6Zm2-2v2h6V4H9Zm-1 7h8v2H8v-2Zm0 4h5v2H8v-2Z",
  users:
    "M9 11a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm-7 9a7 7 0 0 1 14 0v1H2v-1Zm15.5-9a3.5 3.5 0 1 0-1-6.85 6 6 0 0 1 0 6.7c.32.1.65.15 1 .15ZM18 20h4v-1a6 6 0 0 0-4.6-5.84A8.97 8.97 0 0 1 18 18.5V20Z",
  vouchers:
    "M3 5h18v5a2 2 0 0 0 0 4v5H3v-5a2 2 0 0 0 0-4V5Zm6.5 3a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Zm5 5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3ZM15.6 7.6l-7.2 8.8 1.2 1 7.2-8.8-1.2-1Z",
};

const navItems = [
  { to: "/admin", label: "Tổng quan", icon: "dashboard", end: true },
  { to: "/admin/books", label: "Sách & kho", icon: "books" },
  { to: "/admin/orders", label: "Đơn hàng", icon: "orders" },
  { to: "/admin/users", label: "Người dùng", icon: "users" },
  { to: "/admin/vouchers", label: "Mã giảm giá", icon: "vouchers" },
];

export function Icon({ name, className = "h-[18px] w-[18px]" }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d={icons[name]} />
    </svg>
  );
}

function useTheme() {
  const [theme, setTheme] = useState(() =>
    localStorage.getItem("theme") === "dark" ? "dark" : "light",
  );
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = theme;
    root.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);
  return [theme, () => setTheme((t) => (t === "dark" ? "light" : "dark"))];
}

/** Tones are status colours only: good / warn / bad, plus a neutral. */
export function Pill({ tone = "neutral", children }) {
  const tones = {
    neutral: "bg-ink/[0.06] text-muted",
    good: "bg-emerald-600/10 text-emerald-700 dark:text-emerald-400",
    warn: "bg-amber-500/15 text-amber-800 dark:text-amber-300",
    bad: "bg-sale/10 text-sale",
    accent: "bg-accent/10 text-accent",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ${tones[tone]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
      {children}
    </span>
  );
}

export function EmptyState({ title, hint, action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-line px-6 py-14 text-center">
      <p className="font-display text-lg">{title}</p>
      {hint ? <p className="mt-1 max-w-sm text-sm text-muted">{hint}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export function LoadingRows({ rows = 5 }) {
  return (
    <div className="space-y-2" aria-busy="true" aria-label="Đang tải">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-12 animate-pulse rounded-md bg-ink/[0.05]" />
      ))}
    </div>
  );
}

/** Centered dialog (or a right-hand drawer with side="right"); Esc and the backdrop close it. */
export function Modal({ open, onClose, title, children, footer, size = "max-w-2xl", side }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;
  const drawer = side === "right";
  return createPortal(
    <div
      className={`fixed inset-0 z-[9999] flex bg-black/40 ${
        drawer ? "justify-end" : "items-end justify-center sm:items-center sm:p-4"
      }`}
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`flex w-full flex-col border-line bg-paper text-ink shadow-2xl ${
          drawer
            ? "h-full max-w-md border-l"
            : `max-h-[92vh] rounded-t-xl border sm:rounded-xl ${size}`
        }`}
      >
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <h2 className="text-xl font-medium">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted hover:bg-ink/5 hover:text-ink"
            aria-label="Đóng"
          >
            ✕
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer ? (
          <div className="flex flex-wrap justify-end gap-2 border-t border-line px-6 py-4">
            {footer}
          </div>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}

export function PageHeader({ title, description, actions }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6">
      <div>
        <h1 className="font-display text-3xl font-medium leading-tight">{title}</h1>
        {description ? <p className="mt-1.5 text-sm text-muted">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export const orderStatusMeta = (status) => {
  if (status === "paid") return { label: "Đã thanh toán", tone: "good" };
  if (status === "cancelled") return { label: "Đã hủy", tone: "bad" };
  return { label: "Đã đặt", tone: "neutral" };
};

export const paymentStatusMeta = (status) => {
  if (status === "paid") return { label: "Đã thanh toán", tone: "good" };
  if (status === "pending") return { label: "Đang xử lý", tone: "warn" };
  if (status === "failed") return { label: "Thất bại", tone: "bad" };
  return { label: "Chưa thanh toán", tone: "neutral" };
};

function AdminLayout({ children }) {
  const [authUser, setAuthUser] = useAuth();
  const { clear } = useCart();
  const [theme, toggleTheme] = useTheme();

  const logout = async () => {
    try {
      await axios.post("/user/logout", {}, { withCredentials: true });
    } catch {
      // ignore
    }
    setAuthUser(undefined);
    localStorage.removeItem("Users");
    clear();
    toast.success("Đã đăng xuất");
  };

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
      isActive
        ? "bg-accent/10 font-semibold text-accent"
        : "text-muted hover:bg-ink/5 hover:text-ink"
    }`;

  const name = authUser?.fullname || authUser?.email || "Admin";

  return (
    <div className="min-h-screen bg-paper text-ink lg:grid lg:grid-cols-[248px_1fr]">
      {/* Sidebar (desktop) */}
      <aside className="sticky top-0 hidden h-screen flex-col border-r border-line bg-surface/50 lg:flex">
        <div className="px-6 pb-6 pt-7">
          <Link to="/" className="font-display text-xl font-medium">
            Nhà sách
          </Link>
          <p className="mt-0.5 text-xs uppercase tracking-[0.14em] text-muted">Quản trị</p>
        </div>
        <nav className="flex-1 space-y-1 px-3" aria-label="Quản trị">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={linkClass}>
              <Icon name={item.icon} />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="space-y-1 border-t border-line p-3">
          <Link
            to="/"
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted hover:bg-ink/5 hover:text-ink"
          >
            <span aria-hidden="true">←</span> Về cửa hàng
          </Link>
          <button
            type="button"
            onClick={toggleTheme}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-muted hover:bg-ink/5 hover:text-ink"
            aria-pressed={theme === "dark"}
          >
            <span aria-hidden="true">{theme === "dark" ? "☀" : "☾"}</span>
            {theme === "dark" ? "Giao diện sáng" : "Giao diện tối"}
          </button>
          <div className="mt-2 flex items-center gap-3 rounded-md px-3 py-2">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-semibold text-accent-ink">
              {name.charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{name}</p>
              <button
                type="button"
                onClick={logout}
                className="text-xs text-muted hover:text-sale"
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Top bar (phone & tablet) */}
      <header className="sticky top-0 z-30 border-b border-line bg-paper/95 backdrop-blur lg:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <Link to="/" className="font-display text-lg font-medium">
            Nhà sách <span className="text-sm text-muted">· Quản trị</span>
          </Link>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={toggleTheme}
              className="flex h-9 w-9 items-center justify-center rounded-md text-muted hover:bg-ink/5"
              aria-label="Đổi giao diện sáng/tối"
            >
              {theme === "dark" ? "☀" : "☾"}
            </button>
            <button type="button" onClick={logout} className="btn-xs-line">
              Đăng xuất
            </button>
          </div>
        </div>
        <nav
          className="hide-scrollbar flex gap-1 overflow-x-auto px-3 pb-2"
          aria-label="Quản trị"
        >
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex shrink-0 items-center gap-2 rounded-md px-3 py-1.5 text-sm ${
                  isActive ? "bg-accent/10 font-semibold text-accent" : "text-muted"
                }`
              }
            >
              <Icon name={item.icon} className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="min-w-0 px-4 pb-16 pt-6 sm:px-8 lg:px-10 lg:pt-10">
        <div className="mx-auto max-w-[1200px]">{children}</div>
      </main>
    </div>
  );
}

export default AdminLayout;
