import { Link } from "react-router-dom";
import { useCart } from "../context/CartProvider";
import { useAuth } from "../context/AuthProvider";
import { useI18n } from "../context/I18nProvider";
import toast from "react-hot-toast";

function Cards({ item }) {
  const { addItem } = useCart();
  const [authUser] = useAuth();
  const { t } = useI18n();

  const requireLogin = () => {
    toast.error(t("cart.loginRequired"));
    const modal = document.getElementById("my_modal_3");
    if (modal && typeof modal.showModal === "function") modal.showModal();
  };

  return (
    <>
      <div className="group rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700 dark:bg-slate-900 dark:text-white">
        <Link to={`/book/${item._id || item.id}`} className="block">
          <div className="aspect-[3/4] w-full overflow-hidden rounded-t-xl bg-slate-50 dark:bg-slate-800">
            <img
              src={item.image}
              alt={item.name}
              className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
              loading="lazy"
            />
          </div>
        </Link>

        <div className="p-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="line-clamp-2 text-sm font-medium leading-5">
              {item.name}
            </h3>
            {item.category ? (
              <span className="whitespace-nowrap rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-medium text-rose-600 dark:bg-rose-500/20 dark:text-rose-200">
                {item.category}
              </span>
            ) : null}
          </div>
          {item.title ? (
            <p className="mt-1 line-clamp-2 text-xs opacity-70">{item.title}</p>
          ) : null}

          <div className="mt-3 flex items-center justify-between">
            <span className="text-sm font-semibold text-rose-600">
              {Number(item.price || 0).toLocaleString("vi-VN")}đ
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="rounded-full border border-slate-300 px-2.5 py-1 text-xs hover:border-rose-500 hover:text-rose-600 dark:border-slate-600"
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
      </div>
    </>
  );
}

export default Cards;
