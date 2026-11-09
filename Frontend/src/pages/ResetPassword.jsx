import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useI18n } from "../context/I18nProvider";

const isStrongPassword = (value) => {
  if (typeof value !== "string") return false;
  if (value.length < 8) return false;
  const hasLetter = /[A-Za-z]/.test(value);
  const hasNumber = /\d/.test(value);
  return hasLetter && hasNumber;
};

function ResetPassword() {
  const { t } = useI18n();
  const location = useLocation();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const token = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get("token") || "";
  }, [location.search]);

  const submit = async (e) => {
    e.preventDefault();
    if (!token) {
      toast.error(t("reset.missingToken"));
      return;
    }
    if (!isStrongPassword(password)) {
      toast.error(t("reset.weakPassword"));
      return;
    }
    if (password !== confirmPassword) {
      toast.error(t("reset.mismatch"));
      return;
    }

    setLoading(true);
    try {
      await axios.post(
        "/user/reset-password",
        { token, password },
        { withCredentials: true },
      );
      toast.success(t("reset.success"));
      navigate("/");
    } catch (err) {
      const message =
        err?.response?.data?.message || err?.message || t("reset.failed");
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="wrap min-h-screen pb-24 pt-28">
        <div className="max-w-md py-12">
          <h1 className="font-display text-4xl font-medium md:text-5xl">{t("reset.title")}</h1>
          <p className="mt-3 text-muted">{t("reset.subtitle")}</p>

          <form className="mt-6 space-y-4" onSubmit={submit}>
            <div>
              <label htmlFor="reset-new" className="text-sm font-semibold">
                {t("reset.newPassword")}
              </label>
              <input
                type="password"
                id="reset-new"
                className="mt-2 min-h-[44px] w-full rounded-md border border-line bg-paper px-3 text-sm focus:border-ink/40 focus:outline-none"
                placeholder={t("reset.newPasswordPlaceholder")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="reset-confirm" className="text-sm font-semibold">
                {t("reset.confirmPassword")}
              </label>
              <input
                type="password"
                id="reset-confirm"
                className="mt-2 min-h-[44px] w-full rounded-md border border-line bg-paper px-3 text-sm focus:border-ink/40 focus:outline-none"
                placeholder={t("reset.confirmPasswordPlaceholder")}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="btn-solid w-full disabled:opacity-60"
              disabled={loading}
            >
              {loading ? t("reset.submitting") : t("reset.submit")}
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default ResetPassword;
