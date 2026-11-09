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
  const [openMenu, setOpenMenu] = useState(null);
  const menuProps = (id) => ({
    "aria-expanded": openMenu === id,
    "aria-haspopup": "menu",
    onFocus: () => setOpenMenu(id),
    onClick: () => setOpenMenu(id),
    onBlur: (e) => {
      if (!e.currentTarget.parentElement?.contains(e.relatedTarget)) setOpenMenu(null);
    },
  });

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

  const openAuthModal = (tab) => {
    window.dispatchEvent(new CustomEvent("auth:open", { detail: { tab } }));
  };

  const renderSearchForm = (widthClassName) => (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submitSearch();
      }}
    >
      <label
        className={`input input-sm flex items-center gap-2 rounded-md border-line bg-surface focus-within:border-ink focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-accent ${widthClassName}`}
      >
        <span className="shrink-0 text-xs font-semibold text-muted">
          {t("nav.search")}
        </span>
        <input
          type="text"
          className="min-w-0 grow focus-visible:!outline focus-visible:!outline-2 focus-visible:!outline-offset-4 focus-visible:!outline-accent"
          placeholder={t("nav.searchPlaceholder")}
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
  );

  const cartLink = (
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
  );

  return (
    <header
      className={`nav fixed top-0 left-0 right-0 z-50 border-b bg-paper/95 text-ink backdrop-blur transition-colors ${
        sticky ? "border-line" : "border-transparent"
      }`}
    >
      <div className="wrap">
        <div className="navbar px-0">
          <div className="navbar-start gap-2 flex-1 min-w-0">
            <div className="dropdown xl:hidden">
              <div
                tabIndex={0}
                role="button"
                {...menuProps("main")}
                className="btn btn-ghost btn-sm"
                aria-label={t("nav.menu")}
                title={t("nav.menu")}
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
                <span className="hidden sm:inline ml-1">{t("nav.menu")}</span>
              </div>
              <ul
                tabIndex={0}
                className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-72 max-w-[calc(100vw-1rem)]"
              >
                <div className="px-1 pb-2">
                  {renderSearchForm("w-full")}
                </div>
                {navItems}
              </ul>
            </div>

            <Link
              to="/"
              className="flex min-h-[44px] shrink-0 items-center gap-2 font-display text-xl font-medium tracking-tight sm:gap-2.5 sm:text-2xl"
            >
              <img
                src="/assets/img/logo.webp"
                alt=""
                width="36"
                height="36"
                className="h-8 w-8 rounded-lg sm:h-9 sm:w-9"
              />
              BookStore
            </Link>

            <div className="hidden xl:flex flex-1 min-w-0 justify-center">
              <ul className="menu menu-horizontal menu-sm flex-nowrap whitespace-nowrap px-1 w-max font-medium">
                {navItems}
              </ul>
            </div>
          </div>

          <div className="navbar-end gap-1 sm:gap-2 md:gap-3 flex-none">
            <div className="hidden min-[1440px]:flex">
              {renderSearchForm("w-64")}
            </div>
            <div className="dropdown dropdown-end hidden xl:block min-[1440px]:hidden">
              <button
                type="button"
                tabIndex={0}
                {...menuProps("search")}
                className="btn btn-ghost btn-sm btn-circle"
                aria-label={t("nav.search")}
                title={t("nav.search")}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  className="h-5 w-5"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 0 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
              <div
                tabIndex={0}
                className="dropdown-content z-[1] mt-3 w-80 rounded-box bg-base-100 p-2 shadow"
              >
                {renderSearchForm("w-full")}
              </div>
            </div>

            <button
              type="button"
              className="btn btn-ghost btn-sm hidden md:flex"
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

            <button
              type="button"
              className="btn btn-ghost btn-sm hidden md:flex"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label={t("theme.toggle")}
              aria-pressed={theme === "dark"}
              title={t("theme.toggle")}
            >
              {theme === "dark" ? (
                <svg
                className="fill-current w-5 h-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
              >
                <path d="M21.64,13a1,1,0,0,0-1.05-.14,8.05,8.05,0,0,1-3.37.73A8.15,8.15,0,0,1,9.08,5.49a8.59,8.59,0,0,1,.25-2A1,1,0,0,0,8,2.36,10.14,10.14,0,1,0,22,14.05,1,1,0,0,0,21.64,13Zm-9.5,6.69A8.14,8.14,0,0,1,7.08,5.22v.27A10.15,10.15,0,0,0,17.22,15.63a9.79,9.79,0,0,0,2.1-.22A8.11,8.11,0,0,1,12.14,19.73Z" />
              </svg>
              ) : (
                <svg
                className="fill-current w-5 h-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
              >
                <path d="M5.64,17l-.71.71a1,1,0,0,0,0,1.41,1,1,0,0,0,1.41,0l.71-.71A1,1,0,0,0,5.64,17ZM5,12a1,1,0,0,0-1-1H3a1,1,0,0,0,0,2H4A1,1,0,0,0,5,12Zm7-7a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V4A1,1,0,0,0,12,5ZM5.64,7.05a1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.41l-.71-.71A1,1,0,0,0,4.93,6.34Zm12,.29a1,1,0,0,0,.7-.29l.71-.71a1,1,0,1,0-1.41-1.41L17,5.64a1,1,0,0,0,0,1.41A1,1,0,0,0,17.66,7.34ZM21,11H20a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm-9,8a1,1,0,0,0-1,1v1a1,1,0,0,0,2,0V20A1,1,0,0,0,12,19ZM18.36,17A1,1,0,0,0,17,18.36l.71.71a1,1,0,0,0,1.41,0,1,1,0,0,0,0-1.41ZM12,6.5A5.5,5.5,0,1,0,17.5,12,5.51,5.51,0,0,0,12,6.5Zm0,9A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z" />
              </svg>
              )}
            </button>

            {authUser ? (
              <>
                {cartLink}
                <div className="hidden md:flex items-center gap-2">
                  {authUser?.role === "admin" ? (
                    <div className="dropdown dropdown-end">
                    <label
                      tabIndex={0}
                      role="button"
                      {...menuProps("side3")}
                      className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 rounded-full bg-base-200 cursor-pointer"
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
                      <span className="max-w-24 sm:max-w-40 truncate text-sm font-medium hidden sm:block">
                        {authUser.fullname || authUser.email}
                      </span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-4 h-4 opacity-70"
                        aria-hidden="true"
                      >
                        <path d="M12 15.5 5.5 9h13L12 15.5Z" />
                      </svg>
                    </label>
                    <ul
                      tabIndex={0}
                      className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow-xl bg-base-100 rounded-2xl w-52 border border-base-200"
                    >
                      <li>
                        <Link to="/admin/books" className="rounded-xl">
                          Quản lý sách
                        </Link>
                      </li>
                      <li>
                        <Link to="/admin/orders" className="rounded-xl">
                          Quản lý đơn hàng
                        </Link>
                      </li>
                      <li>
                        <Link to="/admin/users" className="rounded-xl">
                          Quản lý user
                        </Link>
                      </li>
                      <li>
                        <Link to="/admin/vouchers" className="rounded-xl">
                          Quản lý voucher
                        </Link>
                      </li>
                    </ul>
                    </div>
                  ) : (
                    <div className="dropdown dropdown-end">
                    <label
                      tabIndex={0}
                      role="button"
                      {...menuProps("side4")}
                      className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 rounded-full bg-base-200 cursor-pointer"
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
                      <span className="max-w-24 sm:max-w-40 truncate text-sm font-medium hidden sm:block">
                        {authUser.fullname || authUser.email}
                      </span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-4 h-4 opacity-70"
                        aria-hidden="true"
                      >
                        <path d="M12 15.5 5.5 9h13L12 15.5Z" />
                      </svg>
                    </label>
                    <ul
                      tabIndex={0}
                      className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow-xl bg-base-100 rounded-2xl w-52 border border-base-200"
                    >
                      <li>
                        <Link to="/orders" className="rounded-xl">
                          Đơn hàng của tôi
                        </Link>
                      </li>
                    </ul>
                    </div>
                  )}
                  <Logout />
                </div>
                <div className="dropdown dropdown-end md:hidden">
                  <button
                    type="button"
                    tabIndex={0}
                    {...menuProps("side1")}
                    className="btn btn-ghost btn-sm btn-circle"
                    aria-label={authUser.fullname || authUser.email}
                    title={authUser.fullname || authUser.email}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-5 h-5"
                      aria-hidden="true"
                    >
                      <path d="M12 2a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm-8 19a8 8 0 1 1 16 0H4Z" />
                    </svg>
                  </button>
                  <ul
                    tabIndex={0}
                    className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow-xl bg-base-100 rounded-2xl w-64 max-w-[calc(100vw-1rem)] border border-base-200"
                  >
                    <li className="menu-title max-w-full">
                      <span className="truncate">
                        {authUser.fullname || authUser.email}
                      </span>
                    </li>
                    {authUser?.role === "admin" ? (
                      <>
                        <li>
                          <Link to="/admin/books" className="rounded-xl">
                            Quản lý sách
                          </Link>
                        </li>
                        <li>
                          <Link to="/admin/orders" className="rounded-xl">
                            Quản lý đơn hàng
                          </Link>
                        </li>
                        <li>
                          <Link to="/admin/users" className="rounded-xl">
                            Quản lý user
                          </Link>
                        </li>
                        <li>
                          <Link to="/admin/vouchers" className="rounded-xl">
                            Quản lý voucher
                          </Link>
                        </li>
                      </>
                    ) : (
                      <li>
                        <Link to="/orders" className="rounded-xl">
                          Đơn hàng của tôi
                        </Link>
                      </li>
                    )}
                    <li>
                      <button type="button" onClick={toggleLang}>
                        {t("lang.toggle")} ({lang.toUpperCase()})
                      </button>
                    </li>
                    <li>
                      <button
                        type="button"
                        onClick={() =>
                          setTheme(theme === "dark" ? "light" : "dark")
                        }
                      >
                        {t("theme.toggle")}
                      </button>
                    </li>
                    <li className="px-1 py-1">
                      <Logout />
                    </li>
                  </ul>
                </div>
              </>
            ) : (
              <>
                {cartLink}
                <div className="hidden md:flex items-center gap-2">
                  <button
                    type="button"
                    className="btn-solid whitespace-nowrap"
                    onClick={() => openAuthModal("login")}
                  >
                    {t("nav.login")}
                  </button>
                  <Link
                    to="/signup"
                    className="link-draw whitespace-nowrap text-sm font-semibold text-muted hover:text-ink"
                    onClick={(event) => {
                      event.preventDefault();
                      openAuthModal("signup");
                    }}
                  >
                    {t("nav.register")}
                  </Link>
                </div>
                <div className="dropdown dropdown-end md:hidden">
                  <button
                    type="button"
                    tabIndex={0}
                    {...menuProps("side2")}
                    className="btn btn-ghost btn-sm btn-circle"
                    aria-label={t("nav.menu")}
                    title={t("nav.menu")}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-5 h-5"
                      aria-hidden="true"
                    >
                      <path d="M12 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm0 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm0 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
                    </svg>
                  </button>
                  <ul
                    tabIndex={0}
                    className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow-xl bg-base-100 rounded-2xl w-56 max-w-[calc(100vw-1rem)] border border-base-200"
                  >
                    <li>
                      <button
                        type="button"
                        onClick={() => openAuthModal("login")}
                      >
                        {t("nav.login")}
                      </button>
                    </li>
                    <li>
                      <button
                        type="button"
                        onClick={() => openAuthModal("signup")}
                      >
                        {t("nav.register")}
                      </button>
                    </li>
                    <li>
                      <button type="button" onClick={toggleLang}>
                        {t("lang.toggle")} ({lang.toUpperCase()})
                      </button>
                    </li>
                    <li>
                      <button
                        type="button"
                        onClick={() =>
                          setTheme(theme === "dark" ? "light" : "dark")
                        }
                      >
                        {t("theme.toggle")}
                      </button>
                    </li>
                  </ul>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      {authUser ? null : <Login />}
    </header>
  );
}

export default Navbar;
