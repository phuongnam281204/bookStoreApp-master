import { useEffect, useState } from "react";
import Cards from "./Cards";
import axios from "axios";
import { useSearchParams } from "react-router-dom";
import { useI18n } from "../context/I18nProvider";

function Course() {
  const [book, setBook] = useState([]);
  const [searchParams] = useSearchParams();
  const { t } = useI18n();

  const q = (searchParams.get("search") || "").trim().toLowerCase();
  const filteredBooks = q
    ? book.filter((b) => {
        const haystack =
          `${b.name || ""} ${b.title || ""} ${b.category || ""}`.toLowerCase();
        return haystack.includes(q);
      })
    : book;

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

        <div className="mt-12 grid grid-cols-1 md:grid-cols-4">
          {filteredBooks.map((item) => (
            <Cards key={item._id || item.id} item={item} />
          ))}
        </div>
      </div>
    </>
  );
}

export default Course;
