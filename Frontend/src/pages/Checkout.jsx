import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthProvider";
import { useCart } from "../context/CartProvider";
import { useI18n } from "../context/I18nProvider";

const formatVnd = (value) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value || 0);

function Checkout() {
  const { t, lang } = useI18n();
  const locale = lang === "vi" ? "vi-VN" : "en-US";
  const { items, clear, totals } = useCart();
  const [authUser] = useAuth();
  const [payment, setPayment] = useState("momo");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [addressLine, setAddressLine] = useState("");
  const [note, setNote] = useState("");
  const [voucherCode, setVoucherCode] = useState("");
  const [voucherInfo, setVoucherInfo] = useState(null);
  const [voucherError, setVoucherError] = useState("");
  const [invoiceRequested, setInvoiceRequested] = useState(false);
  const [cities, setCities] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [cityCode, setCityCode] = useState("");
  const [districtCode, setDistrictCode] = useState("");
  const [wardCode, setWardCode] = useState("");

  useEffect(() => {
    let isMounted = true;
    const loadCities = async () => {
      try {
        const res = await fetch("https://provinces.open-api.vn/api/?depth=1");
        const data = await res.json();
        if (isMounted) setCities(Array.isArray(data) ? data : []);
      } catch {
        if (isMounted) setCities([]);
      }
    };
    loadCities();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!cityCode) {
      setDistricts([]);
      setDistrictCode("");
      setWards([]);
      setWardCode("");
      return;
    }

    let isMounted = true;
    const loadDistricts = async () => {
      try {
        const res = await fetch(
          `https://provinces.open-api.vn/api/p/${cityCode}?depth=2`,
        );
        const data = await res.json();
        if (isMounted) {
          setDistricts(Array.isArray(data?.districts) ? data.districts : []);
          setDistrictCode("");
          setWards([]);
          setWardCode("");
        }
      } catch {
        if (isMounted) {
          setDistricts([]);
          setDistrictCode("");
          setWards([]);
          setWardCode("");
        }
      }
    };
    loadDistricts();
    return () => {
      isMounted = false;
    };
  }, [cityCode]);

  useEffect(() => {
    if (!districtCode) {
      setWards([]);
      setWardCode("");
      return;
    }

    let isMounted = true;
    const loadWards = async () => {
      try {
        const res = await fetch(
          `https://provinces.open-api.vn/api/d/${districtCode}?depth=2`,
        );
        const data = await res.json();
        if (isMounted) {
          setWards(Array.isArray(data?.wards) ? data.wards : []);
          setWardCode("");
        }
      } catch {
        if (isMounted) {
          setWards([]);
          setWardCode("");
        }
      }
    };
    loadWards();
    return () => {
      isMounted = false;
    };
  }, [districtCode]);

  useEffect(() => {
    if (!voucherInfo) return;
    const current = voucherCode.trim().toUpperCase();
    if (!current || current !== String(voucherInfo.code || "").toUpperCase()) {
      setVoucherInfo(null);
      setVoucherError("");
    }
  }, [voucherCode, voucherInfo]);

  const applyVoucher = async () => {
    const code = voucherCode.trim().toUpperCase();
    if (!code) {
      setVoucherError(t("checkout.voucherEmpty"));
      return;
    }
    if (!authUser?._id) {
      setVoucherError(t("checkout.voucherLogin"));
      return;
    }

    try {
      const res = await axios.post(
        "/voucher/validate",
        { code },
        { withCredentials: true },
      );
      const voucher = res?.data?.voucher;
      if (voucher?.code) {
        setVoucherInfo(voucher);
        setVoucherCode(voucher.code);
        setVoucherError("");
        toast.success(t("checkout.voucherAppliedToast"));
      } else {
        setVoucherInfo(null);
        setVoucherError(t("checkout.voucherInvalid"));
      }
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        t("checkout.voucherFailed");
      setVoucherInfo(null);
      setVoucherError(message);
      toast.error(message);
    }
  };

  const clearVoucher = () => {
    setVoucherInfo(null);
    setVoucherCode("");
    setVoucherError("");
  };

  const placeOrder = async () => {
    if (!items.length) {
      toast.error(t("checkout.emptyCart"));
      return;
    }
    if (!authUser?._id) {
      toast.error(t("checkout.loginRequired"));
      return;
    }

    const selectedCity = cities.find((c) => String(c.code) === cityCode);
    const selectedDistrict = districts.find(
      (d) => String(d.code) === districtCode,
    );
    const selectedWard = wards.find((w) => String(w.code) === wardCode);

    try {
      const payload = {
        items: items.map((x) => ({
          bookId: x.id,
          qty: x.qty,
        })),
        paymentMethod: payment.toUpperCase(),
        voucherCode: String(voucherInfo?.code || voucherCode).trim(),
        invoiceRequested,
        shippingAddress: {
          fullName: fullName.trim(),
          phone: phone.trim(),
          email: email.trim(),
          addressLine: addressLine.trim(),
          ward: selectedWard?.name || "",
          district: selectedDistrict?.name || "",
          city: selectedCity?.name || "",
          note: note.trim(),
        },
      };

      const res = await axios.post("/order", payload, {
        withCredentials: true,
      });
      const paymentUrl = res?.data?.paymentUrl;
      if (payment === "vnpay" && paymentUrl) {
        window.location.href = paymentUrl;
        return;
      }

      if (res.data) {
        toast.success(t("checkout.placeSuccess"));
        clear();
        clearVoucher();
      }
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        t("checkout.placeFailed");
      toast.error(message);
    }
  };

  const discountPercent = Number(voucherInfo?.discountPercent || 0);
  const discountAmount = Math.round(totals.total * (discountPercent / 100));
  const finalTotal = Math.max(totals.total - discountAmount, 0);

  return (
    <>
      <Navbar />
      <main className="wrap min-h-screen pb-24 pt-28">
        <h1 className="border-b border-line pb-6 font-display text-4xl font-medium md:text-5xl">
          {t("checkout.title")}
        </h1>

        {!items.length ? (
          <div className="py-16 text-lg text-muted">
            {t("checkout.empty")}
            <Link className="link-draw font-semibold text-accent" to="/cart">
              {t("checkout.cartLink")}
            </Link>
            .
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-16">
            <div className="max-w-2xl space-y-10">
              <div className="mt-6 border-t border-line pt-6">
                <div className="font-display text-2xl font-medium">
                  {t("checkout.shippingTitle")}
                </div>
                <div className="mt-4 grid grid-cols-1 gap-3">
                  <div>
                    <label className="text-sm font-semibold">
                      {t("checkout.fullName")}
                    </label>
                    <input
                      type="text"
                      placeholder={t("checkout.fullNamePlaceholder")}
                      className="mt-2 min-h-[44px] w-full rounded-md border border-line bg-paper px-3 text-sm focus:border-ink/40 focus:outline-none disabled:opacity-60"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold">
                      {t("checkout.email")}
                    </label>
                    <input
                      type="email"
                      placeholder={t("checkout.emailPlaceholder")}
                      className="mt-2 min-h-[44px] w-full rounded-md border border-line bg-paper px-3 text-sm focus:border-ink/40 focus:outline-none disabled:opacity-60"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold">
                      {t("checkout.phone")}
                    </label>
                    <input
                      type="tel"
                      placeholder={t("checkout.phonePlaceholder")}
                      className="mt-2 min-h-[44px] w-full rounded-md border border-line bg-paper px-3 text-sm focus:border-ink/40 focus:outline-none disabled:opacity-60"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold">
                      {t("checkout.country")}
                    </label>
                    <select className="mt-2 min-h-[44px] w-full rounded-md border border-line bg-paper px-3 text-sm focus:border-ink/40 focus:outline-none disabled:opacity-60">
                      <option>{t("checkout.countryPlaceholder")}</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-semibold">
                      {t("checkout.city")}
                    </label>
                    <select
                      className="mt-2 min-h-[44px] w-full rounded-md border border-line bg-paper px-3 text-sm focus:border-ink/40 focus:outline-none disabled:opacity-60"
                      value={cityCode}
                      onChange={(e) => setCityCode(e.target.value)}
                    >
                      <option value="">{t("checkout.cityPlaceholder")}</option>
                      {cities.map((city) => (
                        <option key={city.code} value={city.code}>
                          {city.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-semibold">
                      {t("checkout.district")}
                    </label>
                    <select
                      className="mt-2 min-h-[44px] w-full rounded-md border border-line bg-paper px-3 text-sm focus:border-ink/40 focus:outline-none disabled:opacity-60"
                      value={districtCode}
                      onChange={(e) => setDistrictCode(e.target.value)}
                      disabled={!districts.length}
                    >
                      <option value="">
                        {t("checkout.districtPlaceholder")}
                      </option>
                      {districts.map((district) => (
                        <option key={district.code} value={district.code}>
                          {district.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-semibold">
                      {t("checkout.ward")}
                    </label>
                    <select
                      className="mt-2 min-h-[44px] w-full rounded-md border border-line bg-paper px-3 text-sm focus:border-ink/40 focus:outline-none disabled:opacity-60"
                      value={wardCode}
                      onChange={(e) => setWardCode(e.target.value)}
                      disabled={!wards.length}
                    >
                      <option value="">{t("checkout.wardPlaceholder")}</option>
                      {wards.map((ward) => (
                        <option key={ward.code} value={ward.code}>
                          {ward.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-semibold">
                      {t("checkout.addressLine")}
                    </label>
                    <input
                      type="text"
                      placeholder={t("checkout.addressLinePlaceholder")}
                      className="mt-2 min-h-[44px] w-full rounded-md border border-line bg-paper px-3 text-sm focus:border-ink/40 focus:outline-none disabled:opacity-60"
                      value={addressLine}
                      onChange={(e) => setAddressLine(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 border-t border-line pt-6">
                <div className="font-display text-2xl font-medium">
                  {t("checkout.shippingMethod")}
                </div>
                <div className="mt-3 text-sm text-muted">
                  {t("checkout.shippingNote")}
                </div>
              </div>

              <div className="mt-6 border-t border-line pt-6">
                <div className="font-display text-2xl font-medium">
                  {t("checkout.paymentMethod")}
                </div>
                <div className="mt-4 space-y-3 text-sm">
                  <label className="flex min-h-[44px] cursor-pointer items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      className="h-4 w-4 accent-accent"
                      checked={payment === "momo"}
                      onChange={() => setPayment("momo")}
                    />
                    <span>{t("checkout.paymentMomo")}</span>
                  </label>
                  <label className="flex min-h-[44px] cursor-pointer items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      className="h-4 w-4 accent-accent"
                      checked={payment === "vnpay"}
                      onChange={() => setPayment("vnpay")}
                    />
                    <span>{t("checkout.paymentVnpay")}</span>
                  </label>
                  <label className="flex min-h-[44px] cursor-pointer items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      className="h-4 w-4 accent-accent"
                      checked={payment === "cod"}
                      onChange={() => setPayment("cod")}
                    />
                    <span>{t("checkout.paymentCod")}</span>
                  </label>
                </div>
              </div>

              <div className="mt-6 border-t border-line pt-6">
                <div className="font-display text-2xl font-medium">
                  {t("checkout.voucherTitle")}
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <input
                    type="text"
                    placeholder={t("checkout.voucherPlaceholder")}
                    className="min-h-[44px] min-w-0 flex-1 rounded-md border border-line bg-paper px-3 text-sm focus:border-ink/40 focus:outline-none"
                    value={voucherCode}
                    onChange={(e) => setVoucherCode(e.target.value)}
                  />
                  <button
                    type="button"
                    className="btn-line"
                    onClick={applyVoucher}
                  >
                    {t("checkout.voucherApply")}
                  </button>
                  {voucherInfo ? (
                    <button
                      type="button"
                      className="link-draw min-h-[44px] text-sm font-semibold text-sale"
                      onClick={clearVoucher}
                    >
                      {t("checkout.voucherRemove")}
                    </button>
                  ) : null}
                </div>
                {voucherInfo ? (
                  <div className="mt-3 text-sm text-accent">
                    {t("checkout.voucherApplied")}: {voucherInfo.code} (-
                    {discountPercent}%)
                    {voucherInfo.expiresAt
                      ? `, ${t("checkout.voucherExpires")} ${new Date(voucherInfo.expiresAt).toLocaleDateString(locale)}`
                      : ""}
                  </div>
                ) : null}
                {voucherError ? (
                  <div className="mt-3 text-sm text-sale">
                    {voucherError}
                  </div>
                ) : null}
                
              </div>

              <div className="mt-6 border-t border-line pt-6">
                <div className="font-display text-2xl font-medium">
                  {t("checkout.otherInfo")}
                </div>
                <label className="mt-3 flex min-h-[44px] cursor-pointer items-center gap-3 text-sm">
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-accent"
                    checked={invoiceRequested}
                    onChange={(e) => setInvoiceRequested(e.target.checked)}
                  />
                  <span>{t("checkout.invoice")}</span>
                </label>
                <textarea
                  className="mt-3 w-full rounded-md border border-line bg-paper px-3 py-2 text-sm focus:border-ink/40 focus:outline-none"
                  rows={3}
                  placeholder={t("checkout.notePlaceholder")}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
                <div className="mt-2 text-xs text-muted">
                  {t("checkout.invoiceNote")}
                </div>
              </div>
            </div>

            <aside className="self-start rounded-md bg-surface p-6 lg:sticky lg:top-28">
              <div>
                <h2 className="font-display text-2xl font-medium">
                  {t("checkout.orderReview")}
                </h2>
                <div className="mt-4 space-y-3">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-16 w-11 rounded-sm object-cover"
                        />
                      ) : (
                        <div className="h-16 w-11 rounded-sm bg-line" />
                      )}
                      <div className="flex-1">
                        <div className="text-sm font-semibold">{item.name}</div>
                        <div className="text-xs text-muted">
                          x{item.qty}
                        </div>
                      </div>
                      <div className="text-sm font-semibold">
                        {formatVnd(item.price * item.qty)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 border-t border-line pt-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted">
                    {t("checkout.subtotal")}
                  </span>
                  <span className="font-semibold">
                    {formatVnd(totals.total)}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="text-muted">
                    {t("checkout.discount")}
                  </span>
                  <span className="font-semibold text-accent">
                    -{formatVnd(discountAmount)}
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="text-muted">
                    {t("checkout.shippingFee")}
                  </span>
                  <span className="font-semibold">
                    {t("checkout.shippingFeeFree")}
                  </span>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm font-semibold">
                    {t("checkout.totalWithVat")}
                  </span>
                  <span className="font-display text-3xl font-medium">
                    {formatVnd(finalTotal)}
                  </span>
                </div>
                <button
                  className="btn-solid mt-6 w-full"
                  onClick={placeOrder}
                >
                  {t("checkout.confirmPayment")}
                </button>
                <div className="mt-2 text-xs text-muted">
                  {t("checkout.termsNote")}
                </div>
              </div>
            </aside>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}

export default Checkout;
