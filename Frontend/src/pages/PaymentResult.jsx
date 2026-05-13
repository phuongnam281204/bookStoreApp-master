import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import toast from "react-hot-toast";
import { useCart } from "../context/CartProvider";
import axios from "axios";

const getStatusConfig = (status) => {
  if (status === "success") {
    return {
      title: "Thanh toán thành công",
      desc: "Đơn hàng của bạn đã được ghi nhận. Cảm ơn bạn đã mua hàng!",
      tone: "text-emerald-600",
      badge: "bg-emerald-100 text-emerald-700",
    };
  }

  return {
    title: "Thanh toán thất bại",
    desc: "Giao dịch không thành công hoặc đã bị hủy. Bạn có thể thử lại.",
    tone: "text-rose-600",
    badge: "bg-rose-100 text-rose-700",
  };
};

function PaymentResult() {
  const location = useLocation();
  const { clear } = useCart();
  const [verifying, setVerifying] = useState(false);
  const lastHandledRef = useRef("");

  const { payment, orderId, reason } = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return {
      payment: params.get("payment") || "failed",
      orderId: params.get("orderId") || "",
      reason: params.get("reason") || "",
    };
  }, [location.search]);

  useEffect(() => {
    const key = `${payment}:${orderId}`;
    if (lastHandledRef.current === key) return;
    lastHandledRef.current = key;

    let mounted = true;
    const verify = async () => {
      if (!orderId) {
        if (payment === "success") {
          toast.error("Thiếu mã đơn hàng để xác nhận thanh toán");
        } else {
          toast.error("Thanh toán thất bại");
        }
        return;
      }

      if (payment !== "success") {
        toast.error("Thanh toán thất bại");
        return;
      }

      setVerifying(true);
      try {
        const res = await axios.get(`/order/detail/${orderId}`, {
          withCredentials: true,
        });
        const status = res?.data?.order?.paymentStatus;
        if (!mounted) return;
        if (status === "paid") {
          toast.success("Thanh toán thành công");
          clear();
        } else {
          toast.error("Thanh toán chưa được xác nhận");
        }
      } catch (err) {
        if (!mounted) return;
        toast.error("Không thể xác nhận thanh toán");
      } finally {
        if (mounted) setVerifying(false);
      }
    };

    verify();
    return () => {
      mounted = false;
    };
  }, [payment, orderId, clear]);

  const status = getStatusConfig(payment);

  return (
    <>
      <Navbar />
      <div className="max-w-screen-2xl container mx-auto md:px-20 px-4 min-h-screen pt-28 pb-16">
        <div className="mx-auto max-w-2xl rounded-2xl border bg-white p-6 shadow-sm">
          <div
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${status.badge}`}
          >
            {payment === "success" ? "SUCCESS" : "FAILED"}
          </div>
          <h1 className={`mt-4 text-2xl font-bold ${status.tone}`}>
            {status.title}
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            {verifying ? "Đang xác nhận giao dịch..." : status.desc}
          </p>

          {orderId ? (
            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <div>
                Mã đơn:{" "}
                <span className="font-semibold">#{orderId.slice(-6)}</span>
              </div>
              <div className="mt-1 text-xs text-slate-500">{orderId}</div>
            </div>
          ) : null}

          {reason ? (
            <div className="mt-3 text-xs text-slate-500">Mã lỗi: {reason}</div>
          ) : null}

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/orders"
              className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
            >
              Xem đơn hàng
            </Link>
            {payment !== "success" ? (
              <Link
                to="/checkout"
                className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold"
              >
                Quay lại thanh toán
              </Link>
            ) : null}
            <Link
              to="/"
              className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold"
            >
              Về trang chủ
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default PaymentResult;
