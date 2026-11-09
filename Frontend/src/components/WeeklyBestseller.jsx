import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useI18n } from "../context/I18nProvider";

const formatPrice = (price) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price || 0);

// One screen on the dark ground: the five best sellers as a list on the left,
// the one under the pointer (the first at rest) as its cover on the right.
function WeeklyBestseller({ books }) {
  const { t } = useI18n();
  const [hoveredId, setHoveredId] = useState(null);

  const topBooks = useMemo(
    () =>
      (books || [])
        .filter((b) => String(b?.category || "").toLowerCase() !== "free")
        .slice()
        .sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0))
        .slice(0, 5),
    [books],
  );

  const displayBook =
    topBooks.find((b) => b._id === hoveredId) || topBooks[0] || null;

  return (
    <section
      id="weekly"
      className="sec bg-ink text-paper"
      style={{ "--h": 1, "--hm": 2 }}
    >
      <div className="wrap">
        <h2 className="font-display text-[1.875rem] font-normal leading-tight tracking-[-0.01em] lg:text-5xl">
          {t("weekly.title")}
        </h2>

        {topBooks.length === 0 ? (
          <p className="mt-10 text-paper/70">{t("weekly.empty")}</p>
        ) : (
          <div className="mt-8 grid gap-6 lg:mt-10 lg:grid-cols-12">
            <div className="lg:col-span-6">
              <ol>
                {topBooks.map((book, index) => {
                  const active = displayBook?._id === book._id;
                  return (
                    <li key={book._id} className="border-b border-paper/15">
                      <Link
                        to={`/book/${book._id}`}
                        onMouseEnter={() => setHoveredId(book._id)}
                        onFocus={() => setHoveredId(book._id)}
                        className={`grid grid-cols-[2.5rem_1fr] items-baseline gap-x-4 py-4 transition-colors ${
                          active
                            ? "text-paper"
                            : "text-paper/70 hover:text-paper"
                        }`}
                      >
                        <span className="font-display text-3xl tabular-nums">
                          {index + 1}
                        </span>
                        <span className="min-w-0">
                          <span className="block font-semibold leading-snug">
                            {book.name}
                          </span>
                          <span className="mt-1 block text-sm text-paper/60">
                            {book.author || t("weekly.manyAuthors")} ·{" "}
                            {t("weekly.sold", {
                              count: (book.soldCount || 0).toLocaleString(
                                "vi-VN",
                              ),
                            })}
                          </span>
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ol>
              <Link
                to="/bestsellers"
                className="link-draw mt-6 inline-flex min-h-[44px] items-center text-sm font-semibold text-paper/80 hover:text-paper"
              >
                {t("weekly.more")} →
              </Link>
            </div>

            {displayBook ? (
              <Link
                to={`/book/${displayBook._id}`}
                className="group relative flex h-[640px] items-center justify-center overflow-hidden bg-paper/[0.06] lg:col-span-6 lg:h-[560px]"
                aria-label={`${displayBook.name}, ${formatPrice(displayBook.price)}`}
              >
                {displayBook.image ? (
                  <img
                    src={displayBook.image}
                    alt={displayBook.name}
                    className="h-[82%] w-auto rounded-sm object-contain shadow-[0_24px_48px_-20px_rgb(0_0_0/0.6)] transition duration-300 group-hover:scale-[1.03]"
                  />
                ) : null}
              </Link>
            ) : null}
          </div>
        )}
      </div>
    </section>
  );
}

export default WeeklyBestseller;
