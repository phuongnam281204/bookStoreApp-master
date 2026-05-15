import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
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
  const [isDescExpanded, setIsDescExpanded] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [myReview, setMyReview] = useState(null);
  const [ratingInput, setRatingInput] = useState(0);
  const [commentInput, setCommentInput] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [suggestedBooks, setSuggestedBooks] = useState([]);

  useEffect(() => {
    if (!book?.category) return;
    const loadSuggested = async () => {
      try {
        const res = await axios.get("/book");
        const allBooks = res.data || [];
        const filtered = allBooks.filter(
          (b) => b.category === book.category && b._id !== book._id
        );
        setSuggestedBooks(filtered.slice(0, 10));
      } catch (err) {
        console.log("Failed to load suggested books", err);
      }
    };
    loadSuggested();
  }, [book?.category, book?._id]);

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
            <div className="space-y-8">
              <div className="grid lg:grid-cols-[360px,1fr] lg:items-start gap-8">
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

                <div className="mt-5 flex flex-col sm:flex-row gap-2">
                  <button
                    type="button"
                    className="btn btn-outline border-rose-500 text-rose-600 hover:bg-rose-500 hover:text-white flex-1 flex items-center justify-center gap-2"
                    onClick={handleAddToCart}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                    </svg>
                    Thêm vào giỏ
                  </button>
                  <button
                    type="button"
                    className="btn bg-rose-500 text-white hover:bg-rose-600 flex-1"
                    onClick={handleBuyNow}
                  >
                    Mua ngay
                  </button>
                </div>

                <div className="mt-6 border-t border-slate-100 dark:border-slate-700 pt-4">
                  <h3 className="text-sm font-semibold text-slate-800 dark:text-white mb-3">
                    Chính sách ưu đãi của BookStore
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 hover:text-rose-500 cursor-pointer">
                      <div className="flex items-center gap-2">
                        <span className="text-rose-500">🚚</span>
                        <span>Thời gian giao hàng: Giao nhanh và uy tín</span>
                      </div>
                      <span className="text-lg leading-none">›</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 hover:text-rose-500 cursor-pointer">
                      <div className="flex items-center gap-2">
                        <span className="text-rose-500">🔄</span>
                        <span>Chính sách đổi trả: Đổi trả miễn phí toàn quốc</span>
                      </div>
                      <span className="text-lg leading-none">›</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 hover:text-rose-500 cursor-pointer">
                      <div className="flex items-center gap-2">
                        <span className="text-rose-500">🎁</span>
                        <span>Chính sách khách sỉ: Ưu đãi khi mua số lượng lớn</span>
                      </div>
                      <span className="text-lg leading-none">›</span>
                    </div>
                  </div>
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
                        <span className="text-sm font-medium text-right break-words max-w-[60%]">
                          {row.value || "-"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 dark:border dark:border-slate-700 rounded-2xl shadow p-6 relative">
                  <h2 className="text-lg font-semibold">Mô tả sản phẩm</h2>
                  <div className={`relative overflow-hidden transition-all duration-300 ${isDescExpanded ? '' : 'max-h-48'}`}>
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600 dark:text-slate-300 pb-8">
                      {book.title || "Chưa có mô tả."}
                    </p>
                    {!isDescExpanded && (
                      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white dark:from-slate-900 to-transparent flex items-end justify-center pb-2">
                      </div>
                    )}
                  </div>
                  <div className="mt-2 text-center">
                    <button
                      onClick={() => setIsDescExpanded(!isDescExpanded)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      {isDescExpanded ? "Thu gọn" : "Xem thêm"}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 dark:border dark:border-slate-700 rounded-2xl shadow p-6">
              <h2 className="text-lg font-semibold mb-6">Đánh giá sản phẩm</h2>

                  {/* Rating Summary block */}
                  <div className="flex flex-col md:flex-row items-center gap-8 mb-8 pb-8 border-b border-slate-100 dark:border-slate-700">
                    {/* Left: Overall Rating */}
                    <div className="flex flex-col items-center md:pr-8 md:border-r border-slate-100 dark:border-slate-700 min-w-[150px]">
                      <div className="text-5xl font-bold text-slate-800 dark:text-white flex items-baseline gap-1">
                        {ratingValue ? ratingValue.toFixed(1) : "0"}
                        <span className="text-2xl text-slate-500 font-normal">/5</span>
                      </div>
                      <div className="mt-2 flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, index) => {
                          const filled = index + 1 <= Math.round(ratingValue);
                          return (
                            <svg
                              key={index}
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                              className={`h-5 w-5 ${filled ? "text-amber-400" : "text-slate-200 dark:text-slate-700"}`}
                            >
                              <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                            </svg>
                          );
                        })}
                      </div>
                      <div className="mt-1 text-sm text-slate-500">
                        ({ratingCount} đánh giá)
                      </div>
                    </div>

                    {/* Middle: Progress bars */}
                    <div className="flex-1 w-full max-w-sm flex flex-col gap-2">
                      {[5, 4, 3, 2, 1].map(star => {
                        const count = reviews.filter(r => Math.round(r.rating || 0) === star).length;
                        const percent = reviews.length > 0 ? Math.round((count / reviews.length) * 100) : 0;
                        return (
                          <div key={star} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                            <span className="w-10 whitespace-nowrap">{star} sao</span>
                            <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div className="h-full bg-slate-300 dark:bg-slate-600 rounded-full" style={{ width: `${percent}%` }}></div>
                            </div>
                            <span className="w-8 text-right">{percent}%</span>
                          </div>
                        )
                      })}
                    </div>

                    {/* Right: Action */}
                    <div className="flex flex-col items-center justify-center text-center md:pl-8 flex-1">
                      {!authUser ? (
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Chỉ có thành viên mới có thể viết nhận xét. Vui lòng{" "}
                          <button onClick={() => { window.dispatchEvent(new CustomEvent("auth:open", { detail: { tab: "login" } })); document.getElementById("my_modal_3")?.showModal(); }} className="text-blue-600 hover:underline">đăng nhập</button>
                          {" "}hoặc{" "}
                          <button onClick={() => { window.dispatchEvent(new CustomEvent("auth:open", { detail: { tab: "signup" } })); document.getElementById("my_modal_3")?.showModal(); }} className="text-blue-600 hover:underline">đăng ký</button>.
                        </p>
                      ) : myReview ? (
                        <span className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-600">
                          Bạn đã đánh giá sản phẩm này
                        </span>
                      ) : (
                        <button onClick={() => document.getElementById("review-form")?.scrollIntoView({ behavior: 'smooth', block: 'center' })} className="btn bg-rose-500 text-white hover:bg-rose-600 px-8">
                          Viết đánh giá
                        </button>
                      )}
                    </div>
                  </div>

                  {authUser && (
                    <div id="review-form" className="mt-4 grid gap-3 max-w-2xl">
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
                  )}

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


            {suggestedBooks.length > 0 && (
              <div className="bg-gradient-to-r from-emerald-400 to-green-500 rounded-2xl p-4 shadow">
                <div className="flex items-center justify-center gap-3 text-white mb-6 pt-2">
                  <span className="text-2xl">✨</span>
                  <h2 className="text-xl font-bold uppercase tracking-wide">Gợi ý cho bạn</h2>
                  <span className="text-2xl">✨</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {suggestedBooks.map((item) => {
                    const imageSrc = item?.image || (Array.isArray(item?.images) && item.images.length ? item.images[0] : "");
                    const price = Number(item?.price || 0);
                    const originalPrice = Number(item?.originalPrice || item?.compareAtPrice || item?.price * 1.25 || 0);
                    const hasDiscount = originalPrice > price && price > 0;
                    const discountPercent = hasDiscount ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;
                    const soldCount = item?.sold || 0;
                    const isBestSeller = soldCount > 10;
                    const volumeMatch = String(item?.title || item?.name || "").match(/Tập\s*\d+/i);
                    const badgeText = item?.badge || item?.volume || (volumeMatch ? volumeMatch[0] : "");
                    
                    return (
                      <Link key={item._id || item.id} to={`/book/${item._id || item.id}`} className="block bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition">
                        <div className="aspect-[3/4] overflow-hidden relative">
                          <img src={imageSrc} alt={item.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" loading="lazy" />
                          {badgeText ? (
                            <span className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] font-semibold px-2 py-0.5 rounded">
                              {badgeText}
                            </span>
                          ) : null}
                        </div>
                        <div className="p-3">
                          <h3 className="text-xs font-medium text-slate-800 line-clamp-2 min-h-[32px] leading-relaxed">{item.name}</h3>
                          <div className="mt-2 flex items-center gap-2">
                            <span className="text-sm font-bold text-rose-600">{price.toLocaleString("vi-VN")} đ</span>
                            {hasDiscount && (
                              <span className="bg-rose-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">-{discountPercent}%</span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 line-through mt-0.5 min-h-[15px]">
                            {hasDiscount ? `${originalPrice.toLocaleString("vi-VN")} đ` : ""}
                          </div>
                          {soldCount > 0 && (
                            <div className="mt-2 flex items-center flex-wrap gap-1 text-[10px] text-slate-500">
                               {isBestSeller && (
                                 <span className="bg-orange-500 text-white px-1.5 py-0.5 rounded flex items-center gap-0.5 font-semibold">
                                   Bán chạy 
                                   <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd"></path></svg>
                                 </span>
                               )}
                               <span>Đã bán {soldCount >= 1000 ? (soldCount/1000).toFixed(1) + 'k' : soldCount}</span>
                            </div>
                          )}
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </div>
            )}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}

export default BookDetail;
