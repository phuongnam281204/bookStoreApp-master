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
      <div className="max-w-screen-sm container mx-auto px-4 min-h-screen pt-28 pb-16">
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-semibold">{t("reset.title")}</h1>
          <p className="mt-2 text-sm text-slate-600">{t("reset.subtitle")}</p>

          <form className="mt-6 space-y-4" onSubmit={submit}>
            <div>
              <label className="text-sm font-medium">
                {t("reset.newPassword")}
              </label>
              <input
                type="password"
                className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                placeholder={t("reset.newPasswordPlaceholder")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">
                {t("reset.confirmPassword")}
              </label>
              <input
                type="password"
                className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                placeholder={t("reset.confirmPasswordPlaceholder")}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-xl bg-rose-600 py-3 text-sm font-semibold text-white disabled:opacity-60"
              disabled={loading}
            >
              {loading ? t("reset.submitting") : t("reset.submit")}
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default ResetPassword;
