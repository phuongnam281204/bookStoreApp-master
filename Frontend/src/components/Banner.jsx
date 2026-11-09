import { useI18n } from "../context/I18nProvider";

// The hero: the greeting, the tagline and one action on the left, the
// book-stack illustration on the right. Colours come from the site palette.
function Banner() {
  const { t } = useI18n();

  const scrollToCategories = () => {
    const el = document.getElementById("home-categories");
    if (el) el.scrollIntoView();
  };

  return (
    <section className="hero sec" data-enter style={{ "--h": 1 }}>
      <div className="wrap">
        <div className="grid h-full content-center items-center gap-10 md:grid-cols-2 md:gap-8">
          <div className="order-2 md:order-1">
            <h1 className="font-display text-[2rem] font-medium leading-[1.1] sm:text-5xl xl:text-[3.5rem]">
              {t("banner.title")} <span className="text-accent">bookStore</span>
            </h1>
            <p className="mt-6 text-2xl leading-snug md:text-3xl">
              {t("banner.taglineBefore")}{" "}
              <span className="text-accent">{t("banner.taglineHighlight")}</span>{" "}
              {t("banner.taglineAfter")}
            </p>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-muted md:text-lg">
              {t("banner.subtitle")}
            </p>
            <div className="mt-8">
              <button
                type="button"
                onClick={scrollToCategories}
                className="btn-solid group rounded-full px-7 shadow-md"
              >
                {t("banner.ctaCategories")}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1"
                  aria-hidden="true"
                >
                  <path d="M4 4h7v7H4z" />
                  <path d="M13 4h7v7h-7z" />
                  <path d="M4 13h7v7H4z" />
                  <path d="M13 13h7v7h-7z" />
                </svg>
              </button>
            </div>
          </div>

          <div className="hero__art order-1 flex justify-center md:order-2 md:justify-end">
            <img
              src="/Banner.png"
              width="460"
              height="356"
              alt=""
              decoding="async"
              className="h-auto w-full max-w-[300px] sm:max-w-[420px] lg:max-w-[540px]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export default Banner;
