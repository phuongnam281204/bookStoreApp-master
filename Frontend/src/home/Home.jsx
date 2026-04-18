import { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import Banner from "../components/Banner";
import Freebook from "../components/Freebook";
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
      .slice(0, 8);
  }, [books]);

  const categories = useMemo(() => {
    const list = (books || [])
      .map((b) => String(b?.category || "").trim())
      .filter(Boolean)
      .filter((c) => c.toLowerCase() !== "free");
    return Array.from(new Set(list)).slice(0, 12);
  }, [books]);

  return (
    <>
      <Navbar />
      <Banner />
      <Freebook />

      <div className="max-w-screen-2xl container mx-auto md:px-20 px-4 mt-10">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-xl font-semibold">{t("home.featured")}</h2>
          <Link to="/course" className="btn btn-ghost btn-sm">
            {t("home.viewAll")}
          </Link>
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
          {featured.map((item) => (
            <Cards key={item._id || item.id} item={item} />
          ))}
        </div>
      </div>

      <div className="max-w-screen-2xl container mx-auto md:px-20 px-4 mt-10">
        <h2 className="text-xl font-semibold">{t("home.categories")}</h2>

        {!categories.length ? (
          <p className="mt-3 opacity-70">{t("home.categoriesEmpty")}</p>
        ) : (
          <div className="mt-4 flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() =>
                  navigate(`/course?search=${encodeURIComponent(cat)}`)
                }
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </>
  );
}

export default Home;
