import { useEffect, useState } from "react";
import axios from "axios";
import Alert from "../../components/Alert";
import { PencilIcon, TrashIcon, XMarkIcon,HandThumbUpIcon } from "@heroicons/react/24/outline";
export default function OrdersManagePage() {
  const [orders, setOrders] = useState([]);
  const [searchTermId, setSearchTermId] = useState("");
  const [searchTermUsername, setSearchTermUsername] = useState("");
  const [search, setSearch] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("success");
  const [editingOrderId, setEditingOrderId] = useState(null);
  const [editingStatus, setEditingStatus] = useState("");

  const fetchOrders = async () => {
    let url = "/api/orders";
    let param = [];
    if (searchTermId) {
      param.push(`id=${searchTermId}`);
    }
    if (searchTermUsername) param.push(`username=${searchTermUsername}`);
    if (param.length) url += "?" + param.join("&");

    try {
      const res = await axios.get(url);
      setOrders(res.data.orders);
    
    } catch (err) {
      setAlertMessage(err.response?.data?.message || "Failed to fetch orders");
      setAlertType("error");
      setOrders([]);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [search]);

  const handleStatusEdit = (orderId, currentStatus) => {
    setEditingOrderId(orderId);
    setEditingStatus(currentStatus);
  };

  const handleStatusSave = async (orderId) => {
    try {
      await axios.patch(`/api/orders/${orderId}`, { status: editingStatus });
      setAlertMessage("Order status updated successfully");
      setAlertType("success");
      setEditingOrderId(null);
      fetchOrders();
    } catch (err) {
      setAlertMessage(err.response?.data?.message || "Failed to update status");
      setAlertType("error");
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!confirm("Cancel this order?")) return;
    try {
      await axios.patch(`/api/orders/${orderId}`, { status: "cancelled" });
      setAlertMessage("Order cancelled successfully");
      setAlertType("success");
      fetchOrders();
    } catch (err) {
      setAlertMessage(err.response?.data?.message || "Failed to cancel order");
      setAlertType("error");
    }
  };
  const handleDeleteOrder = async (orderId) => {
    if (!confirm("Delete this order? This action cannot be undone.")) return;
    try {
      await axios.delete(`/api/orders/${orderId}`);
      setAlertMessage("Order deleted successfully");
      setAlertType("success");
      fetchOrders();
    } catch (err) {
      setAlertMessage(err.response?.data?.message || "Failed to delete order");
      setAlertType("error");
    }
  };
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Manage Orders</h1>

      <Alert
        message={alertMessage}
        type={alertType}
        onClose={() => setAlertMessage("")}
      />

      <input
        type="text"
        placeholder="Search by order ID..."
        className="border rounded px-2 py-1 mb-4 m-2"
        value={searchTermId}
        onChange={(e) => setSearchTermId(e.target.value)}
      />
      <input
        type="text"
        placeholder="Search by user name..."
        className="border rounded px-2 py-1 mb-4 m-2"
        value={searchTermUsername}
        onChange={(e) => setSearchTermUsername(e.target.value)}
      />
      <button
        onClick={setSearch}
        className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-200"
      >
        Search
      </button>

      <table className="table-auto w-full border">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="p-2 border">Order ID</th>
            <th className="p-2 border">User</th>
            <th className="p-2 border">Total Price</th>
            <th className="p-2 border">Status</th>
            <th className="p-2 border">Created At</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders && orders.length > 0 ? (
            orders.map((order) => (
              <tr key={order._id}>
                <td className="p-2 border">{order._id}</td>
                <td className="p-2 border">{order.user?.name || "Unknown"}</td>
                <td className="p-2 border">{order.totalPrice}</td>
                <td className="p-2 border">
                  {editingOrderId === order._id ? (
                    <select
                      value={editingStatus}
                      onChange={(e) => setEditingStatus(e.target.value)}
                      className="border px-1 py-0.5"
                    >
                      <option value="pending">Pending</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  ) : (
                    order.status
                  )}
                </td>
                <td className="p-2 border">
                  {new Date(order.createdAt).toLocaleString()}
                </td>
                <td className="p-2 flex border space-x-2">
                  {editingOrderId === order._id ? (
                    <>
                      <button
                        onClick={() => handleStatusSave(order._id)}
                        className="bg-green-500 hover:bg-green-400 flex items-center text-white px-2 py-1  rounded"
                      >
                        <HandThumbUpIcon className="h-4 w-4 m-auto mr-1" />
                        Save
                      </button>
                      <button
                        onClick={() => handleStatusEdit(null)}
                        className="bg-gray-500 hover:bg-gray-400 flex items-center text-white px-2 py-1 rounded"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleStatusEdit(order._id, order.status)}
                      className="bg-blue-500 hover:bg-blue-400 flex items-center text-white px-2 py-1 rounded"
                    >
                      <PencilIcon className="h-4 w-4 m-auto mr-1" />
                      Edit
                    </button>
                  )}
                  <button
                    onClick={() => handleCancelOrder(order._id)}
                    className="bg-yellow-500 hover:bg-yellow-400 text-white flex items-center px-2 py-1 rounded"
                  >
                    <XMarkIcon className="h-4 w-4 m-auto mr-1" />
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDeleteOrder(order._id)}
                    className="bg-red-500 hover:bg-red-400 text-white flex items-center px-2 py-1 rounded"
                  >
                    <TrashIcon className="h-4 w-4 m-auto mr-1" />
                    Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="p-2 border text-center">
                No orders found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
