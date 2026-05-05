import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function OrdersAdmin() {
  return (
    <>
      <Navbar />
      <div className="max-w-screen-2xl container mx-auto md:px-20 px-4 min-h-screen pt-28">
        <h1 className="text-2xl font-bold">Admin: Orders</h1>
        <p className="mt-4 opacity-80">
          Trang quan ly don hang (dang cap nhat).
        </p>
      </div>
      <Footer />
    </>
  );
}

export default OrdersAdmin;
