import { useAuth } from "../context/AuthProvider";
import toast from "react-hot-toast";
import axios from "axios";
import { useI18n } from "../context/I18nProvider";
import { useCart } from "../context/CartProvider";

function Logout() {
  const [, setAuthUser] = useAuth();
  const { clear } = useCart();
  const { t } = useI18n();
  const handleLogout = async () => {
    try {
      await axios.post("/user/logout", {}, { withCredentials: true });
    } catch {
      // ignore
    }

    setAuthUser(undefined);
    localStorage.removeItem("Users");
    clear();
    toast.success(t("auth.toast.logoutSuccess"));
  };
  return (
    <button
      className="btn btn-error btn-sm whitespace-nowrap"
      onClick={handleLogout}
    >
      {t("nav.logout")}
    </button>
  );
}

export default Logout;
