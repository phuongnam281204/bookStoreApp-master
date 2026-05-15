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
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pt-28 pb-12">
        <div className="max-w-screen-xl mx-auto md:px-20 px-4">
          <div className="bg-white border border-slate-200 shadow-sm dark:bg-slate-800 dark:border-slate-700">
            {/* Header */}
            <div className="bg-slate-800 text-white p-6">
              <h1 className="text-xl font-bold uppercase tracking-wide">Bảng xếp hạng bán chạy tuần</h1>
            </div>

            {/* Tabs */}
            <div className="border-b border-slate-200 dark:border-slate-700">
              <div className="flex overflow-x-auto hide-scrollbar">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveTab(cat)}
                    className={`whitespace-nowrap px-6 py-4 font-medium text-sm transition-colors relative ${
                      activeTab === cat
                        ? "text-red-500"
                        : "text-slate-600 dark:text-slate-400 hover:text-rose-500"
                    }`}
                  >
                    {cat}
                    {activeTab === cat && (
                      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-red-500"></span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* List */}
            <div className="p-0">
              {topBooks.length === 0 ? (
                <p className="text-center text-slate-500 py-10">Chưa có dữ liệu</p>
              ) : (
                <div className="flex flex-col divide-y divide-slate-100 dark:divide-slate-700">
                  {topBooks.map((book, index) => (
                    <Link
                      to={`/book/${book._id}`}
                      key={book._id}
                      className="flex gap-6 p-6 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                    >
                      <div className="flex flex-col items-center justify-center font-bold text-xl md:text-2xl min-w-[40px]">
                        <span className="text-slate-800 dark:text-white">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span className="text-green-500 text-base md:text-lg">↑</span>
                      </div>
                      
                      <div className="w-20 h-28 shrink-0 rounded overflow-hidden border border-slate-200 dark:border-slate-600 bg-white shadow-sm">
                        <img
                          src={book.image || "/placeholder.png"}
                          alt={book.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      <div className="flex flex-col justify-center">
                        <h3 className="text-base md:text-lg font-semibold text-slate-800 dark:text-white line-clamp-2">
                          {book.name}
                        </h3>
                        <p className="text-sm text-slate-500 mt-1 md:mt-2">
                          {book.author || "Nhiều tác giả"}
                        </p>
                        <p className="text-sm text-blue-500 mt-1 md:mt-2 font-medium">
                          {(book.soldCount || 0) * 5} điểm
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default Leaderboard;
