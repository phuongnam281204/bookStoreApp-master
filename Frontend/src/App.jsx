import Home from "./home/Home";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import Courses from "./courses/Courses";
import Signup from "./components/Signup";
import { Toaster } from "react-hot-toast";
import { useAuth } from "./context/AuthProvider";
import Cart from "./cart/Cart";
import BooksAdmin from "./admin/BooksAdmin";
import OrdersAdmin from "./admin/OrdersAdmin";
import UsersAdmin from "./admin/UsersAdmin";
import About from "./pages/About";
import Contact from "./pages/Contact";
import BookDetail from "./pages/BookDetail";
import Checkout from "./pages/Checkout";

function App() {
  const [authUser] = useAuth();
  const location = useLocation();
  return (
    <>
      <div className="dark:bg-slate-900 dark:text-white">
        <div className="page-transition" key={location.pathname}>
          <Routes location={location}>
            <Route path="/" element={<Home />} />
            <Route path="/course" element={<Courses />} />
            <Route path="/book/:id" element={<BookDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route
              path="/admin/books"
              element={
                !authUser ? (
                  <Navigate to="/signup" />
                ) : authUser.role === "admin" ? (
                  <BooksAdmin />
                ) : (
                  <Navigate to="/" />
                )
              }
            />
            <Route
              path="/admin/users"
              element={
                !authUser ? (
                  <Navigate to="/signup" />
                ) : authUser.role === "admin" ? (
                  <UsersAdmin />
                ) : (
                  <Navigate to="/" />
                )
              }
            />
            <Route
              path="/admin/orders"
              element={
                !authUser ? (
                  <Navigate to="/signup" />
                ) : authUser.role === "admin" ? (
                  <OrdersAdmin />
                ) : (
                  <Navigate to="/" />
                )
              }
            />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/signup" element={<Signup />} />
          </Routes>
        </div>
        <Toaster />
      </div>
    </>
  );
}

export default App;
