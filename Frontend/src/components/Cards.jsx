import { Link } from "react-router-dom";
import { useCart } from "../context/CartProvider";
import { useAuth } from "../context/AuthProvider";
import { useI18n } from "../context/I18nProvider";
import toast from "react-hot-toast";

function Cards({ item }) {
  const { addItem } = useCart();
  const [authUser] = useAuth();
  const { t } = useI18n();

  const imageSrc =
    item?.image ||
    (Array.isArray(item?.images) && item.images.length ? item.images[0] : "");

  const price = Number(item?.price || 0);
  const originalPrice = Number(
    item?.originalPrice || item?.compareAtPrice || 0,
  );
  const hasDiscount = originalPrice > price && price > 0;
  const discountPercent = hasDiscount
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;
  const volumeMatch = String(item?.title || item?.name || "").match(
    /Tập\s*\d+/i,
  );
  const badgeText =
    item?.badge || item?.volume || (volumeMatch ? volumeMatch[0] : "");
  const rating = Math.max(0, Math.min(5, Number(item?.rating || 0)));
  const ratingCount = Math.max(0, Number(item?.ratingCount || 0));

  const requireLogin = () => {
    toast.error(t("cart.loginRequired"));
    const modal = document.getElementById("my_modal_3");
    if (modal && typeof modal.showModal === "function") modal.showModal();
  };

  return (
    <>
      <div className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700 dark:bg-slate-900 dark:text-white">
        <Link to={`/book/${item._id || item.id}`} className="block">
          <div className="relative aspect-[3/4] w-full overflow-hidden bg-slate-50 dark:bg-slate-800">
            <img
              src={imageSrc}
              alt={item.name}
              className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
              loading="lazy"
            />
            {badgeText ? (
              <span className="absolute bottom-3 right-3 rounded-full bg-black/80 px-3 py-1 text-xs font-semibold text-white">
                {badgeText}
              </span>
            ) : null}
          </div>
        </Link>

        <div className="p-4">
          <h3 className="line-clamp-2 text-sm font-semibold leading-5">
            {item.name}
          </h3>

          <div className="mt-3 flex items-center gap-2">
            <span className="text-base font-bold text-rose-600">
              {price.toLocaleString("vi-VN")}đ
            </span>
            {hasDiscount ? (
              <span className="rounded-md bg-rose-100 px-2 py-0.5 text-xs font-semibold text-rose-600">
                -{discountPercent}%
              </span>
            ) : null}
          </div>
          {hasDiscount ? (
            <div className="mt-1 text-sm text-slate-400 line-through">
              {originalPrice.toLocaleString("vi-VN")}đ
            </div>
          ) : null}

          <div className="mt-3 flex items-center gap-1 text-xs text-slate-400">
            {Array.from({ length: 5 }).map((_, index) => {
              const filled = index + 1 <= Math.round(rating);
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
            <span>({ratingCount})</span>
          </div>

          <div className="mt-4">
            <button
              type="button"
              className="w-full rounded-full border border-slate-300 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-700 hover:border-rose-500 hover:text-rose-600 dark:border-slate-600 dark:text-slate-200"
              onClick={() => {
                if (!authUser) return requireLogin();
                addItem(item);
              }}
            >
              {t("cards.buyNow")}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default Cards;
