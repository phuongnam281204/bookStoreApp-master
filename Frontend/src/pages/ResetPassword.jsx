import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const isStrongPassword = (value) => {
  if (typeof value !== "string") return false;
  if (value.length < 8) return false;
  const hasLetter = /[A-Za-z]/.test(value);
  const hasNumber = /\d/.test(value);
  return hasLetter && hasNumber;
};

function ResetPassword() {
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
      toast.error("Thiếu token đặt lại mật khẩu");
      return;
    }
    if (!isStrongPassword(password)) {
      toast.error("Mật khẩu phải >= 8 ký tự, gồm chữ và số");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp");
      return;
    }

    setLoading(true);
    try {
      await axios.post(
        "/user/reset-password",
        { token, password },
        { withCredentials: true },
      );
      toast.success("Đặt lại mật khẩu thành công");
      navigate("/");
    } catch (err) {
      const message =
        err?.response?.data?.message || err?.message || "Đặt lại thất bại";
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
          <h1 className="text-2xl font-semibold">Đặt lại mật khẩu</h1>
          <p className="mt-2 text-sm text-slate-600">
            Nhập mật khẩu mới cho tài khoản của bạn.
          </p>

          <form className="mt-6 space-y-4" onSubmit={submit}>
            <div>
              <label className="text-sm font-medium">Mật khẩu mới</label>
              <input
                type="password"
                className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                placeholder="Ít nhất 8 ký tự, gồm chữ và số"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Nhập lại mật khẩu</label>
              <input
                type="password"
                className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                placeholder="Nhập lại mật khẩu"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-xl bg-rose-600 py-3 text-sm font-semibold text-white disabled:opacity-60"
              disabled={loading}
            >
              {loading ? "Đang xử lý..." : "Cập nhật mật khẩu"}
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default ResetPassword;
