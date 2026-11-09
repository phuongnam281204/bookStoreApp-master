import { useLayoutEffect } from "react";
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
import VouchersAdmin from "./admin/VouchersAdmin";
import AdminDashboard from "./admin/AdminDashboard";
import About from "./pages/About";
import Contact from "./pages/Contact";
import BookDetail from "./pages/BookDetail";
import Checkout from "./pages/Checkout";
import MyOrders from "./pages/MyOrders";
import PaymentResult from "./pages/PaymentResult";
import ResetPassword from "./pages/ResetPassword";
import Leaderboard from "./pages/Leaderboard";

function App() {
  const [authUser] = useAuth();
  const admin = (page) =>
    !authUser ? (
      <Navigate to="/signup" />
    ) : authUser.role === "admin" ? (
      page
    ) : (
      <Navigate to="/" />
    );
  const location = useLocation();

  // A new page starts at its top; a hash link (#reviews) still jumps to its anchor.
  useLayoutEffect(() => {
    if (location.hash) return;
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [location.pathname, location.search, location.hash]);

  return (
    <>
      <div className="min-h-screen bg-paper text-ink">
        <div className="page-transition" key={location.pathname}>
          <Routes location={location}>
            <Route path="/" element={<Home />} />
            <Route path="/course" element={<Courses />} />
            <Route path="/bestsellers" element={<Leaderboard />} />
            <Route path="/book/:id" element={<BookDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route
              path="/orders"
              element={!authUser ? <Navigate to="/signup" /> : <MyOrders />}
            />
            <Route
              path="/payment-result"
              element={
                !authUser ? <Navigate to="/signup" /> : <PaymentResult />
              }
            />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/admin" element={admin(<AdminDashboard />)} />
            <Route path="/admin/books" element={admin(<BooksAdmin />)} />
            <Route path="/admin/users" element={admin(<UsersAdmin />)} />
            <Route path="/admin/orders" element={admin(<OrdersAdmin />)} />
            <Route path="/admin/vouchers" element={admin(<VouchersAdmin />)} />
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
