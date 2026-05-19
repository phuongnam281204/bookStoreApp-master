import { useEffect, useMemo, useRef, useState } from "react";
import Navbar from "../components/Navbar";
import Banner from "../components/Banner";
import Footer from "../components/Footer";
import axios from "axios";
import Cards from "../components/Cards";
import { Link, useNavigate } from "react-router-dom";
import { useI18n } from "../context/I18nProvider";
import WeeklyBestseller from "../components/WeeklyBestseller";

function Home() {
  const [books, setBooks] = useState([]);
  const categoriesRef = useRef(null);
  const [showCategoryArrows, setShowCategoryArrows] = useState(false);
  const navigate = useNavigate();
  const { t } = useI18n();

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get("/book");
        setBooks(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.log(err);
      }
    };

    load();
  }, []);

  const featured = useMemo(() => {
    return (books || [])
      .filter((b) => String(b?.category || "").toLowerCase() !== "free")
      .sort((a, b) => {
        const soldA = Math.max(
          0,
          (Number(a.quantity) || 0) - (Number(a.stock) || 0),
        );
        const soldB = Math.max(
          0,
          (Number(b.quantity) || 0) - (Number(b.stock) || 0),
        );
        return soldB - soldA;
      })
      .slice(0, 5);
  }, [books]);

  const newArrivals = useMemo(() => {
    const now = Date.now();
    const weekMs = 7 * 24 * 60 * 60 * 1000;

    const getCreatedAt = (item) => {
      if (item?.createdAt) return new Date(item.createdAt).getTime();
      const id = String(item?._id || "");
      if (id.length >= 8) {
        const ts = parseInt(id.slice(0, 8), 16);
        if (!Number.isNaN(ts)) return ts * 1000;
      }
      return 0;
    };

    return (books || [])
      .filter((b) => String(b?.category || "").toLowerCase() !== "free")
      .map((b) => ({ ...b, __createdAt: getCreatedAt(b) }))
      .filter((b) => b.__createdAt && now - b.__createdAt <= weekMs)
      .sort((a, b) => b.__createdAt - a.__createdAt)
      .slice(0, 5);
  }, [books]);

  const categories = useMemo(() => {
    const map = new Map();
    (books || []).forEach((b) => {
      const cat = String(b?.category || "").trim();
      if (cat && cat.toLowerCase() !== "free" && !map.has(cat)) {
        const img =
          b?.image ||
          (Array.isArray(b?.images) && b.images.length ? b.images[0] : "");
        map.set(cat, img);
      }
    });
    return Array.from(map.entries())
      .slice(0, 10)
      .map(([name, image]) => ({ name, image }));
  }, [books]);

  const scrollCategories = (direction) => {
    const el = categoriesRef.current;
    if (!el) return;
    const amount = Math.round(el.clientWidth * 0.8);
    el.scrollBy({ left: direction * amount, behavior: "smooth" });
  };

  useEffect(() => {
    const el = categoriesRef.current;
    if (!el) {
      setShowCategoryArrows(false);
      return;
    }

    const checkOverflow = () => {
      setShowCategoryArrows(el.scrollWidth > el.clientWidth + 1);
    };

    checkOverflow();
    window.addEventListener("resize", checkOverflow);
    return () => window.removeEventListener("resize", checkOverflow);
  }, [categories]);

  return (
    <>
      <Navbar />
      <Banner />

      <div
        id="home-categories"
        className="max-w-screen-2xl container mx-auto md:px-20 px-4 mt-10"
      >
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-2xl font-bold">{t("home.featured")}</h2>
          <Link to="/course" className="btn btn-ghost btn-sm">
            {t("home.viewAll")}
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {featured.map((item) => (
            <Cards key={item._id || item.id} item={item} />
          ))}
        </div>
      </div>

      <div className="max-w-screen-2xl container mx-auto md:px-20 px-4 mt-10">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-2xl font-bold">{t("home.newArrivals")}</h2>
          <Link to="/course" className="btn btn-ghost btn-sm">
            {t("home.viewAll")}
          </Link>
        </div>

        {!newArrivals.length ? (
          <p className="mt-4 opacity-70">{t("home.newArrivalsEmpty")}</p>
        ) : (
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {newArrivals.map((item) => (
              <Cards key={item._id || item.id} item={item} />
            ))}
          </div>
        )}
      </div>

      <div className="max-w-screen-2xl container mx-auto md:px-20 px-4 mt-10">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:p-6 dark:border-slate-700 dark:bg-slate-900">
          <div className="mb-6 flex items-center gap-2 text-rose-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-6 w-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z"
              />
            </svg>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">
              {t("home.categories")}
            </h2>
          </div>

          {!categories.length ? (
            <p className="opacity-70">{t("home.categoriesEmpty")}</p>
          ) : (
            <div className="relative">
              {showCategoryArrows ? (
                <button
                  type="button"
                  className="absolute left-0 top-1/2 -translate-y-1/2 rounded-full border border-slate-200 bg-white p-2 shadow-md transition hover:scale-105 hover:shadow-lg dark:border-slate-700 dark:bg-slate-900"
                  aria-label={t("home.categoriesPrev")}
                  onClick={() => scrollCategories(-1)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                  >
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                </button>
              ) : null}

              <div
                ref={categoriesRef}
                className="hide-scrollbar flex gap-4 overflow-x-auto scroll-smooth px-10 pb-2 md:gap-6"
              >
                {categories.map((cat) => (
                  <div
                    key={cat.name}
                    className="group flex w-24 shrink-0 cursor-pointer flex-col items-center gap-3 md:w-28"
                    onClick={() =>
                      navigate(`/course?search=${encodeURIComponent(cat.name)}`)
                    }
                  >
                    <div className="flex aspect-square w-full items-center justify-center overflow-hidden rounded-xl bg-slate-50 transition-shadow duration-300 group-hover:shadow-md dark:bg-slate-800">
                      <img
                        src={cat.image || "/placeholder.png"}
                        alt={cat.name}
                        className="h-[85%] w-[85%] object-contain transition-transform duration-300 group-hover:scale-110"
                        loading="lazy"
                      />
                    </div>
                    <span className="line-clamp-2 text-center text-sm font-medium transition-colors group-hover:text-rose-500">
                      {cat.name}
                    </span>
                  </div>
                ))}
              </div>

              {showCategoryArrows ? (
                <button
                  type="button"
                  className="absolute right-0 top-1/2 -translate-y-1/2 rounded-full border border-slate-200 bg-white p-2 shadow-md transition hover:scale-105 hover:shadow-lg dark:border-slate-700 dark:bg-slate-900"
                  aria-label={t("home.categoriesNext")}
                  onClick={() => scrollCategories(1)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                  >
                    <path d="M9 6l6 6-6 6" />
                  </svg>
                </button>
              ) : null}
            </div>
          )}
        </div>
      </div>

      <WeeklyBestseller books={books} />

      <Footer />
    </>
  );
}

export default Home;
