import { useEffect, useMemo, useState } from "react";
import Cards from "./Cards";
import axios from "axios";
import { useSearchParams } from "react-router-dom";
import { useI18n } from "../context/I18nProvider";

function Course() {
  const [book, setBook] = useState([]);
  const [searchParams] = useSearchParams();
  const { t } = useI18n();

  const [selectedGroups, setSelectedGroups] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [selectedAges, setSelectedAges] = useState([]);
  const [priceRange, setPriceRange] = useState("all");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const groupOptions = useMemo(() => {
    const list = (book || []).map((b) => String(b?.category || "").trim()).filter(Boolean);
    return Array.from(new Set(list));
  }, [book]);

  const priceOptions = [
    { value: "all", label: "Tất cả" },
    { value: "lt50", label: "Dưới 50.000đ", min: 0, max: 50000 },
    { value: "50-150", label: "50.000đ - 150.000đ", min: 50000, max: 150000 },
    {
      value: "150-300",
      label: "150.000đ - 300.000đ",
      min: 150000,
      max: 300000,
    },
    { value: "gt300", label: "Trên 300.000đ", min: 300000, max: Infinity },
  ];

  const genreOptions = [
    "Comedy",
    "Fantasy",
    "Drama",
    "Action",
    "Romance",
    "Horror",
    "School Life",
    "Slice of Life",
  ];

  const ageOptions = ["3+", "6+", "10+", "13+", "16+", "18+"];

  const q = (searchParams.get("search") || "").trim().toLowerCase();

  const filteredBooks = useMemo(() => {
    const normalize = (value) => String(value || "").toLowerCase();
    const hasMatch = (target, list) =>
      list.some((item) => normalize(target).includes(normalize(item)));

    return book.filter((item) => {
      const haystack =
        `${item.name || ""} ${item.title || ""} ${item.category || ""}`
          .toLowerCase()
          .trim();
      if (q && !haystack.includes(q)) return false;

      if (selectedGroups.length) {
        const groupText = `${item.category || ""} ${item.group || ""}`;
        if (!hasMatch(groupText, selectedGroups)) return false;
      }

      if (priceRange !== "all") {
        const price = Number(item?.price || 0);
        const range = priceOptions.find((opt) => opt.value === priceRange);
        if (!range) return false;
        if (price < range.min || price > range.max) return false;
      }

      if (selectedGenres.length) {
        const genreValues = [];
        if (Array.isArray(item?.genres)) genreValues.push(...item.genres);
        if (item?.genre) genreValues.push(item.genre);
        if (!genreValues.length && item?.category)
          genreValues.push(item.category);
        const genreText = genreValues.join(" ");
        if (!hasMatch(genreText, selectedGenres)) return false;
      }

      if (selectedAges.length) {
        const ageText = `${item?.age || ""} ${item?.ageGroup || ""}`;
        if (!hasMatch(ageText, selectedAges)) return false;
      }

      return true;
    });
  }, [book, q, priceRange, selectedAges, selectedGenres, selectedGroups]);

  const totalPages = Math.max(1, Math.ceil(filteredBooks.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pagedBooks = filteredBooks.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const paginationItems = useMemo(() => {
    const items = [];
    const maxVisible = 5;
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i += 1) items.push(i);
      return items;
    }

    const left = Math.max(1, currentPage - 1);
    const right = Math.min(totalPages, currentPage + 1);

    items.push(1);
    if (left > 2) items.push("...");
    for (let i = left; i <= right; i += 1) {
      if (i !== 1 && i !== totalPages) items.push(i);
    }
    if (right < totalPages - 1) items.push("...");
    items.push(totalPages);

    return items;
  }, [currentPage, totalPages]);

  useEffect(() => {
    const getBook = async () => {
      try {
        const res = await axios.get("/book");
        setBook(res.data);
      } catch (error) {
        console.log(error);
      }
    };
    getBook();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [q, priceRange, selectedAges, selectedGenres, selectedGroups]);

  const toggleFilter = (value, setter) => {
    setter((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value],
    );
  };

  const resetFilters = () => {
    setSelectedGroups([]);
    setSelectedGenres([]);
    setSelectedAges([]);
    setPriceRange("all");
  };

  return (
    <>
      <div className=" max-w-screen-2xl container mx-auto md:px-20 px-4">
        <div className="mt-28">
          <h1 className="text-2xl md:text-4xl font-bold">{t("nav.course")}</h1>
          {q ? (
            <p className="mt-3 opacity-80">
              {t("course.searchResults", {
                count: filteredBooks.length,
                q,
              })}
            </p>
          ) : null}
        </div>

        {q && filteredBooks.length === 0 ? (
          <p className="mt-8 opacity-80">{t("course.empty")}</p>
        ) : null}

        <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[260px,1fr]">
          <aside className="self-start lg:sticky lg:top-28 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold">Bộ lọc</h2>
              <button
                type="button"
                className="text-xs font-semibold text-rose-600"
                onClick={resetFilters}
              >
                Xóa
              </button>
            </div>

            <div className="mt-5 space-y-6 text-sm">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Nhóm sản phẩm
                </h3>
                <div className="mt-3 space-y-2">
                  {groupOptions.map((group) => (
                    <label key={group} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-slate-300 text-rose-500 focus:ring-rose-500"
                        checked={selectedGroups.includes(group)}
                        onChange={() => toggleFilter(group, setSelectedGroups)}
                      />
                      <span>{group}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Giá
                </h3>
                <div className="mt-3 space-y-2">
                  {priceOptions.map((opt) => (
                    <label key={opt.value} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="price"
                        className="h-4 w-4 border-slate-300 text-rose-500 focus:ring-rose-500"
                        checked={priceRange === opt.value}
                        onChange={() => setPriceRange(opt.value)}
                      />
                      <span>{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Genres
                </h3>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {genreOptions.map((genre) => (
                    <label key={genre} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-slate-300 text-rose-500 focus:ring-rose-500"
                        checked={selectedGenres.includes(genre)}
                        onChange={() => toggleFilter(genre, setSelectedGenres)}
                      />
                      <span>{genre}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Độ tuổi
                </h3>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {ageOptions.map((age) => (
                    <label key={age} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-slate-300 text-rose-500 focus:ring-rose-500"
                        checked={selectedAges.includes(age)}
                        onChange={() => toggleFilter(age, setSelectedAges)}
                      />
                      <span>{age}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          <section>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-slate-500">
                Hiển thị {pagedBooks.length} / {filteredBooks.length} sản phẩm
              </p>
            </div>

            {filteredBooks.length === 0 ? (
              <p className="mt-8 opacity-80">Không có sản phẩm phù hợp.</p>
            ) : (
              <div className="mt-6 grid grid-cols-2 gap-4 sm:gap-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {pagedBooks.map((item) => (
                  <Cards key={item._id || item.id} item={item} />
                ))}
              </div>
            )}

            {totalPages > 1 ? (
              <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  className="rounded-full border border-slate-200 px-3 py-1 text-sm disabled:opacity-50"
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Trước
                </button>
                {paginationItems.map((item, index) => (
                  <button
                    key={`${item}-${index}`}
                    type="button"
                    className={`h-8 min-w-[32px] rounded-full px-2 text-sm font-semibold ${
                      item === currentPage
                        ? "bg-rose-600 text-white"
                        : "border border-slate-200 text-slate-600"
                    }`}
                    onClick={() =>
                      typeof item === "number" ? setPage(item) : null
                    }
                    disabled={item === "..."}
                  >
                    {item}
                  </button>
                ))}
                <button
                  type="button"
                  className="rounded-full border border-slate-200 px-3 py-1 text-sm disabled:opacity-50"
                  onClick={() =>
                    setPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={currentPage === totalPages}
                >
                  Sau
                </button>
              </div>
            ) : null}
          </section>
        </div>
      </div>
    </>
  );
}

export default Course;
