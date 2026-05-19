import banner from "../../public/Banner.png";
import { useI18n } from "../context/I18nProvider";
function Banner() {
  const { t } = useI18n();

  return (
    <>
      <div className="max-w-screen-2xl container mx-auto md:px-20 px-4 flex flex-col md:flex-row pt-28 pb-10">
        <div className="w-full order-2 md:order-1 md:w-1/2 mt-8">
          <div className="space-y-8">
            <h1 className="text-2xl md:text-4xl font-bold">
              {t("banner.title")}{" "}
              <span className="text-pink-500">bookStore</span>
            </h1>
            <p className="text-2xl md:text-3xl">
              {t("banner.taglineBefore")}{" "}
              <span className="text-pink-500">
                {t("banner.taglineHighlight")}
              </span>{" "}
              {t("banner.taglineAfter")}
            </p>
            <p className="text-sm md:text-xl">{t("banner.subtitle")}</p>
          </div>
          <div className="flex flex-wrap gap-3 mt-6">
            <button
              type="button"
              className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-rose-500 via-pink-500 to-fuchsia-500 px-6 py-3 text-sm font-semibold text-white shadow-md transition duration-300 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300"
              onClick={() => {
                const el = document.getElementById("home-categories");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
            >
              <span>{t("banner.ctaCategories")}</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1"
              >
                <path d="M4 4h7v7H4z" />
                <path d="M13 4h7v7h-7z" />
                <path d="M4 13h7v7H4z" />
                <path d="M13 13h7v7h-7z" />
              </svg>
            </button>
          </div>
        </div>
        <div className="order-1 w-full md:w-1/2 mt-8">
          <img
            src={banner}
            className="md:w-[550px] md:h-[460px] md:ml-12"
            alt=""
          />
        </div>
      </div>
    </>
  );
}

export default Banner;
