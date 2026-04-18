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

  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("theme");
    return saved === "dark" ? "dark" : "light";
  });

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = theme;

    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");

    localStorage.setItem("theme", theme);
  }, [theme]);

  const submitSearch = () => {
    const term = search.trim();
    if (!term) return;
    navigate(`/course?search=${encodeURIComponent(term)}`);
  };

  const [sticky, setSticky] = useState(false);
  useEffect(() => {
    const handleScroll = () => setSticky(window.scrollY > 0);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
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
        <Link to="/contact">{t("nav.contact")}</Link>
      </li>
      <li>
        <Link to="/about">{t("nav.about")}</Link>
      </li>
    </>
  );

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 bg-base-100 text-base-content ${
        sticky ? "shadow-md bg-base-200" : ""
      }`}
    >
      <div className="max-w-screen-2xl container mx-auto md:px-20 px-4">
        <div className="navbar px-0">
          <div className="navbar-start gap-2 flex-1 min-w-0">
            <div className="dropdown md:hidden">
              <div
                tabIndex={0}
                role="button"
                className="btn btn-ghost btn-sm"
                aria-label="Menu"
                title="Menu"
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
                <span className="hidden sm:inline ml-1">Menu</span>
              </div>
              <ul
                tabIndex={0}
                className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-56"
              >
                {navItems}
              </ul>
            </div>

            <Link to="/" className="btn btn-ghost text-xl font-bold">
              bookStore
            </Link>

            <div className="hidden md:flex flex-1 min-w-0 justify-center overflow-x-auto overflow-y-hidden">
              <ul className="menu menu-horizontal menu-sm flex-nowrap whitespace-nowrap px-1 w-max">
                {navItems}
              </ul>
            </div>
          </div>

          <div className="navbar-end gap-3 flex-none">
            <div className="hidden md:flex lg:ml-4">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  submitSearch();
                }}
              >
                <label className="input input-bordered input-sm flex items-center gap-2 rounded-full w-36 md:w-40 lg:w-56 xl:w-72">
                  <input
                    type="text"
                    className="grow"
                    placeholder={t("nav.search")}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="btn btn-ghost btn-xs"
                    aria-label={t("nav.search")}
                    title={t("nav.search")}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 16 16"
                      fill="currentColor"
                      className="w-4 h-4 opacity-70"
                    >
                      <path
                        fillRule="evenodd"
                        d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 0 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </label>
              </form>
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

            <label className="btn btn-ghost btn-sm swap swap-rotate">
              <input
                type="checkbox"
                checked={theme === "dark"}
                onChange={(e) => setTheme(e.target.checked ? "dark" : "light")}
                aria-label={t("theme.toggle")}
                title={t("theme.toggle")}
              />

              <svg
                className="swap-off fill-current w-5 h-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
              >
                <path d="M5.64,17l-.71.71a1,1,0,0,0,0,1.41,1,1,0,0,0,1.41,0l.71-.71A1,1,0,0,0,5.64,17ZM5,12a1,1,0,0,0-1-1H3a1,1,0,0,0,0,2H4A1,1,0,0,0,5,12Zm7-7a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V4A1,1,0,0,0,12,5ZM5.64,7.05a1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.41l-.71-.71A1,1,0,0,0,4.93,6.34Zm12,.29a1,1,0,0,0,.7-.29l.71-.71a1,1,0,1,0-1.41-1.41L17,5.64a1,1,0,0,0,0,1.41A1,1,0,0,0,17.66,7.34ZM21,11H20a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm-9,8a1,1,0,0,0-1,1v1a1,1,0,0,0,2,0V20A1,1,0,0,0,12,19ZM18.36,17A1,1,0,0,0,17,18.36l.71.71a1,1,0,0,0,1.41,0,1,1,0,0,0,0-1.41ZM12,6.5A5.5,5.5,0,1,0,17.5,12,5.51,5.51,0,0,0,12,6.5Zm0,9A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z" />
              </svg>

              <svg
                className="swap-on fill-current w-5 h-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
              >
                <path d="M21.64,13a1,1,0,0,0-1.05-.14,8.05,8.05,0,0,1-3.37.73A8.15,8.15,0,0,1,9.08,5.49a8.59,8.59,0,0,1,.25-2A1,1,0,0,0,8,2.36,10.14,10.14,0,1,0,22,14.05,1,1,0,0,0,21.64,13Zm-9.5,6.69A8.14,8.14,0,0,1,7.08,5.22v.27A10.15,10.15,0,0,0,17.22,15.63a9.79,9.79,0,0,0,2.1-.22A8.11,8.11,0,0,1,12.14,19.73Z" />
              </svg>
            </label>

            {authUser ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/cart"
                  className="btn btn-ghost btn-sm btn-circle"
                  aria-label={`${t("nav.cart")} (${totals.count})`}
                  title={`${t("nav.cart")} (${totals.count})`}
                >
                  <div className="indicator">
                    {totals.count ? (
                      <span className="indicator-item badge badge-primary badge-sm">
                        {totals.count}
                      </span>
                    ) : null}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-5 h-5"
                      aria-hidden="true"
                    >
                      <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2Zm10 0c-1.1 0-1.99.9-1.99 2S15.9 22 17 22s2-.9 2-2-.9-2-2-2ZM7.17 14h9.66c.75 0 1.4-.41 1.74-1.03L21 6H6.21L5.27 4H2v2h2l3.6 7.59-1.35 2.44C5.52 17.37 6.48 19 8 19h12v-2H8l1.1-2Zm-.96-6h12.48l-1.62 4H8.11L6.21 8Z" />
                    </svg>
                  </div>
                </Link>
                <div
                  className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-base-200"
                  title={authUser.fullname || authUser.email}
                  aria-label={authUser.fullname || authUser.email}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-4 h-4 opacity-80"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12 2a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm-3 5a3 3 0 1 1 6 0 3 3 0 0 1-6 0Z"
                      clipRule="evenodd"
                    />
                    <path d="M4 20a8 8 0 0 1 16 0v1H4v-1Z" />
                  </svg>
                  <span className="max-w-40 truncate text-sm font-medium">
                    {authUser.fullname || authUser.email}
                  </span>
                </div>
                <Logout />
              </div>
            ) : (
              <div>
                <Link
                  to="/cart"
                  className="btn btn-ghost btn-sm btn-circle mr-2"
                  aria-label={`${t("nav.cart")} (${totals.count})`}
                  title={`${t("nav.cart")} (${totals.count})`}
                >
                  <div className="indicator">
                    {totals.count ? (
                      <span className="indicator-item badge badge-primary badge-sm">
                        {totals.count}
                      </span>
                    ) : null}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-5 h-5"
                      aria-hidden="true"
                    >
                      <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2Zm10 0c-1.1 0-1.99.9-1.99 2S15.9 22 17 22s2-.9 2-2-.9-2-2-2ZM7.17 14h9.66c.75 0 1.4-.41 1.74-1.03L21 6H6.21L5.27 4H2v2h2l3.6 7.59-1.35 2.44C5.52 17.37 6.48 19 8 19h12v-2H8l1.1-2Zm-.96-6h12.48l-1.62 4H8.11L6.21 8Z" />
                    </svg>
                  </div>
                </Link>
                <button
                  type="button"
                  className="btn btn-primary btn-sm whitespace-nowrap"
                  onClick={() =>
                    document.getElementById("my_modal_3").showModal()
                  }
                >
                  {t("nav.login")}
                </button>
                <Login />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Navbar;
