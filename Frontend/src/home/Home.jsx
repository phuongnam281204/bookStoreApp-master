import { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import Banner from "../components/Banner";
import Footer from "../components/Footer";
import axios from "axios";
import Cards from "../components/Cards";
import { Link } from "react-router-dom";
import { useI18n } from "../context/I18nProvider";
import WeeklyBestseller from "../components/WeeklyBestseller";
import { contactInfo } from "../data/contactInfo";

const isForSale = (book) =>
  String(book?.category || "").toLowerCase() !== "free";

const soldOf = (book) =>
  Math.max(0, (Number(book.quantity) || 0) - (Number(book.stock) || 0));

const coverOf = (book) =>
  book?.image ||
  (Array.isArray(book?.images) && book.images.length ? book.images[0] : "");

const formatVnd = (value) =>
  `${Number(value || 0).toLocaleString("vi-VN")}đ`;

// The kit's motion layer and moment loader live in /public/assets as plain files.
// A full URL keeps Vite from treating them as source modules.
const loadKit = (path) =>
  import(/* @vite-ignore */ new URL(path, window.location.origin).href);

function SectionHead({ title, linkTo, linkLabel, tone = "" }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
      <h2 className="font-display text-[1.875rem] font-normal leading-tight tracking-[-0.01em] lg:text-5xl">
        {title}
      </h2>
      {linkTo ? (
        <Link
          to={linkTo}
          className={`link-draw inline-flex min-h-[44px] items-center text-sm font-semibold ${tone || "text-accent"}`}
        >
          {linkLabel} →
        </Link>
      ) : null}
    </div>
  );
}

