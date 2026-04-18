import Home from "./home/Home";
import { Navigate, Route, Routes } from "react-router-dom";
import Courses from "./courses/Courses";
import Signup from "./components/Signup";
import { Toaster } from "react-hot-toast";
import { useAuth } from "./context/AuthProvider";
import Cart from "./cart/Cart";
import BooksAdmin from "./admin/BooksAdmin";
import About from "./pages/About";
import Contact from "./pages/Contact";

function App() {
  const [authUser] = useAuth();
  return (
    <>
      <div className="dark:bg-slate-900 dark:text-white">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/course" element={<Courses />} />
          <Route path="/cart" element={<Cart />} />
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
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
        <Toaster />
      </div>
    </>
  );
}

export default App;
