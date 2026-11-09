import { useEffect, useState, useMemo } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import axios from "axios";
import { Link } from "react-router-dom";

function Leaderboard() {
  const [books, setBooks] = useState([]);
  const [activeTab, setActiveTab] = useState("");

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const res = await axios.get("/book");
        setBooks(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchBooks();
  }, []);

  const categories = useMemo(() => {
    const cats = new Set();
    (books || []).forEach((b) => {
      if (b.category && b.category.toLowerCase() !== "free") {
        cats.add(b.category);
      }
    });
    return Array.from(cats);
  }, [books]);

  useEffect(() => {
    if (categories.length > 0 && !activeTab) {
      setActiveTab(categories[0]);
    }
  }, [categories, activeTab]);

  const topBooks = useMemo(() => {
    if (!activeTab) return [];
    const filtered = (books || []).filter((b) => b.category === activeTab);
    return filtered
      .sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0))
      .slice(0, 10);
  }, [books, activeTab]);

  return (
    <>
      <Navbar />
      <main className="wrap min-h-screen pb-24 pt-28">
        <div className="border-b border-line pb-6">
          <h1 className="font-display text-4xl font-medium md:text-5xl">
            Sách bán chạy theo thể loại
          </h1>
          <p className="mt-2 text-muted">
            Mười cuốn bán nhiều nhất của từng kệ.
          </p>
        </div>

        <div
          role="tablist"
          aria-label="Thể loại"
          className="hide-scrollbar mt-6 flex gap-6 overflow-x-auto border-b border-line"
        >
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              role="tab"
              aria-selected={activeTab === cat}
              onClick={() => setActiveTab(cat)}
              className={`-mb-px min-h-[44px] whitespace-nowrap border-b-2 pb-3 text-sm font-semibold transition-colors ${
                activeTab === cat
                  ? "border-accent text-ink"
                  : "border-transparent text-muted hover:text-ink"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {topBooks.length === 0 ? (
          <p className="py-16 text-muted">Kệ này chưa có số liệu bán.</p>
        ) : (
          <ol className="mt-4 grid lg:grid-cols-2 lg:gap-x-16">
            {topBooks.map((book, index) => (
              <li key={book._id} className="border-b border-line">
                <Link
                  to={`/book/${book._id}`}
                  className="group grid grid-cols-[3rem_64px_1fr] items-center gap-5 py-5"
                >
                  <span
                    className={`font-display text-4xl font-medium tabular-nums ${
                      index < 3 ? "text-accent" : "text-muted"
                    }`}
                  >
                    {index + 1}
                  </span>
                  <span className="block overflow-hidden rounded-sm bg-surface shadow-[0_1px_2px_rgb(0_0_0/0.06),0_10px_24px_-14px_rgb(0_0_0/0.3)]">
                    {book.image ? (
                      <img
                        src={book.image}
                        alt=""
                        className="aspect-[2/3] w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                        loading="lazy"
                      />
                    ) : (
                      <span className="block aspect-[2/3] w-full" />
                    )}
                  </span>
                  <span className="min-w-0">
                    <span className="link-draw line-clamp-2 font-semibold leading-snug">
                      {book.name}
                    </span>
                    <span className="mt-1 block truncate text-sm text-muted">
                      {book.author || "Nhiều tác giả"}
                    </span>
                    <span className="mt-1 block text-sm text-muted">
                      {(book.soldCount || 0).toLocaleString("vi-VN")} cuốn đã bán
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        )}
      </main>
      <Footer />
    </>
  );
}

export default Leaderboard;
