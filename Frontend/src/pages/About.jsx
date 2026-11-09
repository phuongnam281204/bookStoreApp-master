import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useI18n } from "../context/I18nProvider";
import { contactInfo } from "../data/contactInfo";

const coverOf = (book) =>
  book?.image ||
  (Array.isArray(book?.images) && book.images.length ? book.images[0] : "");

function About() {
  const { t, lang } = useI18n();
  const [covers, setCovers] = useState([]);

  useEffect(() => {
    axios
      .get("/book")
      .then((res) => {
        const list = (Array.isArray(res.data) ? res.data : [])
          .filter((b) => coverOf(b))
          .sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0))
          .slice(0, 4);
        setCovers(list);
      })
      .catch(() => setCovers([]));
  }, []);

  const vi = lang === "vi";
  const facts = [
    { label: vi ? "Bán gì" : "What we sell", value: t("hero.title") },
    { label: vi ? "Thanh toán" : "Payment", value: t("hero.factNoCount") },
    { label: t("contact.address"), value: contactInfo.address },
    { label: vi ? "Giờ mở cửa" : "Opening hours", value: t("contact.hours") },
  ];

  return (
    <>
      <Navbar />
      <main className="wrap min-h-screen pb-24 pt-28">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <h1 className="font-display text-4xl font-medium md:text-5xl">
              {t("about.title")}
            </h1>
            <p className="mt-6 max-w-2xl font-display text-2xl leading-snug md:text-3xl">
              {t("about.desc")}
            </p>

            <dl className="mt-12 border-t border-line">
              {facts.map((fact) => (
                <div
                  key={fact.label}
                  className="grid gap-1 border-b border-line py-5 sm:grid-cols-[12rem_1fr] sm:gap-6"
                >
                  <dt className="text-sm text-muted">{fact.label}</dt>
                  <dd>{fact.value}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link to="/course" className="btn-solid">
                Xem tất cả sách
              </Link>
              <Link
                to="/contact"
                className="link-draw text-sm font-semibold text-muted hover:text-ink"
              >
                {t("nav.contact")}
              </Link>
            </div>
          </div>

          {covers.length ? (
            <div className="grid grid-cols-2 gap-5 self-start lg:col-span-5">
              {covers.map((book) => (
                <Link
                  key={book._id}
                  to={`/book/${book._id}`}
                  className="group block overflow-hidden rounded-sm bg-surface shadow-[0_1px_2px_rgb(0_0_0/0.06),0_16px_32px_-18px_rgb(0_0_0/0.35)]"
                >
                  <img
                    src={coverOf(book)}
                    alt={book.name}
                    className="aspect-[2/3] w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                    loading="lazy"
                  />
                </Link>
              ))}
            </div>
          ) : null}
        </div>
      </main>
      <Footer />
    </>
  );
}

export default About;
