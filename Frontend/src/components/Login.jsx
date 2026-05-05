import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthProvider";
import { useI18n } from "../context/I18nProvider";

function Login({ defaultTab = "login", autoOpen = false }) {
  const [, setAuthUser] = useAuth();
  const { t } = useI18n();
  const location = useLocation();
  const navigate = useNavigate();
  const from = location.state?.from?.pathname || "/";
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);

  const loginForm = useForm();
  const signupForm = useForm();

  const openModal = (tab) => {
    setActiveTab(tab || "login");
    const modal = document.getElementById("my_modal_3");
    if (modal && typeof modal.showModal === "function") modal.showModal();
  };

  useEffect(() => {
    const handler = (event) => {
      openModal(event?.detail?.tab || "login");
    };
    window.addEventListener("auth:open", handler);
    return () => window.removeEventListener("auth:open", handler);
  }, []);

  useEffect(() => {
    if (!autoOpen) return;
    openModal(defaultTab);
  }, [autoOpen, defaultTab]);

  const submitLogin = async (data) => {
    const userInfo = {
      email: data.email,
      password: data.password,
    };

    try {
      const res = await axios.post("/user/login", userInfo, {
        withCredentials: true,
      });
      const user = res?.data?.user;
      if (user) {
        localStorage.setItem("Users", JSON.stringify(user));
        setAuthUser(user);
      }
      toast.success(t("auth.toast.loginSuccess"));
      document.getElementById("my_modal_3").close();
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        t("auth.toast.loginFailed");
      toast.error(message);
    }
  };

  const submitSignup = async (data) => {
    const userInfo = {
      fullname: data.fullname,
      email: data.email,
      password: data.password,
    };

    try {
      const res = await axios.post("/user/signup", userInfo, {
        withCredentials: true,
      });
      const user = res?.data?.user;
      if (user) {
        localStorage.setItem("Users", JSON.stringify(user));
        setAuthUser(user);
      }
      toast.success(t("auth.toast.signupSuccess"));
      document.getElementById("my_modal_3").close();
      navigate(from, { replace: true });
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        t("auth.toast.signupFailed");
      toast.error(message);
    }
  };

  return (
    <div>
      <dialog id="my_modal_3" className="modal">
        <div className="modal-box">
          <Link
            to="/"
            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            onClick={() => document.getElementById("my_modal_3").close()}
          >
            ✕
          </Link>

          <div className="flex items-center justify-center gap-10 border-b border-slate-200 dark:border-slate-700">
            <button
              type="button"
              className={`py-3 text-sm font-semibold transition min-w-[110px] text-center ${
                activeTab === "login"
                  ? "text-rose-500 border-b-2 border-rose-500"
                  : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-200"
              }`}
              onClick={() => setActiveTab("login")}
            >
              {t("nav.login")}
            </button>
            <button
              type="button"
              className={`py-3 text-sm font-semibold transition min-w-[110px] text-center ${
                activeTab === "signup"
                  ? "text-rose-500 border-b-2 border-rose-500"
                  : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-200"
              }`}
              onClick={() => setActiveTab("signup")}
            >
              {t("nav.register")}
            </button>
          </div>

          {activeTab === "login" ? (
            <form onSubmit={loginForm.handleSubmit(submitLogin)}>
              <div className="mt-5 space-y-2">
                <span>{t("auth.login.email")}</span>
                <input
                  type="email"
                  placeholder={t("auth.login.emailPlaceholder")}
                  className="input input-bordered w-full"
                  {...loginForm.register("email", { required: true })}
                />
                {loginForm.formState.errors.email && (
                  <span className="text-sm text-red-500">
                    {t("auth.fieldRequired")}
                  </span>
                )}
              </div>

              <div className="mt-4 space-y-2">
                <span>{t("auth.login.password")}</span>
                <div className="relative">
                  <input
                    type={showLoginPassword ? "text" : "password"}
                    placeholder={t("auth.login.passwordPlaceholder")}
                    className="input input-bordered w-full pr-16"
                    {...loginForm.register("password", { required: true })}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    onClick={() => setShowLoginPassword((prev) => !prev)}
                    aria-label={
                      showLoginPassword
                        ? t("auth.password.hide")
                        : t("auth.password.show")
                    }
                  >
                    {showLoginPassword ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        className="h-5 w-5"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3 3l18 18"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M10.477 10.478a3 3 0 004.243 4.243"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6.228 6.228C4.786 7.273 3.6 8.76 2.75 10.5c2.25 4.5 6 7.5 9.25 7.5 1.41 0 2.86-.44 4.25-1.23"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9.5 4.08A8.7 8.7 0 0112 3c3.25 0 7 3 9.25 7.5a16.4 16.4 0 01-2.02 3.2"
                        />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        className="h-5 w-5"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.75 10.5C5 6 8.75 3 12 3s7 3 9.25 7.5C19 15 15.25 18 12 18s-7-3-9.25-7.5z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 8a4 4 0 100 8 4 4 0 000-8z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
                {loginForm.formState.errors.password && (
                  <span className="text-sm text-red-500">
                    {t("auth.fieldRequired")}
                  </span>
                )}
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-6">
                <button type="submit" className="btn btn-primary">
                  {t("nav.login")}
                </button>
                <p className="text-sm">
                  {t("auth.login.notRegistered")}{" "}
                  <button
                    type="button"
                    className="link link-primary"
                    onClick={() => setActiveTab("signup")}
                  >
                    {t("auth.login.signup")}
                  </button>
                </p>
              </div>
            </form>
          ) : (
            <form onSubmit={signupForm.handleSubmit(submitSignup)}>
              <div className="mt-5 space-y-2">
                <span>{t("auth.signup.name")}</span>
                <input
                  type="text"
                  placeholder={t("auth.signup.namePlaceholder")}
                  className="input input-bordered w-full"
                  {...signupForm.register("fullname", { required: true })}
                />
                {signupForm.formState.errors.fullname && (
                  <span className="text-sm text-red-500">
                    {t("auth.fieldRequired")}
                  </span>
                )}
              </div>

              <div className="mt-4 space-y-2">
                <span>{t("auth.signup.email")}</span>
                <input
                  type="email"
                  placeholder={t("auth.signup.emailPlaceholder")}
                  className="input input-bordered w-full"
                  {...signupForm.register("email", { required: true })}
                />
                {signupForm.formState.errors.email && (
                  <span className="text-sm text-red-500">
                    {t("auth.fieldRequired")}
                  </span>
                )}
              </div>

              <div className="mt-4 space-y-2">
                <span>{t("auth.signup.password")}</span>
                <div className="relative">
                  <input
                    type={showSignupPassword ? "text" : "password"}
                    placeholder={t("auth.signup.passwordPlaceholder")}
                    className="input input-bordered w-full pr-16"
                    {...signupForm.register("password", { required: true })}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    onClick={() => setShowSignupPassword((prev) => !prev)}
                    aria-label={
                      showSignupPassword
                        ? t("auth.password.hide")
                        : t("auth.password.show")
                    }
                  >
                    {showSignupPassword ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        className="h-5 w-5"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3 3l18 18"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M10.477 10.478a3 3 0 004.243 4.243"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6.228 6.228C4.786 7.273 3.6 8.76 2.75 10.5c2.25 4.5 6 7.5 9.25 7.5 1.41 0 2.86-.44 4.25-1.23"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9.5 4.08A8.7 8.7 0 0112 3c3.25 0 7 3 9.25 7.5a16.4 16.4 0 01-2.02 3.2"
                        />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        className="h-5 w-5"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.75 10.5C5 6 8.75 3 12 3s7 3 9.25 7.5C19 15 15.25 18 12 18s-7-3-9.25-7.5z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 8a4 4 0 100 8 4 4 0 000-8z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
                {signupForm.formState.errors.password && (
                  <span className="text-sm text-red-500">
                    {t("auth.fieldRequired")}
                  </span>
                )}
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-6">
                <button type="submit" className="btn btn-primary">
                  {t("auth.signup.submit")}
                </button>
                <p className="text-sm">
                  {t("auth.signup.haveAccount")}{" "}
                  <button
                    type="button"
                    className="link link-primary"
                    onClick={() => setActiveTab("login")}
                  >
                    {t("nav.login")}
                  </button>
                </p>
              </div>
            </form>
          )}
        </div>
      </dialog>
    </div>
  );
}

export default Login;
