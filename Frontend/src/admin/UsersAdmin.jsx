import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import axios from "axios";
import toast from "react-hot-toast";

function UsersAdmin() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/user", { withCredentials: true });
      setUsers(res?.data?.users || []);
    } catch (err) {
      const message =
        err?.response?.data?.message || err?.message || "Failed to load";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const updateRole = async (id, role) => {
    try {
      await axios.patch(
        `/user/${id}/role`,
        { role },
        { withCredentials: true },
      );
      toast.success("Role updated");
      await load();
    } catch (err) {
      const message =
        err?.response?.data?.message || err?.message || "Update failed";
      toast.error(message);
    }
  };

  const remove = async (id) => {
    if (!confirm("Delete this user?")) return;
    try {
      await axios.delete(`/user/${id}`, { withCredentials: true });
      toast.success("User deleted");
      await load();
    } catch (err) {
      const message =
        err?.response?.data?.message || err?.message || "Delete failed";
      toast.error(message);
    }
  };

  return (
    <>
      <Navbar />
      <div className="max-w-screen-2xl container mx-auto md:px-20 px-4 min-h-screen pt-28">
        <h1 className="text-2xl font-bold">Admin: Users</h1>

        <div className="mt-8">
          {loading ? (
            <p>Loading...</p>
          ) : users.length ? (
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id}>
                      <td>{u.fullname}</td>
                      <td>{u.email}</td>
                      <td>
                        <select
                          className="select select-bordered select-sm"
                          value={u.role}
                          onChange={(e) => updateRole(u._id, e.target.value)}
                        >
                          <option value="user">user</option>
                          <option value="admin">admin</option>
                        </select>
                      </td>
                      <td>
                        <button
                          className="px-3 py-1 bg-red-500 text-white rounded-md"
                          onClick={() => remove(u._id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>No users found.</p>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}

export default UsersAdmin;
