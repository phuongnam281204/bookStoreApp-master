import { useCart } from "../context/CartProvider";
import { useI18n } from "../context/I18nProvider";

function Cards({ item }) {
  const { addItem } = useCart();
  const { t } = useI18n();

  return (
    <>
      <div className="mt-4 my-3 p-3">
        <div className="card w-92 bg-base-100 shadow-xl hover:scale-105 duration-200 dark:bg-slate-900 dark:text-white dark:border">
          <figure>
            <img src={item.image} alt={item.name} />
          </figure>
          <div className="card-body">
            <h2 className="card-title">
              {item.name}
              <div className="badge badge-secondary">{item.category}</div>
            </h2>
            <p>{item.title}</p>
            <div className="card-actions justify-between">
              <div className="badge badge-outline">${item.price}</div>
              <button
                type="button"
                className="cursor-pointer px-2 py-1 rounded-full border-[2px] hover:bg-pink-500 hover:text-white duration-200"
                onClick={() => addItem(item)}
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
