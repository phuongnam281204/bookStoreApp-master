import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

export const AuthContext = createContext();

export default function AuthProvider({ children }) {
  const initialAuthUser = localStorage.getItem("Users");
  const [authUser, setAuthUser] = useState(
    initialAuthUser ? JSON.parse(initialAuthUser) : undefined,
  );

  useEffect(() => {
    const sync = async () => {
      try {
        const res = await axios.get("/user/me", { withCredentials: true });
        const user = res?.data?.user;
        if (user) {
          setAuthUser(user);
          localStorage.setItem("Users", JSON.stringify(user));
        }
      } catch (err) {
        const status = err?.response?.status;
        if (status === 401) {
          setAuthUser(undefined);
          localStorage.removeItem("Users");
        }
      }
    };

    sync();
  }, []);

  return (
    <AuthContext.Provider value={[authUser, setAuthUser]}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
