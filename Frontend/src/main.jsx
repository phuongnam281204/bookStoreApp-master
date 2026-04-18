import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import AuthProvider from "./context/AuthProvider.jsx";
import CartProvider from "./context/CartProvider.jsx";
import I18nProvider from "./context/I18nProvider.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <I18nProvider>
      <AuthProvider>
        <CartProvider>
          <div className="dark:bg-slate-900 dark:text-white">
            <App />
          </div>
        </CartProvider>
      </AuthProvider>
    </I18nProvider>
  </BrowserRouter>,
);
