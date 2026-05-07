import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useCart } from "../context/CartProvider";
import { useAuth } from "../context/AuthProvider";
import toast from "react-hot-toast";

function BookDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [authUser] = useAuth();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`/book/${id}`);
        setBook(res.data);
      } catch (err) {
        const message =
          err?.response?.data?.message || err?.message || "Không tải được";
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  const requireLogin = () => {
    toast.error("Vui lòng đăng nhập để mua hàng");
    const modal = document.getElementById("my_modal_3");
    if (modal && typeof modal.showModal === "function") modal.showModal();
  };

  const handleAddToCart = () => {
    if (!authUser) return requireLogin();
    if (book) addItem(book);
  };

  const handleBuyNow = () => {
    if (!authUser) return requireLogin();
    if (book) addItem(book);
    navigate("/cart");
  };

  const images =
    book?.images && book.images.length
      ? book.images
      : book?.image
        ? [book.image]
        : [];
  const activeImage = images[activeIndex] || book?.image || "";

  useEffect(() => {
    setActiveIndex(0);
  }, [book?._id]);

  useEffect(() => {
    if (images.length <= 1) return undefined;
    const intervalId = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % images.length);
    }, 2500);
    return () => clearInterval(intervalId);
  }, [images.length]);

  const topMetaRows = [
    { label: "Nhà cung cấp", value: book?.supplier },
    { label: "Nhà xuất bản", value: book?.publisher },
    { label: "Tác giả", value: book?.author },
    { label: "Người dịch", value: book?.translator },
    { label: "Năm XB", value: book?.publishYear },
    { label: "Số trang", value: book?.pages },
  ];

  const detailRows = [
    { label: "Tên Nhà Cung Cấp", value: book?.supplier },
    { label: "Tác giả", value: book?.author },
    { label: "Người Dịch", value: book?.translator },
    { label: "NXB", value: book?.publisher },
    { label: "Năm XB", value: book?.publishYear },
    { label: "Trọng lượng (gr)", value: book?.weightGr },
    { label: "Kích Thước Bao Bì", value: book?.packageSize },
    { label: "Số trang", value: book?.pages },
  ];

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-amber-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
        <div className="max-w-screen-2xl container mx-auto md:px-20 px-4 pt-28 pb-12">
          {loading ? (
            <p>Loading...</p>
          ) : !book ? (
            <p>Không tìm thấy sách</p>
          ) : (
            <div className="grid lg:grid-cols-[360px,1fr] gap-8">
              <div className="bg-white dark:bg-slate-900 dark:border dark:border-slate-700 rounded-2xl shadow p-4">
                <div className="rounded-xl overflow-hidden border border-slate-100 dark:border-slate-700 bg-white">
                  <img
                    src={activeImage}
                    alt={book.name}
                    className="w-full object-cover"
                  />
                </div>
                {images.length ? (
                  <div className="mt-4 grid grid-cols-4 gap-2">
                    {images.map((img, i) => (
                      <button
                        key={`${img}-${i}`}
                        type="button"
                        onClick={() => setActiveIndex(i)}
                        className={`border rounded-lg overflow-hidden bg-white dark:bg-slate-800 dark:border-slate-700 transition ${
                          i === activeIndex
                            ? "ring-2 ring-rose-500"
                            : "hover:border-rose-300"
                        }`}
                      >
                        <img
                          src={img}
                          alt={book.name}
                          className="h-16 w-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                ) : null}

                <div className="mt-5 grid gap-2">
                  <button
                    type="button"
                    className="btn btn-outline border-rose-500 text-rose-600 hover:bg-rose-500 hover:text-white"
                    onClick={handleAddToCart}
                  >
                    Thêm vào giỏ hàng
                  </button>
                  <button
                    type="button"
                    className="btn bg-rose-500 text-white hover:bg-rose-600"
                    onClick={handleBuyNow}
                  >
                    Mua ngay
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-white dark:bg-slate-900 dark:border dark:border-slate-700 rounded-2xl shadow p-6">
                  <div className="flex flex-wrap items-center gap-2">
                    {book.category ? (
                      <span className="rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700 dark:border-slate-600 dark:text-slate-200">
                        {book.category}
                      </span>
                    ) : null}
                    <span className="rounded-full bg-rose-600 px-3 py-1 text-xs font-semibold text-white">
                      Flash Sale
                    </span>
                  </div>
                  <h1 className="mt-4 text-2xl md:text-3xl font-serif font-semibold text-slate-800 dark:text-white">
                    {book.name}
                  </h1>

                  <div className="mt-4 grid gap-2 text-sm text-slate-600 dark:text-slate-300 sm:grid-cols-2">
                    {topMetaRows.map((row) => (
                      <div key={row.label} className="flex gap-2">
                        <span className="opacity-70">{row.label}:</span>
                        <span className="font-medium text-slate-800 dark:text-slate-100">
                          {row.value || "-"}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 flex flex-wrap items-end gap-3">
                    <span className="text-3xl font-bold text-rose-600">
                      {Number(book.price || 0).toLocaleString("vi-VN")}đ
                    </span>
                    <span className="text-sm line-through text-slate-400">
                      {Number(book.price || 0)
                        ? Number(book.price * 1.2).toLocaleString("vi-VN") + "đ"
                        : ""}
                    </span>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 dark:border dark:border-slate-700 rounded-2xl shadow p-6">
                  <h2 className="text-lg font-semibold">Thông tin chi tiết</h2>
                  <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-700">
                    {detailRows.map((row) => (
                      <div
                        key={row.label}
                        className="flex items-center justify-between gap-4 py-2"
                      >
                        <span className="text-sm opacity-70">{row.label}</span>
                        <span className="text-sm font-medium">
                          {row.value || "-"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 dark:border dark:border-slate-700 rounded-2xl shadow p-6">
                  <h2 className="text-lg font-semibold">Mô tả sản phẩm</h2>
                  <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                    {book.title || "Chưa có mô tả."}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}

export default BookDetail;
