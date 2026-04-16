import { useAuth } from "../context/AuthProvider";
import toast from "react-hot-toast";
import axios from "axios";

function Logout() {
  const [, setAuthUser] = useAuth();
  const handleLogout = async () => {
    try {
      await axios.post("/user/logout", {}, { withCredentials: true });
    } catch {
      // ignore
    }

    setAuthUser(undefined);
    localStorage.removeItem("Users");
    toast.success("Logout successfully");
  };
  return (
    <div>
      <button
        className="px-3 py-2 bg-red-500 text-white rounded-md cursor-pointer"
        onClick={handleLogout}
      >
        Logout
      </button>
    </div>
  );
}

export default Logout;
