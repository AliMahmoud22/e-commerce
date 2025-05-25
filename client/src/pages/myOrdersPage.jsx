import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import axios from "axios";
import Alert from "../components/Alert";

export default function MyOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("success");

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      try {
        const res = await axios.get(`/api/orders/my-orders`);
        setOrders(res.data.orders || []);
        setIsLoading(false);
      } catch (error) {
        setAlertMessage(
          error.response?.data?.message || "Failed to load orders."
        );
        setAlertType("error");
      }
    };
    fetchOrders();
  }, []);

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    try {
      await axios.patch(`/api/orders/cancel/${orderId}`);
      setAlertMessage("Order cancelled successfully.");
      setAlertType("success");
      // Refresh orders
      setOrders((prev) =>
        prev.map((order) =>
          order._id === orderId ? { ...order, status: "cancelled" } : order
        )
      );
    } catch (error) {
      setAlertMessage(
        error.response?.data?.message || "Failed to cancel order."
      );
      setAlertType("error");
    }
  };

  return (
    <>
      {/*alert*/}
      <Alert
        message={alertMessage}
        type={alertType}
        onClose={() => setAlertMessage("")}
      />
      <Header />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">My Orders</h1>

        {isLoading ? (
          <div>Loading...</div>
        ) : orders.length === 0 ? (
          <div className="text-gray-500 mt-8 text-center">
            You have no orders yet.
          </div>
        ) : (
          <div className="space-y-8 mt-3">
            {orders.map((order) => (
              <div key={order._id} className="bg-white rounded shadow p-6">
                <div className="mb-2 flex justify-between items-center">
                  <span className="font-semibold">Order ID:</span>
                  <span className="text-gray-700">{order._id}</span>
                </div>
                <div className="mb-2 flex justify-between items-center">
                  <span className="font-semibold">Date:</span>
                  <span className="text-gray-700">
                    {new Date(order.createdAt).toLocaleString()}
                  </span>
                </div>
                <div className="mb-2 flex justify-between items-center">
                  <span className="font-semibold">Total:</span>
                  <span className="text-primary font-bold text-lg">
                    ${order.totalPrice?.toFixed(2)}
                  </span>
                </div>
                <div className="mb-2 flex justify-between items-center">
                  <span className="font-semibold">Status:</span>
                  <span
                    className={(() => {
                      if (order.status === "pending") return "text-purple-400-600";
                      if (order.status === "delivered") return "text-green-600";
                      if (order.status === "paid") return "text-amber-500";
                      if (order.status === "shipped") return "text-blue-500";
                      if (order.status === "cancelled") return "text-red-600";
                      return "text-gray-600";
                    })()}
                  >
                    {order.status}
                  </span>
                </div>
                <div className="mt-4">
                  <span className="font-semibold">Items:</span>
                  <ul className="list-disc ml-6">
                    {order.items?.map((item, idx) => (
                      <li key={idx} className="mb-1 mt-2   text-gray-600">
                        {item.product?.name || item.name} × {item.quantity} — EGP
                        {(item.price * item.quantity).toFixed(2)}
                      </li>
                    ))}
                  </ul>
                </div>
                {/* Cancel button for eligible orders */}
                {["pending", "paid"].includes(order.status) && (
                  <button
                    className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700"
                    onClick={() => handleCancelOrder(order._id)}
                  >
                    Cancel Order
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
