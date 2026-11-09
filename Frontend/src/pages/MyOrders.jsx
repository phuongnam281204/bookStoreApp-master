import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";
import { useI18n } from "../context/I18nProvider";

const formatVnd = (value) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value || 0);

function MyOrders() {
  const { t, lang } = useI18n();
  const locale = lang === "vi" ? "vi-VN" : "en-US";
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
        err?.response?.data?.message || err?.message || t("orders.loadFailed");
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const statusLabel = (status) => {
    if (status === "paid") return t("orders.status.paid");
    if (status === "cancelled") return t("orders.status.cancelled");
    return t("orders.status.placed");
  };

  const paymentLabel = (status) => {
    if (status === "paid") return t("orders.payment.paid");
    if (status === "pending") return t("orders.payment.pending");
    if (status === "failed") return t("orders.payment.failed");
    return t("orders.payment.unpaid");
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
      toast.success(t("orders.cancelSuccess"));
      await load();
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        t("orders.cancelFailed");
      toast.error(message);
    } finally {
      setBusyId(null);
      setConfirmOrder(null);
    }
  };

  return (
    <>
      <Navbar />
      <main className="wrap min-h-screen pb-24 pt-28">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl font-medium md:text-5xl">{t("orders.title")}</h1>
            <p className="mt-2 text-muted">{t("orders.subtitle")}</p>
          </div>
          <button
            className="btn-line"
            onClick={load}
          >
            {t("orders.reload")}
          </button>
        </div>

        <div className="mt-10 border-t border-line">
          {loading ? (
            <p className="py-8 text-muted">{t("orders.loading")}</p>
          ) : !orders.length ? (
            <div className="py-16">
              <p className="text-muted">{t("orders.empty")}</p>
              <Link to="/course" className="btn-solid mt-6">
                Xem tất cả sách
              </Link>
            </div>
          ) : (
            <ul>
              {orders.map((order) => {
                const isCancelled = order.status === "cancelled";
                const isPaid = order.paymentStatus === "paid";
                const canCancel = !isCancelled && !isPaid;

                return (
                  <li key={order._id} className="border-b border-line py-8">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <div className="text-sm text-muted">
                          {t("orders.code")}:
                          <span className="ml-1 font-display text-2xl font-medium text-ink">
                            #{String(order._id).slice(-6)}
                          </span>
                        </div>
                        <div className="mt-1 text-sm text-muted">
                          {order.createdAt
                            ? new Date(order.createdAt).toLocaleString(locale)
                            : ""}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-lg font-semibold">
                          {formatVnd(order.total)}
                        </div>
                        <div className="mt-1 text-sm text-muted">
                          {order.paymentMethod} •{" "}
                          {paymentLabel(order.paymentStatus)}
                        </div>
                        <div
                          className={`mt-2 inline-flex items-center rounded-sm px-2 py-0.5 text-xs font-semibold ${
                            isCancelled ? "bg-line text-muted" : "bg-accent/10 text-accent"
                          }`}
                        >
                          {statusLabel(order.status)}
                        </div>
                      </div>
                    </div>

                    <details className="mt-4">
                      <summary className="min-h-[44px] cursor-pointer py-2 text-sm font-semibold text-accent">
                        {t("orders.details")}
                      </summary>
                      <div className="mt-3 grid gap-2 text-sm">
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
                      <div className="mt-3 text-sm text-muted">
                        {t("orders.address")}:{" "}
                        {order.shippingAddress?.addressLine || "-"}
                        {order.shippingAddress?.city
                          ? `, ${order.shippingAddress.city}`
                          : ""}
                      </div>
                    </details>

                    <div className="mt-4 flex flex-wrap gap-3">
                      <button
                        type="button"
                        className="link-draw min-h-[44px] text-sm font-semibold text-sale disabled:text-muted disabled:opacity-60"
                        onClick={() => openCancelModal(order)}
                        disabled={!canCancel || busyId === order._id}
                      >
                        {t("orders.cancel")}
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </main>
      <dialog id="cancel_order_modal" className="modal">
        <div className="modal-box">
          <h3 className="font-display text-2xl font-medium">{t("orders.cancelTitle")}</h3>
          <p className="mt-2 text-sm text-muted">
            {t("orders.cancelQuestion")}
          </p>
          {confirmOrder ? (
            <div className="mt-3 rounded-md border border-line bg-surface p-3 text-sm">
              <div>
                {t("orders.code")}:
                <span className="font-semibold">
                  #{String(confirmOrder._id).slice(-6)}
                </span>
              </div>
              <div className="mt-1">
                {t("checkout.total")}:
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
                className="btn-line"
                onClick={() => {
                  setConfirmOrder(null);
                  document.getElementById("cancel_order_modal")?.close();
                }}
              >
                {t("orders.back")}
              </button>
              <button
                type="button"
                className="btn-solid bg-sale"
                onClick={() => {
                  if (!confirmOrder?._id) return;
                  document.getElementById("cancel_order_modal")?.close();
                  cancelOrder(confirmOrder._id);
                }}
                disabled={busyId === confirmOrder?._id}
              >
                {t("orders.confirmCancel")}
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
