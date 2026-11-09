import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import toast from "react-hot-toast";
import { useCart } from "../context/CartProvider";
import axios from "axios";
import { useI18n } from "../context/I18nProvider";

function PaymentResult() {
  const { t } = useI18n();
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
          toast.error(t("payment.missingOrder"));
        } else {
          toast.error(t("payment.failedToast"));
        }
        return;
      }

      if (payment !== "success") {
        toast.error(t("payment.failedToast"));
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
          toast.success(t("payment.successTitle"));
          clear();
        } else {
          toast.error(t("payment.notVerified"));
        }
      } catch (err) {
        if (!mounted) return;
        toast.error(t("payment.verifyFailed"));
      } finally {
        if (mounted) setVerifying(false);
      }
    };

    verify();
    return () => {
      mounted = false;
    };
  }, [payment, orderId, clear]);

  const status =
    payment === "success"
      ? {
          title: t("payment.successTitle"),
          desc: t("payment.successDesc"),
          tone: "text-ink",
          badge: "bg-accent/10 text-accent",
        }
      : {
          title: t("payment.failedTitle"),
          desc: t("payment.failedDesc"),
          tone: "text-ink",
          badge: "bg-sale/10 text-sale",
        };

  return (
    <>
      <Navbar />
      <main className="wrap min-h-screen pb-24 pt-28">
        <div className="max-w-2xl py-12">
          <div
            className={`inline-flex items-center rounded-sm px-2 py-0.5 text-xs font-semibold ${status.badge}`}
          >
            {payment === "success"
              ? t("payment.badgeSuccess")
              : t("payment.badgeFailed")}
          </div>
          <h1 className={`mt-4 font-display text-4xl font-medium md:text-5xl ${status.tone}`}>
            {status.title}
          </h1>
          <p className="mt-3 text-lg text-muted">
            {verifying ? t("payment.verifying") : status.desc}
          </p>

          {orderId ? (
            <div className="mt-8 border-y border-line py-4 text-sm">
              <div>
                {t("payment.orderCode")}:
                <span className="ml-1 font-semibold">#{orderId.slice(-6)}</span>
              </div>
              <div className="mt-1 text-xs text-muted">{orderId}</div>
            </div>
          ) : null}

          {reason ? (
            <div className="mt-3 text-xs text-muted">
              {t("payment.reason")}: {reason}
            </div>
          ) : null}

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              to="/orders"
              className="btn-solid"
            >
              {t("payment.viewOrders")}
            </Link>
            {payment !== "success" ? (
              <Link
                to="/checkout"
                className="btn-line"
              >
                {t("payment.backToCheckout")}
              </Link>
            ) : null}
            <Link
              to="/"
              className="link-draw ml-2 inline-flex min-h-[44px] items-center text-sm font-semibold text-muted hover:text-ink"
            >
              {t("payment.backHome")}
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default PaymentResult;
