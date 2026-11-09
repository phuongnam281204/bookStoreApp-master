import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import AdminLayout, {
  EmptyState,
  LoadingRows,
  PageHeader,
  Pill,
  errorMessage,
  formatDateTime,
  formatVnd,
  orderStatusMeta,
  paymentStatusMeta,
} from "./AdminLayout";

const DAYS = 14;

const dayKey = (date) => {
  const d = new Date(date);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
};

const compactVnd = (value) => {
  const n = Number(value) || 0;
  if (n >= 1e9) return `${(n / 1e9).toLocaleString("vi-VN", { maximumFractionDigits: 1 })} tỷ`;
  if (n >= 1e6) return `${(n / 1e6).toLocaleString("vi-VN", { maximumFractionDigits: 1 })} tr`;
  if (n >= 1e3) return `${Math.round(n / 1e3)}k`;
  return String(n);
};

function StatTile({ label, value, hint, to }) {
  const body = (
    <>
      <p className="text-xs font-medium uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-3 font-display text-3xl font-medium tabular-nums leading-none">{value}</p>
      {hint ? <p className="mt-2 text-xs text-muted">{hint}</p> : null}
    </>
  );
  const cls = "panel block p-5 transition-colors";
  return to ? (
    <Link to={to} className={`${cls} hover:border-accent/50`}>
      {body}
    </Link>
  ) : (
    <div className={cls}>{body}</div>
  );
}

