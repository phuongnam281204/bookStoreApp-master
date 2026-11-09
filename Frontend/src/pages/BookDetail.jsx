import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Cards from "../components/Cards";
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

  const originalPrice = Number(book?.originalPrice || book?.compareAtPrice || 0);
  const hasDiscount = originalPrice > Number(book?.price || 0) && Number(book?.price || 0) > 0;

  const openAuth = (tab) => {
    window.dispatchEvent(new CustomEvent("auth:open", { detail: { tab } }));
    document.getElementById("my_modal_3")?.showModal();
  };

  const Stars = ({ value, size = "h-4 w-4" }) => (
    <span className="flex items-center gap-0.5" aria-hidden="true">
      {Array.from({ length: 5 }).map((_, index) => (
        <svg
          key={index}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className={`${size} ${index + 1 <= Math.round(value) ? "text-accent" : "text-line"}`}
        >
          <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
        </svg>
      ))}
    </span>
  );

  return (
    <>
      <Navbar />
      <main className="pb-24 pt-28">
        <div className="wrap">
          {loading ? (
            <p className="text-muted">Đang tải…</p>
          ) : !book ? (
            <div className="py-24">
              <h1 className="font-display text-4xl">Không tìm thấy sách</h1>
              <Link to="/course" className="btn-solid mt-8">
                Xem tất cả sách
              </Link>
            </div>
          ) : (
            <>
              <nav aria-label="Breadcrumb" className="text-sm text-muted">
                <Link to="/course" className="link-draw hover:text-ink">
                  Sách
                </Link>
                {book.category ? (
                  <>
                    <span className="mx-2">/</span>
                    <Link
                      to={`/course?search=${encodeURIComponent(book.category)}`}
                      className="link-draw hover:text-ink"
                    >
                      {book.category}
                    </Link>
                  </>
                ) : null}
              </nav>

              <section className="mt-8 grid gap-10 lg:grid-cols-12 lg:gap-16">
                <div className="lg:col-span-5">
                  <div className="overflow-hidden rounded-sm bg-surface shadow-[0_1px_2px_rgb(0_0_0/0.06),0_24px_48px_-24px_rgb(0_0_0/0.4)]">
                    {activeImage ? (
                      <img
                        src={activeImage}
                        alt={book.name}
                        className="aspect-[2/3] w-full object-cover"
                      />
                    ) : (
                      <div className="aspect-[2/3] w-full" />
                    )}
                  </div>
                  {images.length > 1 ? (
                    <div className="mt-4 grid grid-cols-5 gap-3">
                      {images.map((img, i) => (
                        <button
                          key={`${img}-${i}`}
                          type="button"
                          onClick={() => setActiveIndex(i)}
                          aria-label={`Ảnh ${i + 1}`}
                          className={`overflow-hidden rounded-sm border-2 transition ${
                            i === activeIndex
                              ? "border-accent"
                              : "border-transparent opacity-70 hover:opacity-100"
                          }`}
                        >
                          <img
                            src={img}
                            alt=""
                            className="aspect-[2/3] w-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>

                <div className="lg:col-span-7">
                  <h1 className="font-display text-4xl font-medium leading-[1.1] md:text-5xl">
                    {book.name}
                  </h1>
                  {book.author ? (
                    <p className="mt-3 text-lg text-muted">{book.author}</p>
                  ) : null}

                  <div className="mt-4 flex items-center gap-2 text-sm text-muted">
                    <Stars value={ratingValue} />
                    <span className="font-semibold text-ink">
                      {ratingValue ? ratingValue.toFixed(1) : "0.0"}
                    </span>
                    <a href="#reviews" className="link-draw">
                      {ratingCount} đánh giá
                    </a>
                  </div>

                  <div className="mt-8 flex flex-wrap items-baseline gap-3 border-t border-line pt-8">
                    <span className="font-display text-4xl font-medium">
                      {Number(book.price || 0).toLocaleString("vi-VN")}đ
                    </span>
                    {hasDiscount ? (
                      <>
                        <span className="text-muted line-through">
                          {originalPrice.toLocaleString("vi-VN")}đ
                        </span>
                        <span className="font-semibold text-sale">
                          −
                          {Math.round(
                            ((originalPrice - Number(book.price)) /
                              originalPrice) *
                              100,
                          )}
                          %
                        </span>
                      </>
                    ) : null}
                  </div>

                  <div className="mt-6 grid gap-3 sm:max-w-md sm:grid-cols-2">
                    <button
                      type="button"
                      className="btn-solid"
                      onClick={handleBuyNow}
                    >
                      Mua ngay
                    </button>
                    <button
                      type="button"
                      className="btn-line"
                      onClick={handleAddToCart}
                    >
                      Thêm vào giỏ
                    </button>
                  </div>

                  <ul className="mt-6 space-y-1.5 text-sm text-muted">
                    <li>Giao hàng toàn quốc, thanh toán MoMo, VNPAY hoặc khi nhận hàng.</li>
                    <li>Đổi trả miễn phí toàn quốc.</li>
                    <li>Ưu đãi riêng khi mua số lượng lớn.</li>
                  </ul>

                  <div className="mt-12">
                    <h2 className="font-display text-2xl font-medium">
                      Thông tin xuất bản
                    </h2>
                    <dl className="mt-4 grid sm:grid-cols-2 sm:gap-x-10">
                      {detailRows.map((row) => (
                        <div
                          key={row.label}
                          className="flex justify-between gap-4 border-b border-line py-3 text-sm"
                        >
                          <dt className="text-muted">{row.label}</dt>
                          <dd className="text-right font-medium">
                            {row.value || "—"}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </div>

                  <div className="mt-12">
                    <h2 className="font-display text-2xl font-medium">
                      Giới thiệu sách
                    </h2>
                    <div
                      className={`relative mt-4 overflow-hidden ${
                        isDescExpanded ? "" : "max-h-48"
                      }`}
                    >
                      <p className="whitespace-pre-wrap leading-7 text-ink/85">
                        {book.title || "Chưa có mô tả."}
                      </p>
                      {!isDescExpanded ? (
                        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-paper to-transparent" />
                      ) : null}
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsDescExpanded(!isDescExpanded)}
                      className="link-draw mt-3 text-sm font-semibold text-accent"
                    >
                      {isDescExpanded ? "Thu gọn" : "Đọc tiếp"}
                    </button>
                  </div>
                </div>
              </section>

              <section
                id="reviews"
                className="mt-24 scroll-mt-24 border-t border-line pt-12"
              >
                <h2 className="font-display text-3xl font-medium md:text-[2.5rem]">
                  Bạn đọc nói gì về {book.name}
                </h2>

                <div className="mt-10 grid gap-12 lg:grid-cols-12">
                  <div className="lg:col-span-4">
                    <div className="flex items-baseline gap-2">
                      <span className="font-display text-6xl font-medium">
                        {ratingValue ? ratingValue.toFixed(1) : "0.0"}
                      </span>
                      <span className="text-muted">/ 5</span>
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-sm text-muted">
                      <Stars value={ratingValue} size="h-5 w-5" />
                      <span>{ratingCount} đánh giá</span>
                    </div>

                    <div className="mt-6 space-y-2">
                      {[5, 4, 3, 2, 1].map((star) => {
                        const count = reviews.filter(
                          (r) => Math.round(r.rating || 0) === star,
                        ).length;
                        const percent = reviews.length
                          ? Math.round((count / reviews.length) * 100)
                          : 0;
                        return (
                          <div
                            key={star}
                            className="flex items-center gap-3 text-sm text-muted"
                          >
                            <span className="w-12 whitespace-nowrap">
                              {star} sao
                            </span>
                            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-line">
                              <div
                                className="h-full rounded-full bg-accent"
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                            <span className="w-10 text-right">{percent}%</span>
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-8">
                      {!authUser ? (
                        <p className="text-sm text-muted">
                          Đăng nhập để viết nhận xét.{" "}
                          <button
                            type="button"
                            onClick={() => openAuth("login")}
                            className="link-draw font-semibold text-accent"
                          >
                            Đăng nhập
                          </button>{" "}
                          hoặc{" "}
                          <button
                            type="button"
                            onClick={() => openAuth("signup")}
                            className="link-draw font-semibold text-accent"
                          >
                            tạo tài khoản
                          </button>
                        </p>
                      ) : myReview ? (
                        <p className="text-sm text-muted">
                          Bạn đã đánh giá sách này. Sửa đánh giá ở khung bên
                          cạnh.
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <div className="lg:col-span-8">
                    {authUser ? (
                      <div
                        id="review-form"
                        className="rounded-md border border-line bg-surface p-6"
                      >
                        <fieldset>
                          <legend className="text-sm font-semibold">
                            Chấm sao
                          </legend>
                          <div className="mt-2 flex items-center gap-1">
                            {Array.from({ length: 5 }).map((_, index) => (
                              <button
                                key={index}
                                type="button"
                                onClick={() => setRatingInput(index + 1)}
                                className="flex h-11 w-11 items-center justify-center transition hover:scale-110"
                                aria-label={`Chọn ${index + 1} sao`}
                                aria-pressed={index + 1 <= ratingInput}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 24 24"
                                  fill="currentColor"
                                  className={`h-7 w-7 ${index + 1 <= ratingInput ? "text-accent" : "text-line"}`}
                                >
                                  <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                </svg>
                              </button>
                            ))}
                          </div>
                        </fieldset>

                        <label
                          htmlFor="review-comment"
                          className="mt-4 block text-sm font-semibold"
                        >
                          Nhận xét (không bắt buộc)
                        </label>
                        <textarea
                          id="review-comment"
                          rows={3}
                          value={commentInput}
                          onChange={(e) => setCommentInput(e.target.value)}
                          placeholder="Cuốn này hợp với ai, đọc có cuốn không…"
                          className="mt-2 w-full rounded-md border border-line bg-paper px-3 py-2 text-sm focus:border-ink/40 focus:outline-none"
                        />

                        <button
                          type="button"
                          onClick={submitReview}
                          disabled={reviewSubmitting}
                          className="btn-solid mt-4 disabled:opacity-60"
                        >
                          {reviewSubmitting
                            ? "Đang gửi…"
                            : myReview
                              ? "Cập nhật đánh giá"
                              : "Gửi đánh giá"}
                        </button>
                      </div>
                    ) : null}

                    <div className={authUser ? "mt-8" : ""}>
                      {reviewsLoading ? (
                        <p className="text-muted">Đang tải đánh giá…</p>
                      ) : !reviews.length ? (
                        <p className="text-muted">
                          Chưa có ai đánh giá cuốn này.
                        </p>
                      ) : (
                        <ul>
                          {reviews.map((review) => (
                            <li
                              key={review._id}
                              className="border-b border-line py-6 first:pt-0"
                            >
                              <div className="flex flex-wrap items-baseline justify-between gap-2">
                                <span className="font-semibold">
                                  {review.userId?.fullname || "Bạn đọc"}
                                </span>
                                <span className="text-xs text-muted">
                                  {review.createdAt
                                    ? new Date(
                                        review.createdAt,
                                      ).toLocaleDateString("vi-VN")
                                    : ""}
                                </span>
                              </div>
                              <div className="mt-2">
                                <Stars value={review.rating || 0} />
                              </div>
                              {review.comment ? (
                                <p className="mt-3 leading-7 text-ink/85">
                                  {review.comment}
                                </p>
                              ) : null}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              </section>

              {suggestedBooks.length > 0 ? (
                <section className="mt-24 border-t border-line pt-12">
                  <div className="flex items-end justify-between gap-6">
                    <h2 className="font-display text-3xl font-medium md:text-[2.5rem]">
                      Cùng kệ {book.category}
                    </h2>
                    <Link
                      to={`/course?search=${encodeURIComponent(book.category || "")}`}
                      className="link-draw shrink-0 pb-1 text-sm font-semibold text-accent"
                    >
                      Xem cả kệ →
                    </Link>
                  </div>
                  <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-5">
                    {suggestedBooks.slice(0, 5).map((item) => (
                      <Cards key={item._id || item.id} item={item} />
                    ))}
                  </div>
                </section>
              ) : null}
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

export default BookDetail;
