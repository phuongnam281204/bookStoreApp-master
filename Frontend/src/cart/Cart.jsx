import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useCart } from "../context/CartProvider";
import { useAuth } from "../context/AuthProvider";
import axios from "axios";
import toast from "react-hot-toast";

function Cart() {
  const { items, removeItem, setQty, clear, totals } = useCart();
  const [authUser] = useAuth();

  const placeOrder = async () => {
    if (!items.length) {
      toast.error("Cart is empty");
      return;
    }
    if (!authUser?._id) {
      toast.error("Please login to checkout");
      return;
    }

    try {
      const payload = {
        items: items.map((x) => ({
          bookId: x.id,
          name: x.name,
          price: x.price,
          qty: x.qty,
        })),
        total: totals.total,
      };

      const res = await axios.post("/order", payload, {
        withCredentials: true,
      });
      if (res.data) {
        toast.success("Order placed");
        clear();
      }
    } catch (err) {
      const message =
        err?.response?.data?.message || err?.message || "Order failed";
      toast.error(message);
    }
  };

  return (
    <>
      <Navbar />
      <div className="max-w-screen-2xl container mx-auto md:px-20 px-4 min-h-screen pt-28">
        <h1 className="text-2xl font-bold">Cart</h1>

        {!items.length ? (
          <p className="mt-4">Your cart is empty.</p>
        ) : (
          <>
            <div className="mt-6 space-y-4">
              {items.map((x) => (
                <div
                  key={x.id}
                  className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 border rounded-lg dark:border-slate-700"
                >
                  <div className="flex items-center gap-4">
                    {x.image ? (
                      <img
                        src={x.image}
                        alt={x.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                    ) : null}
                    <div>
                      <div className="font-semibold">{x.name}</div>
                      <div className="text-sm opacity-80">${x.price}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min={1}
                      value={x.qty}
                      onChange={(e) => setQty(x.id, e.target.value)}
                      className="w-20 px-2 py-1 border rounded-md dark:bg-slate-900 dark:border-slate-700"
                    />
                    <button
                      className="px-3 py-2 bg-red-500 text-white rounded-md"
                      onClick={() => removeItem(x.id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="font-semibold">Items: {totals.count}</div>
                <div className="font-semibold">
                  Total: ${totals.total.toFixed(2)}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  className="px-4 py-2 border rounded-md dark:border-slate-700"
                  onClick={clear}
                >
                  Clear cart
                </button>
                <button
                  className="px-4 py-2 bg-pink-500 text-white rounded-md"
                  onClick={placeOrder}
                >
                  Checkout
                </button>
              </div>
            </div>
          </>
        )}
      </div>
      <Footer />
    </>
  );
}

export default Cart;
