import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import AdminLayout, {
  EmptyState,
  LoadingRows,
  PageHeader,
  errorMessage,
} from "./AdminLayout";

function UsersAdmin() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const load = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/user", { withCredentials: true });
      setUsers(res?.data?.users || []);
    } catch (err) {
      toast.error(errorMessage(err, "Không tải được"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const updateRole = async (id, role) => {
    try {
      await axios.patch(`/user/${id}/role`, { role }, { withCredentials: true });
      toast.success("Đã cập nhật quyền");
      await load();
    } catch (err) {
      toast.error(errorMessage(err, "Cập nhật thất bại"));
    }
  };

  const remove = async (id) => {
    if (!confirm("Xóa người dùng này?")) return;
    try {
      await axios.delete(`/user/${id}`, { withCredentials: true });
      toast.success("Đã xóa người dùng");
      await load();
    } catch (err) {
      toast.error(errorMessage(err, "Xóa thất bại"));
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((u) => {
      if (roleFilter !== "all" && u.role !== roleFilter) return false;
      if (!q) return true;
      return (
        String(u.fullname || "").toLowerCase().includes(q) ||
        String(u.email || "").toLowerCase().includes(q)
      );
    });
  }, [users, search, roleFilter]);

  const adminCount = users.filter((u) => u.role === "admin").length;

  return (
    <AdminLayout>
      <PageHeader
        title="Người dùng"
        description={`${users.length} tài khoản · ${adminCount} quản trị viên`}
      />

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm theo tên hoặc email"
          className="field sm:max-w-sm"
          aria-label="Tìm người dùng"
        />
        <div className="flex rounded-md border border-line p-0.5" role="group" aria-label="Lọc theo quyền">
          {[
            { id: "all", label: "Tất cả" },
            { id: "user", label: "Khách" },
            { id: "admin", label: "Admin" },
          ].map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setRoleFilter(opt.id)}
              aria-pressed={roleFilter === opt.id}
              className={`h-9 flex-1 rounded px-4 text-sm transition-colors sm:flex-none ${
                roleFilter === opt.id ? "bg-ink text-paper" : "text-muted hover:text-ink"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6">
        {loading ? (
          <LoadingRows />
        ) : !filtered.length ? (
          <EmptyState title="Không có người dùng phù hợp" hint="Thử đổi từ khóa hoặc bộ lọc." />
        ) : (
          <div className="panel overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Người dùng</th>
                  <th>Quyền</th>
                  <th className="!text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => {
                  const name = u.fullname || u.email || "?";
                  return (
                    <tr key={u._id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink/[0.07] text-sm font-semibold">
                            {name.charAt(0).toUpperCase()}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate font-medium">{u.fullname || "—"}</p>
                            <p className="truncate text-xs text-muted">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <select
                          className="field h-9 w-32"
                          value={u.role}
                          onChange={(e) => updateRole(u._id, e.target.value)}
                          aria-label={`Quyền của ${name}`}
                        >
                          <option value="user">Khách</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="text-right">
                        <button className="btn-xs-danger" onClick={() => remove(u._id)}>
                          Xóa
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export default UsersAdmin;
