import { useEffect, useMemo, useState } from "react";
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

const filters = [
  { id: "all", label: "Tất cả" },
  { id: "placed", label: "Đã đặt" },
  { id: "paid", label: "Đã thanh toán" },
  { id: "cancelled", label: "Đã hủy" },
];

function OrdersAdmin() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [openId, setOpenId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/order", { withCredentials: true });
      setOrders(res.data || []);
    } catch (err) {
      toast.error(errorMessage(err, "Không tải được"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const counts = useMemo(() => {
    const c = { all: orders.length, placed: 0, paid: 0, cancelled: 0 };
    for (const o of orders) if (c[o.status] !== undefined) c[o.status] += 1;
    return c;
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return orders.filter((order) => {
      if (filter !== "all" && order.status !== filter) return false;
      if (!keyword) return true;

      const name = String(
        order.userId?.fullname || order.shippingAddress?.fullName || "",
      ).toLowerCase();
      const email = String(
        order.userId?.email || order.shippingAddress?.email || "",
      ).toLowerCase();
      const id = String(order._id || "").toLowerCase();
      return name.includes(keyword) || email.includes(keyword) || id.includes(keyword);
    });
  }, [orders, filter, search]);

  const markPaid = async (orderId) => {
    if (!orderId) return;
    setBusyId(orderId);
    try {
      await axios.patch(
        `/order/${orderId}/status`,
        { paymentStatus: "paid" },
        { withCredentials: true },
      );
      toast.success("Đã cập nhật thanh toán");
      await load();
    } catch (err) {
      toast.error(errorMessage(err, "Cập nhật thất bại"));
    } finally {
      setBusyId(null);
    }
  };

  const cancelOrder = async (orderId) => {
    if (!orderId) return;
    if (!confirm("Hủy đơn hàng này?")) return;
    setBusyId(orderId);
    try {
      await axios.post(`/order/${orderId}/cancel`, {}, { withCredentials: true });
      toast.success("Đã hủy đơn");
      await load();
    } catch (err) {
      toast.error(errorMessage(err, "Hủy đơn thất bại"));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <AdminLayout>
      <PageHeader
        title="Đơn hàng"
        description="Theo dõi đơn và xác nhận thanh toán."
        actions={
          <button className="btn-xs-line" onClick={load} disabled={loading}>
            Tải lại
          </button>
        }
      />

      <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="hide-scrollbar flex gap-1 overflow-x-auto" role="tablist">
          {filters.map((f) => (
            <button
              key={f.id}
              type="button"
              role="tab"
              aria-selected={filter === f.id}
              onClick={() => setFilter(f.id)}
              className={`flex h-9 shrink-0 items-center gap-2 rounded-md px-3.5 text-sm transition-colors ${
                filter === f.id
                  ? "bg-ink text-paper"
                  : "text-muted hover:bg-ink/5 hover:text-ink"
              }`}
            >
              {f.label}
              <span
                className={`rounded px-1.5 text-xs tabular-nums ${
                  filter === f.id ? "bg-paper/20" : "bg-ink/[0.07]"
                }`}
              >
                {counts[f.id]}
              </span>
            </button>
          ))}
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm theo tên, email, mã đơn"
          className="field lg:max-w-xs"
          aria-label="Tìm đơn hàng"
        />
      </div>

      <div className="mt-6">
        {loading ? (
          <LoadingRows />
        ) : !filteredOrders.length ? (
          <EmptyState title="Không có đơn hàng" hint="Thử đổi bộ lọc hoặc từ khóa." />
        ) : (
          <div className="panel overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Mã đơn</th>
                  <th>Khách hàng</th>
                  <th>Thời gian</th>
                  <th>Trạng thái</th>
                  <th>Thanh toán</th>
                  <th className="!text-right">Tổng</th>
                  <th className="!text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => {
                  const isCancelled = order.status === "cancelled";
                  const isPaid = order.paymentStatus === "paid";
                  const canAct = !isPaid && !isCancelled;
                  const busy = busyId === order._id;
                  const isOpen = openId === order._id;
                  const st = orderStatusMeta(order.status);
                  const pay = paymentStatusMeta(order.paymentStatus);
                  const customerName =
                    order.userId?.fullname || order.shippingAddress?.fullName || "Khách hàng";
                  const customerEmail =
                    order.userId?.email || order.shippingAddress?.email || "";

                  return [
                    <tr key={order._id} className={isOpen ? "bg-ink/[0.03]" : ""}>
                      <td>
                        <button
                          type="button"
                          onClick={() => setOpenId(isOpen ? null : order._id)}
                          aria-expanded={isOpen}
                          className="flex items-center gap-2 font-mono text-xs text-muted hover:text-ink"
                        >
                          <span
                            className={`inline-block transition-transform ${isOpen ? "rotate-90" : ""}`}
                            aria-hidden="true"
                          >
                            ›
                          </span>
                          #{String(order._id).slice(-6).toUpperCase()}
                        </button>
                      </td>
                      <td>
                        <p className="font-medium">{customerName}</p>
                        {customerEmail ? (
                          <p className="text-xs text-muted">{customerEmail}</p>
                        ) : null}
                      </td>
                      <td className="whitespace-nowrap text-muted">
                        {formatDateTime(order.createdAt)}
                      </td>
                      <td>
                        <Pill tone={st.tone}>{st.label}</Pill>
                      </td>
                      <td>
                        <div className="flex flex-col items-start gap-1">
                          <Pill tone={pay.tone}>{pay.label}</Pill>
                          <span className="text-[11px] uppercase tracking-wide text-muted">
                            {order.paymentMethod}
                          </span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap text-right font-medium tabular-nums">
                        {formatVnd(order.total)}
                      </td>
                      <td>
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            className="btn-xs-solid"
                            onClick={() => markPaid(order._id)}
                            disabled={!canAct || busy}
                            title="Xác nhận đã thanh toán"
                          >
                            Đã thu tiền
                          </button>
                          <button
                            type="button"
                            className="btn-xs-danger"
                            onClick={() => cancelOrder(order._id)}
                            disabled={!canAct || busy}
                          >
                            Hủy
                          </button>
                        </div>
                      </td>
                    </tr>,
                    isOpen ? (
                      <tr key={`${order._id}-detail`} className="bg-ink/[0.03] hover:bg-ink/[0.03]">
                        <td colSpan={7} className="!pt-0">
                          <div className="grid gap-6 rounded-md border border-line bg-paper p-4 md:grid-cols-[1fr_260px]">
                            <div>
                              <p className="field-label">Sản phẩm</p>
                              <ul className="divide-y divide-line/70">
                                {order.items?.map((item) => (
                                  <li
                                    key={`${order._id}-${item.bookId}`}
                                    className="flex justify-between gap-4 py-1.5"
                                  >
                                    <span>{item.name}</span>
                                    <span className="whitespace-nowrap tabular-nums text-muted">
                                      {item.qty} × {formatVnd(item.price)}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <p className="field-label">Giao tới</p>
                              <p>{order.shippingAddress?.fullName || customerName}</p>
                              {order.shippingAddress?.phone ? (
                                <p className="text-muted">{order.shippingAddress.phone}</p>
                              ) : null}
                              <p className="text-muted">
                                {order.shippingAddress?.addressLine || "—"}
                                {order.shippingAddress?.city
                                  ? `, ${order.shippingAddress.city}`
                                  : ""}
                              </p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ) : null,
                  ];
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export default OrdersAdmin;
