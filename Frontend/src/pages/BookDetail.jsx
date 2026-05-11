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
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [myReview, setMyReview] = useState(null);
  const [ratingInput, setRatingInput] = useState(0);
  const [commentInput, setCommentInput] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

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

  const loadReviews = async () => {
    if (!id) return;
    setReviewsLoading(true);
    try {
      const res = await axios.get(`/book/${id}/reviews`);
      setReviews(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      const message =
        err?.response?.data?.message || err?.message || "Không tải được";
      toast.error(message);
    } finally {
      setReviewsLoading(false);
    }
  };

  const loadMyReview = async () => {
    if (!id || !authUser?._id) return;
    try {
      const res = await axios.get(`/book/${id}/reviews/me`, {
        withCredentials: true,
      });
      setMyReview(res.data || null);
      setRatingInput(Number(res.data?.rating || 0));
      setCommentInput(String(res.data?.comment || ""));
    } catch {
      setMyReview(null);
      setRatingInput(0);
      setCommentInput("");
    }
  };

  useEffect(() => {
    loadReviews();
  }, [id]);

  useEffect(() => {
    if (!authUser?._id) {
      setMyReview(null);
      setRatingInput(0);
      setCommentInput("");
      return;
    }
    loadMyReview();
  }, [id, authUser?._id]);

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

  const ratingValue = Math.max(0, Math.min(5, Number(book?.rating || 0)));
  const ratingCount = Math.max(0, Number(book?.ratingCount || 0));

  const submitReview = async () => {
    if (!authUser) return requireLogin();
    if (ratingInput < 1 || ratingInput > 5) {
      toast.error("Vui lòng chọn số sao");
      return;
    }

    setReviewSubmitting(true);
    try {
      const res = await axios.post(
        `/book/${id}/reviews`,
        {
          rating: ratingInput,
          comment: commentInput.trim(),
        },
        { withCredentials: true },
      );
      setMyReview(res.data?.review || null);
      setBook((prev) =>
        prev
          ? {
              ...prev,
              rating: res.data?.rating ?? prev.rating,
              ratingCount: res.data?.ratingCount ?? prev.ratingCount,
            }
          : prev,
      );
      await loadReviews();
      toast.success("Đã lưu đánh giá");
    } catch (err) {
      const message =
        err?.response?.data?.message || err?.message || "Gửi đánh giá thất bại";
      toast.error(message);
    } finally {
      setReviewSubmitting(false);
    }
  };

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

                  <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, index) => {
                        const filled = index + 1 <= Math.round(ratingValue);
                        return (
                          <svg
                            key={index}
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className={`h-4 w-4 ${filled ? "text-amber-400" : "text-slate-200 dark:text-slate-700"}`}
                            aria-hidden="true"
                          >
                            <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                          </svg>
                        );
                      })}
                    </div>
                    <span className="font-medium text-slate-700 dark:text-slate-100">
                      {ratingValue ? ratingValue.toFixed(1) : "0.0"}
                    </span>
                    <span>({ratingCount} đánh giá)</span>
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

                <div className="bg-white dark:bg-slate-900 dark:border dark:border-slate-700 rounded-2xl shadow p-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h2 className="text-lg font-semibold">Đánh giá sản phẩm</h2>
                    {myReview ? (
                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-600">
                        Bạn đã đánh giá
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-4 grid gap-3">
                    <div>
                      <div className="text-sm font-medium text-slate-600">
                        Chọn số sao
                      </div>
                      <div className="mt-2 flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, index) => {
                          const active = index + 1 <= ratingInput;
                          return (
                            <button
                              key={index}
                              type="button"
                              onClick={() => setRatingInput(index + 1)}
                              className="transition"
                              aria-label={`Chọn ${index + 1} sao`}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                className={`h-6 w-6 ${active ? "text-amber-400" : "text-slate-200 dark:text-slate-700"}`}
                              >
                                <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                              </svg>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-slate-600">
                        Nhận xét (tuỳ chọn)
                      </label>
                      <textarea
                        rows={3}
                        value={commentInput}
                        onChange={(e) => setCommentInput(e.target.value)}
                        placeholder="Chia sẻ trải nghiệm đọc sách..."
                        className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-rose-400 focus:outline-none dark:border-slate-700 dark:bg-slate-900"
                      />
                    </div>

                    <div>
                      <button
                        type="button"
                        onClick={submitReview}
                        disabled={reviewSubmitting}
                        className="btn bg-rose-500 text-white hover:bg-rose-600 disabled:opacity-60"
                      >
                        {reviewSubmitting ? "Đang gửi..." : "Gửi đánh giá"}
                      </button>
                    </div>
                  </div>

                  <div className="mt-6">
                    {reviewsLoading ? (
                      <p>Đang tải đánh giá...</p>
                    ) : !reviews.length ? (
                      <p className="text-sm text-slate-500">
                        Chưa có đánh giá nào.
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {reviews.map((review) => (
                          <div
                            key={review._id}
                            className="rounded-xl border border-slate-100 p-4 dark:border-slate-700"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div className="text-sm font-semibold">
                                {review.userId?.fullname || "Người dùng"}
                              </div>
                              <div className="text-xs text-slate-400">
                                {review.createdAt
                                  ? new Date(review.createdAt).toLocaleString(
                                      "vi-VN",
                                    )
                                  : ""}
                              </div>
                            </div>
                            <div className="mt-2 flex items-center gap-1">
                              {Array.from({ length: 5 }).map((_, index) => {
                                const filled =
                                  index + 1 <= Math.round(review.rating || 0);
                                return (
                                  <svg
                                    key={index}
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                    className={`h-4 w-4 ${filled ? "text-amber-400" : "text-slate-200 dark:text-slate-700"}`}
                                    aria-hidden="true"
                                  >
                                    <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                  </svg>
                                );
                              })}
                            </div>
                            {review.comment ? (
                              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                                {review.comment}
                              </p>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
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