function Home() {
  const [books, setBooks] = useState([]);
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

  // The hero entrance and the hover layer (motion.js).
  useEffect(() => {
    loadKit("/assets/motion/motion.js")
      .then((m) => m.refresh?.())
      .catch(() => {});
  }, []);

  const forSale = useMemo(() => (books || []).filter(isForSale), [books]);

  const featured = useMemo(
    () =>
      forSale
        .slice()
        .sort((a, b) => soldOf(b) - soldOf(a))
        .slice(0, 6),
    [forSale],
  );

  const newArrivals = useMemo(() => {
    const getCreatedAt = (item) => {
      if (item?.createdAt) return new Date(item.createdAt).getTime();
      const id = String(item?._id || "");
      if (id.length >= 8) {
        const ts = parseInt(id.slice(0, 8), 16);
        if (!Number.isNaN(ts)) return ts * 1000;
      }
      return 0;
    };
    const featuredIds = new Set(featured.map((b) => b._id));
    return forSale
      .filter((b) => !featuredIds.has(b._id) && coverOf(b))
      .map((b) => ({ ...b, __createdAt: getCreatedAt(b) }))
      .sort((a, b) => b.__createdAt - a.__createdAt)
      .slice(0, 6);
  }, [forSale, featured]);

  const genres = useMemo(() => {
    const map = new Map();
    forSale.forEach((b) => {
      const cat = String(b?.category || "").trim();
      if (!cat) return;
      const entry = map.get(cat) || { name: cat, count: 0, top: null };
      entry.count += 1;
      if (coverOf(b) && (!entry.top || soldOf(b) > soldOf(entry.top)))
        entry.top = b;
      map.set(cat, entry);
    });
    return Array.from(map.values())
      .filter((g) => g.top)
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [forSale]);

  // Each cover is shown once on the page: genres take a book no other section shows.
  const genreTiles = useMemo(() => {
    const used = new Set(
      [...featured, ...newArrivals].map((b) => b._id),
    );
    return genres.map((g) => {
      const pick =
        forSale
          .filter(
            (b) =>
              String(b.category || "").trim() === g.name &&
              coverOf(b) &&
              !used.has(b._id),
          )
          .sort((a, b) => soldOf(b) - soldOf(a))[0] || g.top;
      used.add(pick._id);
      return { ...g, top: pick };
    });
  }, [genres, featured, newArrivals, forSale]);

  return (
    <>
      <Navbar />
      <main>
        <Banner books={books} />

        <section
          id="bestselling"
          className="sec"
          style={{ "--h": 1, "--hm": 2 }}
        >
          <div className="wrap">
            <SectionHead
              title={t("home.featured")}
              linkTo="/course"
              linkLabel={t("home.allBooks")}
            />
            <ul className="mt-8 grid grid-cols-2 gap-x-3 gap-y-8 lg:mt-10 lg:grid-cols-12 lg:gap-x-6">
              {featured.map((item) => (
                <li key={item._id || item.id} className="lg:col-span-2">
                  <Cards item={item} />
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section
          id="new"
          className="sec bg-surface"
          style={{ "--h": 1, "--hm": 2 }}
        >
          <div className="wrap">
            <SectionHead
              title={t("home.newArrivals")}
              linkTo="/course"
              linkLabel={t("home.viewAll")}
            />
            {!newArrivals.length ? (
              <p className="mt-8 text-muted">{t("home.newArrivalsEmpty")}</p>
            ) : (
              <div className="mt-8 grid gap-6 lg:mt-10 lg:grid-cols-12 lg:gap-x-6 lg:gap-y-8">
                <ol className="lg:col-span-6">
                  {newArrivals.map((item) => (
                    <li key={item._id} className="border-b border-line">
                      <Link
                        to={`/book/${item._id}`}
                        className="group grid grid-cols-[1fr_auto] items-baseline gap-x-6 py-2.5 lg:py-3"
                      >
                        <span className="min-w-0">
                          <span className="link-draw font-semibold leading-snug">
                            {item.name}
                          </span>
                          {item.author ? (
                            <span className="mt-0.5 block text-sm text-muted">
                              {item.author}
                            </span>
                          ) : null}
                        </span>
                        <span className="text-sm font-semibold">
                          {formatVnd(item.price)}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ol>
                <ul className="grid grid-cols-2 gap-3 rounded-md bg-paper p-3 lg:col-span-6 lg:grid-cols-3 lg:gap-6 lg:p-6">
                  {newArrivals.map((item) => (
                    <li
                      key={item._id}
                      
                    >
                      <Link
                        to={`/book/${item._id}`}
                        className="card m-zoom group block overflow-hidden rounded-sm bg-paper shadow-[0_1px_2px_rgb(0_0_0/0.06),0_10px_24px_-14px_rgb(0_0_0/0.3)]"
                        aria-label={item.name}
                      >
                        <img
                          src={coverOf(item)}
                          alt=""
                          className="aspect-[2/3] w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                          loading="lazy"
                        />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>

        <section
          id="home-categories"
          className="sec"
          style={{ "--h": 1, "--hm": 2 }}
        >
          <div className="wrap">
            <SectionHead
              title={t("home.byCategory")}
              linkTo="/course"
              linkLabel={t("home.allBooks")}
            />
            {!genreTiles.length ? (
              <p className="mt-8 text-muted">{t("home.categoriesEmpty")}</p>
            ) : (
              <ul className="mt-8 grid grid-cols-2 gap-x-3 gap-y-12 lg:mt-10 lg:grid-cols-12 lg:gap-x-6 lg:gap-y-8">
                {genreTiles.map((genre) => (
                  <li key={genre.name} className="lg:col-span-2">
                    <Link
                      to={`/course?search=${encodeURIComponent(genre.name)}`}
                      className="card group block"
                    >
                      <span className="block overflow-hidden rounded-sm bg-surface shadow-[0_1px_2px_rgb(0_0_0/0.06),0_10px_24px_-14px_rgb(0_0_0/0.3)]">
                        <img
                          src={coverOf(genre.top)}
                          alt=""
                          className="aspect-[3/5] w-full object-cover transition duration-300 group-hover:scale-[1.03] lg:aspect-[2/3]"
                          loading="lazy"
                        />
                      </span>
                      <span className="mt-4 block font-display text-xl leading-snug transition-colors group-hover:text-accent">
                        {genre.name}
                      </span>
                      <span className="mt-1 block text-sm text-muted">
                        {t("home.categoryCount", { count: genre.count })}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            <Link to="/course" className="btn-solid mt-10 w-full lg:hidden">
              {t("home.allBooks")}
            </Link>
          </div>
        </section>

        <WeeklyBestseller books={books} />

        <section id="visit" className="sec !h-auto min-h-[100svh]" style={{ "--h": 1, "--hm": 2 }}>
          <div className="wrap">
            <h2 className="font-display text-[1.875rem] font-normal leading-tight tracking-[-0.01em] lg:text-5xl">
              {t("visit.title")}
            </h2>
            <div className="mt-8 grid gap-8 lg:mt-10 lg:grid-cols-12 lg:gap-x-12">
              <div className="flex flex-col lg:col-span-5">
                <p className="text-lg leading-relaxed">{t("about.desc")}</p>
                <dl className="mt-6 border-t border-line">
                  {[
                    [t("visit.shipping"), t("visit.shippingValue")],
                    [t("visit.payment"), t("hero.factNoCount")],
                    [t("visit.hours"), t("contact.hours")],
                    [t("visit.office"), contactInfo.address],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="grid gap-1 border-b border-line py-4 sm:grid-cols-[7.5rem_1fr] sm:gap-4"
                    >
                      <dt className="text-sm text-muted">{label}</dt>
                      <dd>{value}</dd>
                    </div>
                  ))}
                </dl>
                <div className="mt-8 lg:mt-auto lg:pt-8">
                  <Link to="/contact" className="btn-solid">
                    {t("visit.contact")}
                  </Link>
                </div>
              </div>
              <div className="relative h-[380px] overflow-hidden rounded-md border border-line bg-surface lg:col-span-7 lg:h-auto lg:min-h-[460px]">
                <iframe
                  title={`${t("visit.mapTitle")}: ${contactInfo.address}`}
                  src={contactInfo.mapSrc}
                  className="absolute inset-0 block h-full w-full"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

export default Home;
