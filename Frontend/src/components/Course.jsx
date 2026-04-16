import { useEffect, useState } from "react";
import Cards from "./Cards";
import axios from "axios";
import { Link, useSearchParams } from "react-router-dom";

function Course() {
  const [book, setBook] = useState([]);
  const [searchParams] = useSearchParams();

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
        <div className="mt-28 items-center justify-center text-center">
          <h1 className="text-2xl  md:text-4xl">
            We&apos;re delighted to have you{" "}
            <span className="text-pink-500"> Here! :)</span>
          </h1>
          <p className="mt-12">
            Lorem ipsum dolor sit, amet consectetur adipisicing elit. Porro,
            assumenda? Repellendus, iste corrupti? Tempore laudantium
            repellendus accusamus accusantium sed architecto odio, nisi expedita
            quas quidem nesciunt debitis dolore non aspernatur praesentium
            assumenda sint quibusdam, perspiciatis, explicabo sequi fugiat amet
            animi eos aut. Nobis quisquam reiciendis sunt quis sed magnam
            consequatur!
          </p>
          <Link to="/">
            <button className="mt-6 bg-pink-500 text-white px-4 py-2 rounded-md hover:bg-pink-700 duration-300">
              Back
            </button>
          </Link>
        </div>
        {q ? (
          <p className="mt-8 text-center opacity-80">
            Showing {filteredBooks.length} result(s) for <b>{q}</b>
          </p>
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
