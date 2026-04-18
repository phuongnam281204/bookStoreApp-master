import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthProvider";
import { useI18n } from "../context/I18nProvider";

function Login() {
  const [, setAuthUser] = useAuth();
  const { t } = useI18n();
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
              <input
                type="password"
                placeholder={t("auth.login.passwordPlaceholder")}
                className="input input-bordered w-full"
                {...register("password", { required: true })}
              />
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
