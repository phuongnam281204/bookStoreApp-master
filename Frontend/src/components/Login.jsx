import { Link } from "react-router-dom";
import { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthProvider";
import { useI18n } from "../context/I18nProvider";

function Login() {
  const [, setAuthUser] = useAuth();
  const { t } = useI18n();
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
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
  return (
    <div>
      <dialog id="my_modal_3" className="modal">
        <div className="modal-box">
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* if there is a button in form, it will close the modal */}
            <Link
              to="/"
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
              onClick={() => document.getElementById("my_modal_3").close()}
            >
              ✕
            </Link>

            <h3 className="font-bold text-lg">{t("auth.login.title")}</h3>
            {/* Email */}
            <div className="mt-4 space-y-2">
              <span>{t("auth.login.email")}</span>
              <input
                type="email"
                placeholder={t("auth.login.emailPlaceholder")}
                className="input input-bordered w-full"
                {...register("email", { required: true })}
              />
              {errors.email && (
                <span className="text-sm text-red-500">
                  This field is required
                </span>
              )}
            </div>
            {/* password */}
            <div className="mt-4 space-y-2">
              <span>{t("auth.login.password")}</span>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder={t("auth.login.passwordPlaceholder")}
                  className="input input-bordered w-full pr-16"
                  {...register("password", { required: true })}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
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
              {errors.password && (
                <span className="text-sm text-red-500">
                  This field is required
                </span>
              )}
            </div>

            {/* Button */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-6">
              <button type="submit" className="btn btn-primary">
                {t("nav.login")}
              </button>
              <p className="text-sm">
                {t("auth.login.notRegistered")}{" "}
                <Link
                  to="/signup"
                  className="link link-primary"
                  onClick={() => document.getElementById("my_modal_3").close()}
                >
                  {t("auth.login.signup")}
                </Link>{" "}
              </p>
            </div>
          </form>
        </div>
      </dialog>
    </div>
  );
}

export default Login;
