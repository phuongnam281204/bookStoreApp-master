import banner from "../../public/Banner.png";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "../context/I18nProvider";
function Banner() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [q, setQ] = useState("");

  const submit = (e) => {
    e?.preventDefault?.();
    const term = q.trim();
    if (!term) return;
    navigate(`/course?search=${encodeURIComponent(term)}`);
  };

  return (
    <>
      <div className="max-w-screen-2xl container mx-auto md:px-20 px-4 flex flex-col md:flex-row pt-28 pb-10">
        <div className="w-full order-2 md:order-1 md:w-1/2 mt-8">
          <div className="space-y-8">
            <h1 className="text-2xl md:text-4xl font-bold">
              {t("banner.title")}{" "}
              <span className="text-pink-500">bookStore</span>
            </h1>
            <p className="text-sm md:text-xl">{t("banner.subtitle")}</p>

            <form onSubmit={submit} className="w-full">
              <label className="input input-bordered flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-5 h-5 opacity-70"
                >
                  <path
                    fillRule="evenodd"
                    d="M9 3a6 6 0 1 0 3.472 10.89l3.319 3.319a1 1 0 0 0 1.415-1.414l-3.319-3.32A6 6 0 0 0 9 3Zm-4 6a4 4 0 1 1 8 0 4 4 0 0 1-8 0Z"
                    clipRule="evenodd"
                  />
                </svg>
                <input
                  type="text"
                  className="grow"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder={t("nav.search")}
                />
              </label>
            </form>
          </div>
          <div className="flex flex-wrap gap-3 mt-6">
            <button
              className="btn btn-secondary"
              type="button"
              onClick={() => navigate("/course")}
            >
              {t("banner.ctaFeatured")}
            </button>
            <button
              className="btn"
              type="button"
              onClick={() => {
                const el = document.getElementById("home-categories");
                if (el) el.scrollIntoView();
              }}
            >
              {t("banner.ctaCategories")}
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
