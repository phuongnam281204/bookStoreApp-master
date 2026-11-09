import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import AdminLayout, { EmptyState, LoadingRows, PageHeader, Pill } from "./AdminLayout";

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
    document.getElementById("voucher-code")?.focus();
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

  const isExpired = (v) => v.expiresAt && new Date(v.expiresAt) < new Date();
  const isUsedUp = (v) => v.usageLimit && (v.usedCount || 0) >= v.usageLimit;
  const voucherState = (v) => {
    if (!v.active) return { label: "Tắt", tone: "neutral" };
    if (isExpired(v)) return { label: "Hết hạn", tone: "bad" };
    if (isUsedUp(v)) return { label: "Hết lượt", tone: "warn" };
    return { label: "Đang chạy", tone: "good" };
  };

  return (
    <AdminLayout>
      <PageHeader
        title="Mã giảm giá"
        description={`${vouchers.length} mã · ${
          vouchers.filter((v) => voucherState(v).tone === "good").length
        } đang chạy`}
      />

      <div className="mt-6 grid items-start gap-6 grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="order-2 min-w-0 lg:order-1">
          {loading ? (
            <LoadingRows />
          ) : !vouchers.length ? (
            <EmptyState
              title="Chưa có mã giảm giá"
              hint="Tạo mã đầu tiên ở khung bên cạnh."
            />
          ) : (
            <div className="panel overflow-x-auto">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Mã</th>
                    <th className="!text-right">Giảm</th>
                    <th>Hết hạn</th>
                    <th>Lượt dùng</th>
                    <th>Trạng thái</th>
                    <th className="!text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {vouchers.map((v) => {
                    const st = voucherState(v);
                    const used = v.usedCount || 0;
                    const pct = v.usageLimit
                      ? Math.min(100, Math.round((used / v.usageLimit) * 100))
                      : null;
                    return (
                      <tr key={v._id} className={editingId === v._id ? "bg-accent/5" : ""}>
                        <td>
                          <span className="rounded border border-dashed border-ink/30 px-2 py-0.5 font-mono text-xs font-semibold tracking-wider">
                            {v.code}
                          </span>
                        </td>
                        <td className="text-right font-display text-lg tabular-nums">
                          {Number(v.discountPercent || 0)}%
                        </td>
                        <td className="whitespace-nowrap text-muted">
                          {formatDate(v.expiresAt) || "Không hạn"}
                        </td>
                        <td className="min-w-[120px]">
                          <p className="text-xs tabular-nums">
                            {used}
                            {v.usageLimit ? ` / ${v.usageLimit}` : " · không giới hạn"}
                          </p>
                          {pct !== null ? (
                            <div className="mt-1.5 h-1 w-full rounded-full bg-ink/10">
                              <div
                                className="h-1 rounded-full bg-accent"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          ) : null}
                        </td>
                        <td>
                          <Pill tone={st.tone}>{st.label}</Pill>
                        </td>
                        <td>
                          <div className="flex justify-end gap-2">
                            <button className="btn-xs-line" onClick={() => startEdit(v)}>
                              Sửa
                            </button>
                            <button className="btn-xs-danger" onClick={() => remove(v._id)}>
                              Xóa
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <form
          onSubmit={submit}
          className="panel order-1 space-y-4 p-5 lg:sticky lg:top-10 lg:order-2"
        >
          <div className="flex items-baseline justify-between">
            <h2 className="text-lg font-medium">
              {editingId ? "Sửa mã" : "Tạo mã mới"}
            </h2>
            {editingId ? (
              <button type="button" className="text-xs text-muted hover:text-ink" onClick={resetForm}>
                Hủy sửa
              </button>
            ) : null}
          </div>
          <div>
            <label className="field-label" htmlFor="voucher-code">
              Mã
            </label>
            <input
              id="voucher-code"
              value={form.code}
              onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
              placeholder="VD: SACHMOI10"
              className="field font-mono uppercase tracking-wider"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="field-label" htmlFor="voucher-pct">
                Giảm (%)
              </label>
              <input
                id="voucher-pct"
                value={form.discountPercent}
                onChange={(e) => setForm((f) => ({ ...f, discountPercent: e.target.value }))}
                type="number"
                min={0}
                max={100}
                className="field"
                required
              />
            </div>
            <div>
              <label className="field-label" htmlFor="voucher-limit">
                Giới hạn lượt
              </label>
              <input
                id="voucher-limit"
                value={form.usageLimit}
                onChange={(e) => setForm((f) => ({ ...f, usageLimit: e.target.value }))}
                placeholder="Không giới hạn"
                type="number"
                min={1}
                className="field"
              />
            </div>
          </div>
          <div>
            <label className="field-label" htmlFor="voucher-exp">
              Ngày hết hạn
            </label>
            <input
              id="voucher-exp"
              value={form.expiresAt}
              onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))}
              type="date"
              className="field"
            />
          </div>
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="checkbox checkbox-sm checkbox-primary"
              checked={form.active}
              onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
            />
            Kích hoạt ngay
          </label>
          <button className="btn-xs-solid w-full">
            {editingId ? "Lưu thay đổi" : "Tạo mã"}
          </button>
        </form>
      </div>
    </AdminLayout>
  );
}

export default VouchersAdmin;