/** One series (paid revenue per day): bars in the accent, no legend, hover tooltip. */
function RevenueChart({ data }) {
  const [hover, setHover] = useState(null);
  const peak = Math.max(...data.map((d) => d.total), 1);
  const step = 10 ** Math.floor(Math.log10(peak));
  const max = (Math.ceil((peak / step) * 2) / 2) * step;
  const ticks = [max, max / 2, 0];
  const total = data.reduce((s, d) => s + d.total, 0);

  return (
    <div className="panel p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h2 className="text-lg font-medium">Doanh thu {DAYS} ngày</h2>
          <p className="text-xs text-muted">Chỉ tính đơn đã thanh toán</p>
        </div>
        <p className="font-display text-2xl tabular-nums">{formatVnd(total)}</p>
      </div>

      <div className="relative mt-6 flex h-56 gap-3">
        <div className="flex w-10 flex-col justify-between pb-6 text-right text-[11px] tabular-nums text-muted">
          {ticks.map((t, i) => (
            <span key={i}>{compactVnd(t)}</span>
          ))}
        </div>
        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-x-0 top-0 bottom-6 flex flex-col justify-between">
            {ticks.map((_, i) => (
              <div key={i} className="border-t border-line/70" />
            ))}
          </div>
          <div className="absolute inset-x-0 top-0 bottom-6 flex items-end gap-[2px]">
            {data.map((d, i) => {
              const pct = (d.total / max) * 100;
              return (
                <div
                  key={d.key}
                  className="group relative flex h-full flex-1 items-end"
                  onMouseEnter={() => setHover(i)}
                  onMouseLeave={() => setHover(null)}
                  onFocus={() => setHover(i)}
                  onBlur={() => setHover(null)}
                  tabIndex={0}
                  aria-label={`${d.label}: ${formatVnd(d.total)}, ${d.count} đơn`}
                >
                  <div
                    className={`mx-auto w-full max-w-[36px] rounded-t-[4px] transition-colors ${
                      hover === i ? "bg-accent" : "bg-accent/75"
                    }`}
                    style={{ height: d.total > 0 ? `max(${pct}%, 3px)` : "1px" }}
                  />
                  {hover === i ? (
                    <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 w-max -translate-x-1/2 rounded-md border border-line bg-paper px-3 py-2 text-xs shadow-lg">
                      <p className="font-semibold">{d.label}</p>
                      <p className="tabular-nums">{formatVnd(d.total)}</p>
                      <p className="text-muted">{d.count} đơn</p>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
          <div className="absolute inset-x-0 bottom-0 flex gap-[2px] text-[11px] text-muted">
            {data.map((d, i) => (
              <span key={d.key} className="flex-1 text-center tabular-nums">
                {i % 2 === (DAYS - 1) % 2 ? d.short : ""}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminDashboard() {
  const [summary, setSummary] = useState(null);
  const [orders, setOrders] = useState([]);
  const [stockAlerts, setStockAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const [s, o, b] = await Promise.allSettled([
      axios.get("/order/admin/summary", { withCredentials: true }),
      axios.get("/order", { withCredentials: true }),
      axios.get("/book", {
        params: { sortBy: "available", sortDir: "asc", includeHidden: "true" },
        withCredentials: true,
      }),
    ]);
    if (s.status === "fulfilled") setSummary(s.value.data || null);
    else toast.error(errorMessage(s.reason, "Không tải được số liệu"));
    if (o.status === "fulfilled") setOrders(o.value.data || []);
    if (b.status === "fulfilled") {
      const alerts = (b.value.data || [])
        .map((book) => {
          const available = Math.max(
            0,
            Number(book.stock ?? 0) - Number(book.reserved ?? 0),
          );
          const threshold = Number(book.lowStockThreshold ?? 5);
          return { book, available, isOut: available <= 0, isLow: available <= threshold };
        })
        .filter((x) => x.isLow)
        .slice(0, 6);
      setStockAlerts(alerts);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const revenueSeries = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const days = Array.from({ length: DAYS }).map((_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - (DAYS - 1 - i));
      return {
        key: dayKey(d),
        label: d.toLocaleDateString("vi-VN", { weekday: "short", day: "2-digit", month: "2-digit" }),
        short: `${d.getDate()}/${d.getMonth() + 1}`,
        total: 0,
        count: 0,
      };
    });
    const index = new Map(days.map((d, i) => [d.key, i]));
    for (const order of orders) {
      if (order.paymentStatus !== "paid" || !order.createdAt) continue;
      const i = index.get(dayKey(order.createdAt));
      if (i === undefined) continue;
      days[i].total += Number(order.total) || 0;
      days[i].count += 1;
    }
    return days;
  }, [orders]);

  const pendingCount = useMemo(
    () =>
      orders.filter((o) => o.status !== "cancelled" && o.paymentStatus !== "paid").length,
    [orders],
  );

  const today = new Date().toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <AdminLayout>
      <PageHeader
        title="Tổng quan"
        description={today.charAt(0).toUpperCase() + today.slice(1)}
        actions={
          <button type="button" className="btn-xs-line" onClick={load} disabled={loading}>
            Tải lại
          </button>
        }
      />

      {loading && !summary ? (
        <div className="mt-8">
          <LoadingRows rows={6} />
        </div>
      ) : (
        <>
          <section className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4" aria-label="Chỉ số chính">
            <StatTile
              label="Doanh thu 7 ngày"
              value={compactVnd(summary?.revenue7d)}
              hint={formatVnd(summary?.revenue7d)}
            />
            <StatTile
              label="Đơn chờ thanh toán"
              value={pendingCount}
              hint={`Trên tổng ${orders.length} đơn`}
              to="/admin/orders"
            />
            <StatTile label="Đầu sách" value={summary?.totalBooks ?? "–"} to="/admin/books" />
            <StatTile
              label="Sắp hết / hết hàng"
              value={summary?.lowStockCount ?? "–"}
              hint="Còn ≤ 5 cuốn"
              to="/admin/books"
            />
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
            <RevenueChart data={revenueSeries} />

            <div className="panel flex flex-col p-5">
              <div className="flex items-baseline justify-between">
                <h2 className="text-lg font-medium">Cần nhập thêm</h2>
                <Link to="/admin/books" className="link-draw text-xs text-accent">
                  Xem kho
                </Link>
              </div>
              {stockAlerts.length ? (
                <ul className="mt-4 divide-y divide-line/70">
                  {stockAlerts.map(({ book, available, isOut }) => (
                    <li key={book._id} className="flex items-center gap-3 py-2.5">
                      {book.image ? (
                        <img
                          src={book.image}
                          alt=""
                          className="h-11 w-8 shrink-0 rounded-sm object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="h-11 w-8 shrink-0 rounded-sm bg-ink/10" />
                      )}
                      <p className="min-w-0 flex-1 truncate text-sm">{book.name}</p>
                      <Pill tone={isOut ? "bad" : "warn"}>
                        {isOut ? "Hết" : `Còn ${available}`}
                      </Pill>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 text-sm text-muted">Kho đang ổn, chưa có sách nào sắp hết.</p>
              )}
            </div>
          </section>

          <section className="panel mt-6 overflow-hidden">
            <div className="flex items-baseline justify-between px-5 pt-5">
              <h2 className="text-lg font-medium">Đơn hàng gần nhất</h2>
              <Link to="/admin/orders" className="link-draw text-xs text-accent">
                Tất cả đơn
              </Link>
            </div>
            {summary?.recentOrders?.length ? (
              <div className="mt-3 overflow-x-auto">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Mã đơn</th>
                      <th>Khách hàng</th>
                      <th>Thời gian</th>
                      <th>Trạng thái</th>
                      <th>Thanh toán</th>
                      <th className="!text-right">Tổng</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.recentOrders.map((order) => {
                      const st = orderStatusMeta(order.status);
                      const pay = paymentStatusMeta(order.paymentStatus);
                      return (
                        <tr key={order._id}>
                          <td className="font-mono text-xs text-muted">
                            #{String(order._id).slice(-6).toUpperCase()}
                          </td>
                          <td className="whitespace-nowrap font-medium">
                            {order.userId?.fullname || order.userId?.email || "Khách"}
                          </td>
                          <td className="whitespace-nowrap text-muted">
                            {formatDateTime(order.createdAt)}
                          </td>
                          <td>
                            <Pill tone={st.tone}>{st.label}</Pill>
                          </td>
                          <td>
                            <Pill tone={pay.tone}>{pay.label}</Pill>
                          </td>
                          <td className="whitespace-nowrap text-right font-medium tabular-nums">
                            {formatVnd(order.total)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-5">
                <EmptyState title="Chưa có đơn hàng" />
              </div>
            )}
          </section>
        </>
      )}
    </AdminLayout>
  );
}

export default AdminDashboard;
