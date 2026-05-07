import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const formatVnd = (value) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value || 0);

const statusLabel = (status) => {
  if (status === "paid") return "Đã thanh toán";
  if (status === "cancelled") return "Đã hủy";
  return "Đã đặt";
};

const paymentLabel = (status) => {
  if (status === "paid") return "Đã thanh toán";
  if (status === "pending") return "Đang xử lý";
  if (status === "failed") return "Thất bại";
  return "Chưa thanh toán";
};

function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [confirmOrder, setConfirmOrder] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/order/my", { withCredentials: true });
      setOrders(res.data || []);
    } catch (err) {
      const message =
        err?.response?.data?.message || err?.message || "Không tải được";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCancelModal = (order) => {
    if (!order?._id) return;
    setConfirmOrder(order);
    const modal = document.getElementById("cancel_order_modal");
    if (modal && typeof modal.showModal === "function") modal.showModal();
  };

  const cancelOrder = async (orderId) => {
    if (!orderId) return;
    setBusyId(orderId);
    try {
      await axios.post(
        `/order/${orderId}/cancel`,
        {},
        { withCredentials: true },
      );
      toast.success("Đã hủy đơn");
      await load();
    } catch (err) {
      const message =
        err?.response?.data?.message || err?.message || "Hủy đơn thất bại";
      toast.error(message);
    } finally {
      setBusyId(null);
      setConfirmOrder(null);
    }
  };

  return (
    <>
      <Navbar />
      <div className="max-w-screen-2xl container mx-auto md:px-20 px-4 min-h-screen pt-28 pb-16">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Đơn hàng của tôi</h1>
            <p className="mt-1 text-sm opacity-70">
              Theo dõi trạng thái và hủy đơn chưa thanh toán.
            </p>
          </div>
          <button
            className="px-4 py-2 rounded-md border dark:border-slate-700"
            onClick={load}
          >
            Tải lại
          </button>
        </div>

        <div className="mt-6">
          {loading ? (
            <p>Loading...</p>
          ) : !orders.length ? (
            <div className="rounded-2xl border border-dashed p-8 text-center">
              Bạn chưa có đơn hàng nào.
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const isCancelled = order.status === "cancelled";
                const isPaid = order.paymentStatus === "paid";
                const canCancel = !isCancelled && !isPaid;

                return (
                  <div
                    key={order._id}
                    className="rounded-2xl border bg-white p-5 shadow-sm dark:bg-slate-900 dark:border-slate-700"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <div className="text-sm text-slate-500">
                          Mã đơn:{" "}
                          <span className="font-semibold">
                            #{String(order._id).slice(-6)}
                          </span>
                        </div>
                        <div className="mt-2 text-sm text-slate-500">
                          {order.createdAt
                            ? new Date(order.createdAt).toLocaleString("vi-VN")
                            : ""}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-lg font-semibold text-rose-600">
                          {formatVnd(order.total)}
                        </div>
                        <div className="mt-1 text-sm text-slate-500">
                          {order.paymentMethod} •{" "}
                          {paymentLabel(order.paymentStatus)}
                        </div>
                        <div className="mt-2 inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                          {statusLabel(order.status)}
                        </div>
                      </div>
                    </div>

                    <details className="mt-4">
                      <summary className="cursor-pointer text-sm font-semibold text-slate-600">
                        Xem chi tiết sản phẩm
                      </summary>
                      <div className="mt-3 grid gap-2 text-sm text-slate-600">
                        {order.items?.map((item) => (
                          <div
                            key={`${order._id}-${item.bookId}`}
                            className="flex justify-between"
                          >
                            <span>{item.name}</span>
                            <span>
                              {item.qty} x {formatVnd(item.price)}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 text-sm text-slate-500">
                        Địa chỉ: {order.shippingAddress?.addressLine || "-"}
                        {order.shippingAddress?.city
                          ? `, ${order.shippingAddress.city}`
                          : ""}
                      </div>
                    </details>

                    <div className="mt-4 flex flex-wrap gap-3">
                      <button
                        type="button"
                        className="px-3 py-2 rounded-md border border-rose-500 text-rose-600 disabled:opacity-50"
                        onClick={() => openCancelModal(order)}
                        disabled={!canCancel || busyId === order._id}
                      >
                        Hủy đơn
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <dialog id="cancel_order_modal" className="modal">
        <div className="modal-box">
          <h3 className="text-lg font-semibold">Xác nhận hủy đơn</h3>
          <p className="mt-2 text-sm text-slate-600">
            Bạn có chắc chắn muốn hủy đơn hàng này không?
          </p>
          {confirmOrder ? (
            <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              <div>
                Mã đơn:{" "}
                <span className="font-semibold">
                  #{String(confirmOrder._id).slice(-6)}
                </span>
              </div>
              <div className="mt-1">
                Tổng tiền:{" "}
                <span className="font-semibold">
                  {formatVnd(confirmOrder.total)}
                </span>
              </div>
            </div>
          ) : null}
          <div className="modal-action">
            <form method="dialog" className="flex gap-2">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => {
                  setConfirmOrder(null);
                  document.getElementById("cancel_order_modal")?.close();
                }}
              >
                Quay lại
              </button>
              <button
                type="button"
                className="btn bg-rose-600 text-white hover:bg-rose-700"
                onClick={() => {
                  if (!confirmOrder?._id) return;
                  document.getElementById("cancel_order_modal")?.close();
                  cancelOrder(confirmOrder._id);
                }}
                disabled={busyId === confirmOrder?._id}
              >
                Xác nhận hủy
              </button>
            </form>
          </div>
        </div>
      </dialog>
      <Footer />
    </>
  );
}

export default MyOrders;
