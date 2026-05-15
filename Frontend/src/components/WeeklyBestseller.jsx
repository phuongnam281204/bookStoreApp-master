import { useState, useMemo } from "react";
import { Link } from "react-router-dom";

function WeeklyBestseller({ books }) {
  const [activeTab, setActiveTab] = useState("Tất cả");
  const [hoveredBook, setHoveredBook] = useState(null);

  // Extract unique categories for tabs
  const categories = useMemo(() => {
    const cats = new Set();
    (books || []).forEach((b) => {
      if (b.category && b.category.toLowerCase() !== "free") {
        cats.add(b.category);
      }
    });
    return ["Tất cả", ...Array.from(cats)].slice(0, 9); // Limit tabs
  }, [books]);

  // Get top 5 books for active tab
  const topBooks = useMemo(() => {
    let filtered = books || [];
    if (activeTab !== "Tất cả") {
      filtered = filtered.filter((b) => b.category === activeTab);
    }
    
    // Sort by soldCount descending
    return filtered
      .sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0))
      .slice(0, 5);
  }, [books, activeTab]);

  // Default to first book if none hovered
  const displayBook = hoveredBook || topBooks[0];

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price || 0);
  };

  return (
    <div className="max-w-screen-2xl container mx-auto md:px-20 px-4 mt-10">
      <div className="bg-white border border-slate-200 shadow-sm dark:bg-slate-900 dark:border-slate-700">
        {/* Header */}
        <div className="bg-slate-800 text-white p-4">
          <h2 className="text-xl font-bold uppercase tracking-wide">Bảng xếp hạng bán chạy tuần</h2>
        </div>

        {/* Tabs */}
        <div className="border-b border-slate-200 dark:border-slate-700">
          <div className="flex overflow-x-auto hide-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setActiveTab(cat);
                  setHoveredBook(null);
                }}
                className={`whitespace-nowrap px-6 py-3 font-medium text-sm transition-colors relative ${
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

        <div className="p-6">
          {topBooks.length === 0 ? (
            <p className="text-center text-slate-500 py-10">Chưa có dữ liệu</p>
          ) : (
            <div className="flex flex-col md:flex-row gap-8">
              {/* Left Column: List */}
              <div className="md:w-1/2 flex flex-col gap-4">
                {topBooks.map((book, index) => (
                  <div
                    key={book._id}
                    onMouseEnter={() => setHoveredBook(book)}
                    className={`flex gap-4 p-3 rounded-lg cursor-pointer transition-colors ${
                      displayBook?._id === book._id
                        ? "bg-slate-50 dark:bg-slate-800"
                        : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    }`}
                  >
                    <div className="flex flex-col items-center justify-center font-bold text-xl min-w-[30px]">
                      <span className="text-slate-800 dark:text-white">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="text-green-500 text-sm">↑</span>
                    </div>
                    
                    <div className="w-16 h-24 shrink-0 rounded overflow-hidden border border-slate-200 dark:border-slate-700 bg-white">
                      <img
                        src={book.image || "/placeholder.png"}
                        alt={book.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <div className="flex flex-col justify-center">
                      <h3 className="font-semibold text-slate-800 dark:text-white line-clamp-2">
                        {book.name}
                      </h3>
                      <p className="text-sm text-slate-500 mt-1">
                        {book.author || "Nhiều tác giả"}
                      </p>
                      <p className="text-sm text-blue-500 mt-1 font-medium">
                        {(book.soldCount || 0) * 5} điểm
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Right Column: Detail */}
              {displayBook && (
                <div className="md:w-1/2 md:border-l md:border-slate-200 dark:md:border-slate-700 md:pl-8 flex flex-col sm:flex-row gap-6">
                  <div className="w-full sm:w-1/3 shrink-0">
                    <div className="rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-white shadow-sm">
                      <img
                        src={displayBook.image || "/placeholder.png"}
                        alt={displayBook.name}
                        className="w-full h-auto object-contain"
                      />
                    </div>
                  </div>
                  
                  <div className="w-full sm:w-2/3 flex flex-col">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                      {displayBook.name}
                    </h3>
                    <div className="text-sm text-slate-600 dark:text-slate-400 mt-2 space-y-1">
                      <p>Tác giả: <span className="font-medium text-slate-800 dark:text-slate-200">{displayBook.author || "Đang cập nhật"}</span></p>
                      <p>Nhà xuất bản: <span className="font-medium text-slate-800 dark:text-slate-200">{displayBook.publisher || "Đang cập nhật"}</span></p>
                    </div>

                    <div className="mt-4 flex items-end gap-3">
                      <span className="text-2xl font-bold text-red-500">
                        {formatPrice(displayBook.price)}
                      </span>
                      {displayBook.price < 155000 && (
                        <>
                          <span className="text-sm text-slate-500 line-through mb-1">
                            {formatPrice(Math.round(displayBook.price * 1.3))}
                          </span>
                          <span className="text-xs font-medium text-white bg-red-500 px-2 py-0.5 rounded mb-1">
                            -30%
                          </span>
                        </>
                      )}
                    </div>

                    <div className="mt-6">
                      <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-[10] whitespace-pre-wrap leading-relaxed">
                        {displayBook.title ? (
                          displayBook.title === displayBook.title.toUpperCase() ?
                            displayBook.title.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, c => c.toUpperCase()) :
                            displayBook.title
                        ) : "Chưa có mô tả chi tiết cho sản phẩm này."}
                      </p>
                    </div>


                  </div>
                </div>
              )}
            </div>
          )}

          <div className="mt-8 text-center">
            <Link
              to="/bestsellers"
              className="inline-block px-8 py-2 border-2 border-red-500 text-red-500 font-medium rounded hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
            >
              Xem thêm
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WeeklyBestseller;
