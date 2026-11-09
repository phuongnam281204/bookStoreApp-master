import { Link } from "react-router-dom";
import { useCart } from "../context/CartProvider";
import { useAuth } from "../context/AuthProvider";
import { useI18n } from "../context/I18nProvider";
import toast from "react-hot-toast";

const formatVnd = (value) => `${Number(value || 0).toLocaleString("vi-VN")}đ`;

// One book card for the whole storefront.
// variant "grid": cover on top (default). variant "row": cover left, text right.
function Cards({ item, variant = "grid" }) {
  const { addItem } = useCart();
  const [authUser] = useAuth();
  const { t } = useI18n();

  const imageSrc =
    item?.image ||
    (Array.isArray(item?.images) && item.images.length ? item.images[0] : "");
  const href = `/book/${item._id || item.id}`;

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

  const addToCart = () => {
    if (!authUser) return requireLogin();
    addItem(item);
  };

  const cover = (
    <Link
      to={href}
      className="group block overflow-hidden rounded-sm bg-surface shadow-[0_1px_2px_rgb(0_0_0/0.06),0_10px_24px_-14px_rgb(0_0_0/0.3)]"
      tabIndex={-1}
      aria-hidden="true"
    >
      <div className="relative aspect-[2/3] w-full">
        {imageSrc ? (
          <img
            src={imageSrc}
            alt=""
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
            loading="lazy"
          />
        ) : null}
        {badgeText ? (
          <span className="absolute left-2 top-2 rounded-sm bg-ink/85 px-2 py-0.5 text-xs font-medium text-paper">
            {badgeText}
          </span>
        ) : null}
      </div>
    </Link>
  );

  const priceBlock = (
    <div className="flex flex-wrap items-baseline gap-x-2">
      <span className="font-semibold">{formatVnd(price)}</span>
      {hasDiscount ? (
        <>
          <span className="text-sm text-muted line-through">
            {formatVnd(originalPrice)}
          </span>
          <span className="text-sm font-semibold text-sale">
            −{discountPercent}%
          </span>
        </>
      ) : null}
    </div>
  );

  const ratingLine =
    ratingCount > 0 ? (
      <p className="text-xs text-muted">
        <span aria-hidden="true" className="text-accent">
          ★
        </span>{" "}
        {rating.toFixed(1)}
        <span className="sr-only"> / 5</span> · {ratingCount}
      </p>
    ) : null;

  const addButton = (
    <button type="button" className="btn-line w-full" onClick={addToCart}>
      {t("cards.buyNow")}
    </button>
  );

  if (variant === "row") {
    return (
      <article className="grid grid-cols-[88px_1fr] gap-4 sm:grid-cols-[104px_1fr]">
        {cover}
        <div className="flex min-w-0 flex-col">
          <p className="text-base font-semibold leading-snug">
            <Link to={href} className="link-draw">
              {item.name}
            </Link>
          </p>
          {item.author ? (
            <p className="mt-1 text-sm text-muted">{item.author}</p>
          ) : null}
          <div className="mt-2">{priceBlock}</div>
          <div className="mt-auto pt-3 sm:max-w-[180px]">{addButton}</div>
        </div>
      </article>
    );
  }

  return (
    <article className="card flex h-full flex-col">
      {cover}
      <p className="mt-4 text-[15px] font-semibold leading-snug">
        <Link to={href} className="link-draw">
          {item.name}
        </Link>
      </p>
      <div className="mt-2">{priceBlock}</div>
      {ratingLine ? <div className="mt-1">{ratingLine}</div> : null}
      <div className="mt-auto pt-4">{addButton}</div>
    </article>
  );
}

export default Cards;
