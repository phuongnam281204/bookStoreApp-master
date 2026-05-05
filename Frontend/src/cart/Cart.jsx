import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useCart } from "../context/CartProvider";

const formatVnd = (value) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value || 0);

function Cart() {
  const { items, removeItem, setQty, clear, totals } = useCart();
  const navigate = useNavigate();

  return (
    <>
      <Navbar />
      <div className="max-w-screen-2xl container mx-auto md:px-20 px-4 min-h-screen pt-28 pb-16">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold">
            GIỎ HÀNG ({totals.count} sản phẩm)
          </h1>
          <div className="text-sm opacity-70">
            Kiểm tra và xác nhận trước khi thanh toán
          </div>
        </div>

        {!items.length ? (
          <div className="mt-6 rounded-2xl border border-dashed p-8 text-center">
            Giỏ hàng trống. Hãy thêm sách bạn yêu thích.
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div className="space-y-4">
              <div className="rounded-2xl border bg-white p-4 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <label className="flex items-center gap-3 text-sm font-semibold">
                    <input
                      type="checkbox"
                      className="h-4 w-4 accent-red-600"
                      defaultChecked
                    />
                    Chọn tất cả ({totals.count} sản phẩm)
                  </label>
                  <div className="hidden md:flex items-center gap-10 text-sm font-semibold text-slate-500">
                    <span>Số lượng</span>
                    <span>Thành tiền</span>
                  </div>
                </div>
              </div>

              {items.map((x) => (
                <div
                  key={x.id}
                  className="rounded-2xl border bg-white p-4 shadow-sm"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-center">
                    <div className="flex flex-1 items-start gap-4">
                      <input
                        type="checkbox"
                        className="mt-2 h-4 w-4 accent-red-600"
                        defaultChecked
                      />
                      {x.image ? (
                        <img
                          src={x.image}
                          alt={x.name}
                          className="h-20 w-16 rounded-md object-cover"
                        />
                      ) : (
                        <div className="h-20 w-16 rounded-md bg-slate-100" />
                      )}
                      <div className="space-y-2">
                        <div className="font-semibold">{x.name}</div>
                        <div className="text-sm text-slate-500">
                          Sách bởi BookStore
                        </div>
                        <div className="text-sm font-semibold text-slate-900">
                          {formatVnd(x.price)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-6 md:w-[260px]">
                      <div className="flex items-center rounded-full border px-2 py-1">
                        <button
                          className="h-8 w-8 rounded-full text-lg text-slate-500 hover:bg-slate-100"
                          onClick={() => setQty(x.id, Math.max(1, x.qty - 1))}
                        >
                          -
                        </button>
                        <div className="w-8 text-center text-sm font-semibold">
                          {x.qty}
                        </div>
                        <button
                          className="h-8 w-8 rounded-full text-lg text-slate-700 hover:bg-slate-100"
                          onClick={() => setQty(x.id, x.qty + 1)}
                        >
                          +
                        </button>
                      </div>

                      <div className="text-right">
                        <div className="text-base font-semibold text-red-600">
                          {formatVnd(x.price * x.qty)}
                        </div>
                      </div>

                      <button
                        className="text-slate-400 hover:text-red-500"
                        onClick={() => removeItem(x.id)}
                        aria-label="Xóa"
                        title="Xóa"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="h-5 w-5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-semibold text-blue-600">
                    <span>Khuyến mãi</span>
                  </div>
                  <button className="text-sm text-blue-600">Xem thêm</button>
                </div>
                <div className="mt-4 rounded-xl border p-3">
                  <div className="text-sm font-semibold">
                    Mã giảm 20K - Toàn sàn
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    Đơn hàng từ 300k - Không bao gồm giá trị của các sản phẩm
                  </div>
                  <div className="mt-2 text-xs text-slate-500">
                    HSD: 31/05/2026
                  </div>
                  <div className="mt-3 h-2 w-full rounded-full bg-slate-100">
                    <div className="h-2 w-3/4 rounded-full bg-blue-500" />
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                    <span>Mua thêm 34.000 đ</span>
                    <button className="rounded-full bg-blue-600 px-3 py-1 text-white">
                      Mua thêm
                    </button>
                  </div>
                </div>
                <button className="mt-3 w-full rounded-xl bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700">
                  3 khuyến mãi đủ điều kiện
                </button>
              </div>

              <div className="rounded-2xl border bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="font-semibold">Nhận quà (1/1)</div>
                  <button className="text-sm text-blue-600">Chọn quà</button>
                </div>
                <div className="mt-3 flex items-center justify-between rounded-xl border px-3 py-2 text-sm">
                  <span>E-voucher ưu đãi</span>
                  <button className="text-slate-400">x</button>
                </div>
              </div>

              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
                Miễn phí giao hàng cho đơn từ 500k trở lên! Chi tiết
              </div>

              <div className="rounded-2xl border bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Thành tiền</span>
                  <span className="font-semibold">
                    {formatVnd(totals.total)}
                  </span>
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
                  onClick={() => navigate("/checkout")}
                >
                  THANH TOÁN
                </button>
                <div className="mt-2 text-xs text-red-500">
                  Giảm giá trên web chỉ áp dụng cho bán lẻ
                </div>
                <button
                  className="mt-3 w-full rounded-xl border py-2 text-sm"
                  onClick={clear}
                >
                  Xóa giỏ hàng
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}

export default Cart;
