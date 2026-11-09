import { Link, useNavigate } from "react-router-dom";
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
      <main className="wrap min-h-screen pb-24 pt-28">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6">
          <div>
            <h1 className="font-display text-4xl font-medium md:text-5xl">
              Giỏ hàng
            </h1>
            <p className="mt-2 text-muted">
              {totals.count} cuốn · kiểm tra lại trước khi thanh toán
            </p>
          </div>
          {items.length ? (
            <Link
              to="/course"
              className="link-draw pb-1 text-sm font-semibold text-accent"
            >
              Chọn thêm sách →
            </Link>
          ) : null}
        </div>

        {!items.length ? (
          <div className="py-16">
            <p className="text-lg text-muted">Giỏ hàng đang trống.</p>
            <Link to="/course" className="btn-solid mt-6">
              Xem tất cả sách
            </Link>
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-16">
            <ul>
              {items.map((x) => (
                <li
                  key={x.id}
                  className="grid grid-cols-[72px_1fr] gap-5 border-b border-line py-6 first:pt-0 sm:grid-cols-[88px_1fr]"
                >
                  <Link
                    to={`/book/${x.id}`}
                    className="block overflow-hidden rounded-sm bg-surface shadow-[0_1px_2px_rgb(0_0_0/0.06),0_10px_24px_-14px_rgb(0_0_0/0.3)]"
                    tabIndex={-1}
                    aria-hidden="true"
                  >
                    {x.image ? (
                      <img
                        src={x.image}
                        alt=""
                        className="aspect-[2/3] w-full object-cover"
                      />
                    ) : (
                      <div className="aspect-[2/3] w-full" />
                    )}
                  </Link>

                  <div className="flex min-w-0 flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0">
                      <Link
                        to={`/book/${x.id}`}
                        className="link-draw font-semibold leading-snug"
                      >
                        {x.name}
                      </Link>
                      <p className="mt-1 text-sm text-muted">
                        {formatVnd(x.price)} / cuốn
                      </p>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="flex items-center rounded-md border border-line">
                        <button
                          type="button"
                          className="h-11 w-11 text-lg text-muted transition hover:bg-surface hover:text-ink"
                          onClick={() => setQty(x.id, Math.max(1, x.qty - 1))}
                          aria-label={`Bớt một cuốn ${x.name}`}
                        >
                          −
                        </button>
                        <span className="w-8 text-center text-sm font-semibold">
                          {x.qty}
                        </span>
                        <button
                          type="button"
                          className="h-11 w-11 text-lg text-muted transition hover:bg-surface hover:text-ink"
                          onClick={() => setQty(x.id, x.qty + 1)}
                          aria-label={`Thêm một cuốn ${x.name}`}
                        >
                          +
                        </button>
                      </div>

                      <span className="w-28 text-right font-bold text-price">
                        {formatVnd(x.price * x.qty)}
                      </span>

                      <button
                        type="button"
                        className="flex h-11 w-11 items-center justify-center text-muted transition hover:text-sale"
                        onClick={() => removeItem(x.id)}
                        aria-label={`Bỏ ${x.name} khỏi giỏ`}
                        title="Bỏ khỏi giỏ"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="h-5 w-5"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6 18 18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <aside className="self-start rounded-md bg-surface p-6 lg:sticky lg:top-28">
              <h2 className="font-display text-2xl font-medium">
                Tóm tắt đơn
              </h2>
              <dl className="mt-6 space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted">Tạm tính ({totals.count} cuốn)</dt>
                  <dd className="font-semibold">{formatVnd(totals.total)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted">Mã giảm giá</dt>
                  <dd className="text-muted">Nhập ở bước thanh toán</dd>
                </div>
              </dl>
              <div className="mt-6 flex items-baseline justify-between border-t border-line pt-6">
                <span className="text-sm font-semibold">Tổng (gồm VAT)</span>
                <span className="font-display text-3xl font-medium">
                  {formatVnd(totals.total)}
                </span>
              </div>
              <button
                type="button"
                className="btn-solid mt-6 w-full"
                onClick={() => navigate("/checkout")}
              >
                Thanh toán đơn hàng
              </button>
              <p className="mt-3 text-xs text-muted">
                Giảm giá trên web chỉ áp dụng cho bán lẻ.
              </p>
              <button
                type="button"
                className="link-draw mt-4 min-h-[44px] text-sm font-semibold text-muted hover:text-ink"
                onClick={clear}
              >
                Xóa hết giỏ hàng
              </button>
            </aside>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}

export default Cart;
