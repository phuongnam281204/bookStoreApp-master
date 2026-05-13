import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import axios from "axios";
import toast from "react-hot-toast";

const emptyForm = {
  code: "",
  discountPercent: "",
  expiresAt: "",
  usageLimit: "",
  active: true,
};

const formatDate = (value) => {
  if (!value) return "";
  try {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "" : date.toLocaleDateString("vi-VN");
  } catch {
    return "";
  }
};

const toDateInputValue = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

function VouchersAdmin() {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/voucher", { withCredentials: true });
      setVouchers(res?.data?.vouchers || []);
    } catch (err) {
      const message =
        err?.response?.data?.message || err?.message || "Không tải được";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const submit = async (e) => {
    e.preventDefault();

    const payload = {
      code: form.code.trim().toUpperCase(),
      discountPercent:
        form.discountPercent === "" ? "" : Number(form.discountPercent),
      expiresAt: form.expiresAt || null,
      usageLimit: form.usageLimit === "" ? null : Number(form.usageLimit),
      active: Boolean(form.active),
    };

    try {
      if (!payload.code) {
        toast.error("Vui lòng nhập mã");
        return;
      }
      if (
        !Number.isFinite(payload.discountPercent) ||
        payload.discountPercent < 0 ||
        payload.discountPercent > 100
      ) {
        toast.error("Phần trăm giảm không hợp lệ");
        return;
      }
      if (
        payload.usageLimit !== null &&
        (!Number.isFinite(payload.usageLimit) || payload.usageLimit < 1)
      ) {
        toast.error("Giới hạn sử dụng không hợp lệ");
        return;
      }

      if (editingId) {
        await axios.patch(`/voucher/${editingId}`, payload, {
          withCredentials: true,
        });
        toast.success("Đã cập nhật mã giảm giá");
      } else {
        await axios.post("/voucher", payload, { withCredentials: true });
        toast.success("Đã tạo mã giảm giá");
      }

      resetForm();
      await load();
    } catch (err) {
      const message =
        err?.response?.data?.message || err?.message || "Lưu thất bại";
      toast.error(message);
    }
  };

  const startEdit = (voucher) => {
    setEditingId(voucher._id);
    setForm({
      code: voucher.code || "",
      discountPercent: voucher.discountPercent ?? "",
      expiresAt: toDateInputValue(voucher.expiresAt),
      usageLimit: voucher.usageLimit ?? "",
      active: Boolean(voucher.active),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const remove = async (id) => {
    if (!confirm("Xóa mã giảm giá này?")) return;
    try {
      await axios.delete(`/voucher/${id}`, { withCredentials: true });
      toast.success("Đã xóa mã giảm giá");
      await load();
    } catch (err) {
      const message =
        err?.response?.data?.message || err?.message || "Xóa thất bại";
      toast.error(message);
    }
  };

  return (
    <>
      <Navbar />
      <div className="max-w-screen-2xl container mx-auto md:px-20 px-4 min-h-screen pt-28 pb-16">
        <h1 className="text-2xl font-bold">Admin: Mã giảm giá</h1>

        <form
          onSubmit={submit}
          className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <input
            value={form.code}
            onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
            placeholder="Mã giảm giá"
            className="px-3 py-2 border rounded-md dark:bg-slate-900 dark:border-slate-700"
            required
          />
          <input
            value={form.discountPercent}
            onChange={(e) =>
              setForm((f) => ({ ...f, discountPercent: e.target.value }))
            }
            placeholder="Phần trăm giảm"
            type="number"
            min={0}
            max={100}
            className="px-3 py-2 border rounded-md dark:bg-slate-900 dark:border-slate-700"
            required
          />
          <input
            value={form.expiresAt}
            onChange={(e) =>
              setForm((f) => ({ ...f, expiresAt: e.target.value }))
            }
            placeholder="Ngày hết hạn"
            type="date"
            className="px-3 py-2 border rounded-md dark:bg-slate-900 dark:border-slate-700"
          />
          <input
            value={form.usageLimit}
            onChange={(e) =>
              setForm((f) => ({ ...f, usageLimit: e.target.value }))
            }
            placeholder="Giới hạn sử dụng"
            type="number"
            min={1}
            className="px-3 py-2 border rounded-md dark:bg-slate-900 dark:border-slate-700"
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) =>
                setForm((f) => ({ ...f, active: e.target.checked }))
              }
            />
            Kích hoạt
          </label>

          <div className="flex gap-3 md:col-span-2">
            <button className="px-4 py-2 bg-pink-500 text-white rounded-md">
              {editingId ? "Cập nhật" : "Tạo mới"}
            </button>
            {editingId ? (
              <button
                type="button"
                className="px-4 py-2 border rounded-md dark:border-slate-700"
                onClick={resetForm}
              >
                Hủy
              </button>
            ) : null}
          </div>
        </form>

        <div className="mt-10">
          {loading ? (
            <p>Đang tải...</p>
          ) : !vouchers.length ? (
            <div className="rounded-2xl border border-dashed p-8 text-center">
              Chưa có mã giảm giá.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Mã</th>
                    <th>Giảm</th>
                    <th>Hết hạn</th>
                    <th>Đã dùng</th>
                    <th>Kích hoạt</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {vouchers.map((v) => (
                    <tr key={v._id}>
                      <td>{v.code}</td>
                      <td>{Number(v.discountPercent || 0)}%</td>
                      <td>{formatDate(v.expiresAt) || "-"}</td>
                      <td>
                        {v.usedCount || 0}
                        {v.usageLimit ? ` / ${v.usageLimit}` : ""}
                      </td>
                      <td>{v.active ? "Bật" : "Tắt"}</td>
                      <td className="flex gap-2">
                        <button
                          className="px-3 py-1 border rounded-md dark:border-slate-700"
                          onClick={() => startEdit(v)}
                        >
                          Sửa
                        </button>
                        <button
                          className="px-3 py-1 bg-red-500 text-white rounded-md"
                          onClick={() => remove(v._id)}
                        >
                          Xóa
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}

export default VouchersAdmin;
