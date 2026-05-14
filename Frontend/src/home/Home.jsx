import { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import Banner from "../components/Banner";
import Footer from "../components/Footer";
import axios from "axios";
import Cards from "../components/Cards";
import { Link, useNavigate } from "react-router-dom";
import { useI18n } from "../context/I18nProvider";

function Home() {
  const [books, setBooks] = useState([]);
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
        const soldA = Math.max(0, (Number(a.quantity) || 0) - (Number(a.stock) || 0));
        const soldB = Math.max(0, (Number(b.quantity) || 0) - (Number(b.stock) || 0));
        return soldB - soldA;
      })
      .slice(0, 5);
  }, [books]);

  const categories = useMemo(() => {
    const map = new Map();
    (books || []).forEach(b => {
      const cat = String(b?.category || "").trim();
      if (cat && cat.toLowerCase() !== "free" && !map.has(cat)) {
        const img = b?.image || (Array.isArray(b?.images) && b.images.length ? b.images[0] : "");
        map.set(cat, img);
      }
    });
    return Array.from(map.entries()).slice(0, 10).map(([name, image]) => ({ name, image }));
  }, [books]);

  return (
    <>
      <Navbar />
      <Banner />

      <div className="max-w-screen-2xl container mx-auto md:px-20 px-4 mt-10">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-xl font-semibold">{t("home.featured")}</h2>
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
            <div className="hide-scrollbar flex gap-4 overflow-x-auto pb-2 md:gap-6">
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
          )}
        </div>
      </div>

      <Footer />
    </>
  );
}

export default Home;
