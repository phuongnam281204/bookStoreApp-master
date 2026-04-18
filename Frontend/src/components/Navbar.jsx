import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Login from "./Login";
import Logout from "./Logout";
import { useAuth } from "../context/AuthProvider";
import { useCart } from "../context/CartProvider";
import { useI18n } from "../context/I18nProvider";

function Navbar() {
  const [authUser] = useAuth();
  const { totals } = useCart();
  const navigate = useNavigate();
  const { lang, toggleLang, t } = useI18n();
  const [search, setSearch] = useState("");

  const submitSearch = () => {
    const term = search.trim();
    if (!term) return;
    navigate(`/course?search=${encodeURIComponent(term)}`);
  };

  const [theme, setTheme] = useState(
    localStorage.getItem("theme") ? localStorage.getItem("theme") : "light",
  );
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
      document.body.classList.add("dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
      document.body.classList.remove("dark");
    }
  }, [theme]);

  const [sticky, setSticky] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        setSticky(true);
      } else {
        setSticky(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);
  const navItems = (
    <>
      <li>
        <Link to="/">{t("nav.home")}</Link>
      </li>
      <li>
        <Link to="/course">{t("nav.course")}</Link>
      </li>
      <li>
        <Link to="/cart">
          {t("nav.cart")} ({totals.count})
        </Link>
      </li>
      <li>
        <Link to="/contact">{t("nav.contact")}</Link>
      </li>
      <li>
        <Link to="/about">{t("nav.about")}</Link>
      </li>
    </>
  );
  return (
    <>
      <div
        className={` max-w-screen-2xl container mx-auto md:px-20 px-4 dark:bg-slate-800 dark:text-white fixed top-0 left-0 right-0 z-50 ${
          sticky
            ? "sticky-navbar shadow-md bg-base-200 dark:bg-slate-700 dark:text-white duration-300 transition-all ease-in-out"
            : ""
        }`}
      >
        <div className="navbar ">
          <div className="navbar-start">
            <div className="dropdown">
              <div
                tabIndex={0}
                role="button"
                className="btn btn-ghost lg:hidden"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h8m-8 6h16"
                  />
                </svg>
              </div>
              <ul
                tabIndex={0}
                className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52"
              >
                {navItems}
              </ul>
            </div>
            <Link to="/" className=" text-2xl font-bold cursor-pointer">
              bookStore
            </Link>
          </div>
          <div className="navbar-end space-x-3">
            <div className="navbar-center hidden lg:flex">
              <ul className="menu menu-horizontal px-1">{navItems}</ul>
            </div>
            <div className="hidden md:block">
              <label className="px-3 py-2 border rounded-md flex items-center gap-2">
                <input
                  type="text"
                  className="grow outline-none rounded-md px-1 dark:bg-slate-900 dark:text-white"
                  placeholder={t("nav.search")}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      submitSearch();
                    }
                  }}
                />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  className="w-4 h-4 opacity-70"
                >
                  <path
                    fillRule="evenodd"
                    d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
                    clipRule="evenodd"
                  />
                </svg>
              </label>
            </div>

            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={toggleLang}
              aria-label={t("lang.toggle")}
              title={t("lang.toggle")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-5 h-5"
              >
                <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm6.93 9h-3.17a15.4 15.4 0 0 0-1.12-5.02A8.03 8.03 0 0 1 18.93 11ZM12 4c.83 1.2 1.5 2.9 1.9 5H10.1c.4-2.1 1.07-3.8 1.9-5ZM4.07 13h3.17c.2 1.8.67 3.47 1.34 4.9A8.04 8.04 0 0 1 4.07 13ZM7.24 11H4.07a8.03 8.03 0 0 1 4.51-5.02A15.4 15.4 0 0 0 7.24 11Zm2.85 0h3.82c.06.66.09 1.33.09 2s-.03 1.34-.09 2h-3.82a16.7 16.7 0 0 1 0-4Zm-2.03 2c0-.67.03-1.34.09-2H7.33c-.06.66-.09 1.33-.09 2s.03 1.34.09 2h.82c-.06-.66-.09-1.33-.09-2Zm3.94 6c-.83-1.2-1.5-2.9-1.9-5h3.8c-.4 2.1-1.07 3.8-1.9 5Zm2.42-1.1c.67-1.43 1.14-3.1 1.34-4.9h3.17a8.04 8.04 0 0 1-4.51 4.9ZM16.67 11h.82c.06.66.09 1.33.09 2s-.03 1.34-.09 2h-.82c.06-.66.09-1.33.09-2s-.03-1.34-.09-2ZM15.85 11c-.2-1.8-.67-3.47-1.34-4.9A8.03 8.03 0 0 1 19.93 11h-4.08ZM8.15 13c.2 1.8.67 3.47 1.34 4.9A8.03 8.03 0 0 1 4.07 13h4.08Z" />
              </svg>
              <span className="ml-1 text-xs font-semibold">
                {lang.toUpperCase()}
              </span>
            </button>
            <label className="swap swap-rotate">
              {/* this hidden checkbox controls the state */}
              <input
                type="checkbox"
                className="theme-controller"
                value="synthwave"
              />

              {/* sun icon */}
              <svg
                className="swap-off fill-current w-7 h-7"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                <path d="M5.64,17l-.71.71a1,1,0,0,0,0,1.41,1,1,0,0,0,1.41,0l.71-.71A1,1,0,0,0,5.64,17ZM5,12a1,1,0,0,0-1-1H3a1,1,0,0,0,0,2H4A1,1,0,0,0,5,12Zm7-7a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V4A1,1,0,0,0,12,5ZM5.64,7.05a1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.41l-.71-.71A1,1,0,0,0,4.93,6.34Zm12,.29a1,1,0,0,0,.7-.29l.71-.71a1,1,0,1,0-1.41-1.41L17,5.64a1,1,0,0,0,0,1.41A1,1,0,0,0,17.66,7.34ZM21,11H20a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm-9,8a1,1,0,0,0-1,1v1a1,1,0,0,0,2,0V20A1,1,0,0,0,12,19ZM18.36,17A1,1,0,0,0,17,18.36l.71.71a1,1,0,0,0,1.41,0,1,1,0,0,0,0-1.41ZM12,6.5A5.5,5.5,0,1,0,17.5,12,5.51,5.51,0,0,0,12,6.5Zm0,9A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z" />
              </svg>

              {/* moon icon */}
              <svg
                className="swap-on fill-current w-7 h-7"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              >
                <path d="M21.64,13a1,1,0,0,0-1.05-.14,8.05,8.05,0,0,1-3.37.73A8.15,8.15,0,0,1,9.08,5.49a8.59,8.59,0,0,1,.25-2A1,1,0,0,0,8,2.36,10.14,10.14,0,1,0,22,14.05,1,1,0,0,0,21.64,13Zm-9.5,6.69A8.14,8.14,0,0,1,7.08,5.22v.27A10.15,10.15,0,0,0,17.22,15.63a9.79,9.79,0,0,0,2.1-.22A8.11,8.11,0,0,1,12.14,19.73Z" />
              </svg>
            </label>

            {authUser ? (
              <Logout />
            ) : (
              <div className="">
                <a
                  className="bg-black text-white px-3 py-2 rounded-md hover:bg-slate-800 duration-300 cursor-pointer"
                  onClick={() =>
                    document.getElementById("my_modal_3").showModal()
                  }
                >
                  {t("nav.login")}
                </a>
                <Login />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default Navbar;
