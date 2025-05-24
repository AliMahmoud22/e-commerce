import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import axios from 'axios';
import Alert from '../components/Alert';

export default function MyOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('success');

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      try {
        const res = await axios.get(
          `/api/orders/my-orders`
        );
        setOrders(res.data.orders || []);
        setIsLoading(false);
      } catch (error) {
        setAlertMessage(
          error.response?.data?.message || 'Failed to load orders.'
        );
        setAlertType('error');
      }
    };
    fetchOrders();
  }, []);

  return (
    <>
      {/*alert*/}
      <Alert
        message={alertMessage}
        type={alertType}
        onClose={() => setAlertMessage('')}
      />
      <Header />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">My Orders</h1>

        {isLoading ? (
          <div>Loading...</div>
        ) : orders.length === 0 ? (
          <div className="text-gray-500">You have no orders yet.</div>
        ) : (
          <div className="space-y-8">
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
                    className={
                      order.isDelivered ? 'text-green-600' : 'text-yellow-600'
                    }
                  >
                    {order.isDelivered ? 'Delivered' : 'Processing'}
                  </span>
                </div>
                <div className="mt-4">
                  <span className="font-semibold">Items:</span>
                  <ul className="list-disc ml-6">
                    {order.orderItems?.map((item, idx) => (
                      <li key={idx} className="mb-1">
                        {item.product?.name || item.name} × {item.quantity} — $
                        {(item.price * item.quantity).toFixed(2)}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
