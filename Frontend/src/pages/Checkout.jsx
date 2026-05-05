import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthProvider";
import { useCart } from "../context/CartProvider";

const formatVnd = (value) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value || 0);

function Checkout() {
  const { items, clear, totals } = useCart();
  const [authUser] = useAuth();
  const [payment, setPayment] = useState("momo");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [addressLine, setAddressLine] = useState("");
  const [note, setNote] = useState("");
  const [voucherCode, setVoucherCode] = useState("");
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

  const placeOrder = async () => {
    if (!items.length) {
      toast.error("Giỏ hàng trống");
      return;
    }
    if (!authUser?._id) {
      toast.error("Vui lòng đăng nhập để thanh toán");
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
        voucherCode: voucherCode.trim(),
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
      if (res.data) {
        toast.success("Đặt hàng thành công");
        clear();
      }
    } catch (err) {
      const message =
        err?.response?.data?.message || err?.message || "Đặt hàng thất bại";
      toast.error(message);
    }
  };

  return (
    <>
      <Navbar />
      <div className="max-w-screen-2xl container mx-auto md:px-20 px-4 min-h-screen pt-28 pb-16">
        <h1 className="text-2xl font-bold">THANH TOÁN</h1>

        {!items.length ? (
          <div className="mt-6 rounded-2xl border border-dashed p-8 text-center">
            Giỏ hàng trống. Vui lòng quay lại{" "}
            <Link className="text-blue-600" to="/cart">
              giỏ hàng
            </Link>
            .
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div className="space-y-4">
              <div className="rounded-2xl border bg-white p-4 shadow-sm">
                <div className="text-sm font-semibold uppercase text-slate-500">
                  Địa chỉ giao hàng
                </div>
                <div className="mt-4 grid grid-cols-1 gap-3">
                  <div>
                    <label className="text-sm font-medium">
                      Họ và tên người nhận
                    </label>
                    <input
                      type="text"
                      placeholder="Nhập họ và tên người nhận"
                      className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Email</label>
                    <input
                      type="email"
                      placeholder="Nhập email"
                      className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Số điện thoại</label>
                    <input
                      type="tel"
                      placeholder="Ví dụ: 0978123xxx"
                      className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Quốc gia</label>
                    <select className="mt-1 w-full rounded-md border px-3 py-2 text-sm">
                      <option>Việt Nam</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">
                      Tỉnh/Thành phố
                    </label>
                    <select
                      className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                      value={cityCode}
                      onChange={(e) => setCityCode(e.target.value)}
                    >
                      <option value="">Chọn tỉnh/thành phố</option>
                      {cities.map((city) => (
                        <option key={city.code} value={city.code}>
                          {city.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Quận/Huyện</label>
                    <select
                      className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                      value={districtCode}
                      onChange={(e) => setDistrictCode(e.target.value)}
                      disabled={!districts.length}
                    >
                      <option value="">Chọn quận/huyện</option>
                      {districts.map((district) => (
                        <option key={district.code} value={district.code}>
                          {district.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Phường/Xã</label>
                    <select
                      className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                      value={wardCode}
                      onChange={(e) => setWardCode(e.target.value)}
                      disabled={!wards.length}
                    >
                      <option value="">Chọn phường/xã</option>
                      {wards.map((ward) => (
                        <option key={ward.code} value={ward.code}>
                          {ward.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">
                      Địa chỉ nhận hàng
                    </label>
                    <input
                      type="text"
                      placeholder="Nhập địa chỉ nhận hàng"
                      className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                      value={addressLine}
                      onChange={(e) => setAddressLine(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border bg-white p-4 shadow-sm">
                <div className="text-sm font-semibold uppercase text-slate-500">
                  Phương thức vận chuyển
                </div>
                <div className="mt-3 text-sm text-slate-600">
                  Quý khách vui lòng điền sẵn địa chỉ giao nhận trước.
                </div>
              </div>

              <div className="rounded-2xl border bg-white p-4 shadow-sm">
                <div className="text-sm font-semibold uppercase text-slate-500">
                  Phương thức thanh toán
                </div>
                <div className="mt-4 space-y-3 text-sm">
                  <label className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      className="h-4 w-4 accent-red-600"
                      checked={payment === "momo"}
                      onChange={() => setPayment("momo")}
                    />
                    <span>Ví MoMo</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      className="h-4 w-4 accent-red-600"
                      checked={payment === "cod"}
                      onChange={() => setPayment("cod")}
                    />
                    <span>Thanh toán bằng tiền mặt khi nhận hàng (COD)</span>
                  </label>
                </div>
              </div>

              <div className="rounded-2xl border bg-white p-4 shadow-sm">
                <div className="text-sm font-semibold uppercase text-slate-500">
                  Mã khuyến mãi / Gift card
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <input
                    type="text"
                    placeholder="Nhập mã khuyến mãi"
                    className="flex-1 rounded-md border px-3 py-2 text-sm"
                    value={voucherCode}
                    onChange={(e) => setVoucherCode(e.target.value)}
                  />
                  <button className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white">
                    Áp dụng
                  </button>
                  <button className="text-sm text-blue-600">
                    Chọn khuyến mãi
                  </button>
                </div>
                <button className="mt-3 text-xs text-slate-500">
                  Hướng dẫn sử dụng Gift Card
                </button>
              </div>

              <div className="rounded-2xl border bg-white p-4 shadow-sm">
                <div className="text-sm font-semibold uppercase text-slate-500">
                  Thông tin khác
                </div>
                <div className="mt-3 flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="h-4 w-4"
                    checked={invoiceRequested}
                    onChange={(e) => setInvoiceRequested(e.target.checked)}
                  />
                  <span>Xuất hóa đơn GTGT</span>
                </div>
                <textarea
                  className="mt-3 w-full rounded-md border px-3 py-2 text-sm"
                  rows={3}
                  placeholder="Ghi chú"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
                <div className="mt-2 text-xs text-red-500">
                  Lưu ý: Chỉ xuất hóa đơn cho đơn hàng có thông tin đầy đủ và
                  chính xác.
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border bg-white p-4 shadow-sm">
                <div className="text-sm font-semibold uppercase text-slate-500">
                  Kiểm tra lại đơn hàng
                </div>
                <div className="mt-4 space-y-3">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-16 w-12 rounded-md object-cover"
                        />
                      ) : (
                        <div className="h-16 w-12 rounded-md bg-slate-100" />
                      )}
                      <div className="flex-1">
                        <div className="text-sm font-semibold">{item.name}</div>
                        <div className="text-xs text-slate-500">
                          x{item.qty}
                        </div>
                      </div>
                      <div className="text-sm font-semibold text-red-600">
                        {formatVnd(item.price * item.qty)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Tạm tính</span>
                  <span className="font-semibold">
                    {formatVnd(totals.total)}
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="text-slate-500">Phí vận chuyển</span>
                  <span className="font-semibold">0đ</span>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm font-semibold">
                    Tổng số tiền (gồm VAT)
                  </span>
                  <span className="text-2xl font-bold text-red-600">
                    {formatVnd(totals.total)}
                  </span>
                </div>
                <button
                  className="mt-4 w-full rounded-xl bg-red-600 py-3 text-sm font-semibold text-white"
                  onClick={placeOrder}
                >
                  Xác nhận thanh toán
                </button>
                <div className="mt-2 text-xs text-slate-500">
                  Bằng việc tiến hành mua hàng, bạn đã đồng ý với điều khoản &
                  điều kiện của bookStore.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}

export default Checkout;
