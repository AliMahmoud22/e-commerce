import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import axios from 'axios';
import Alert from '../components/Alert';

export default function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('success');

  useEffect(() => {
    const fetchCart = async () => {
      setIsLoading(true);
      try {
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/cart`, { withCredentials: true });
        setCartItems(res.data.cartItems || []);
      } catch (error) {
        setAlertMessage(
          error.response?.data?.message || 'Failed to load cart.',
        );
        setAlertType('error');
      }
      setIsLoading(false);
    };
    fetchCart();
  }, []);

  const handleRemove = async (itemId) => {
    try {
      await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/cart/${itemId}`);
      setCartItems(cartItems.filter((item) => item._id !== itemId));
      setAlertMessage('Item removed from cart.');
      setAlertType('success');
    } catch (error) {
      setAlertMessage(
        error.response?.data?.message || 'Failed to remove item from cart.',
      );
      setAlertType('error');
    }
  };
  const handleClear = async () => {
    try {
      await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/cart/`);
      setCartItems([]);
      setAlertMessage('cleared Cart.');
      setAlertType('success');
    } catch (error) {
      setAlertMessage(error.response?.data?.message || 'Failed to Clear Cart.');
      setAlertType('error');
    }
  };
  const handleQuantityChange = async (itemId, newQuantity) => {
    console.log(itemId, newQuantity);
    if (newQuantity < 1) return;
    try {
      await axios.patch(`${import.meta.env.VITE_BACKEND_URL}/api/cart/${itemId}`, { quantity: newQuantity });
      setCartItems((prev) =>
        prev.map((item) =>
          item._id === itemId ? { ...item, quantity: newQuantity } : item,
        ),
      );
    } catch (error) {
      setAlertMessage(
        error.response?.data?.message || 'Failed to update quantity.',
      );
      setAlertType('error');
    }
  };

  const handleCheckout = async () => {
    const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/orders/checkout`);
    window.open(response.data.session.url);
  };

  const total = cartItems.reduce(
    (sum, item) => sum + (item.product?.price || 0) * item.quantity,
    0,
  );

  return (
    <>
      {/*alert*/}
      <Alert
        message={alertMessage}
        type={alertType}
        onClose={() => setAlertMessage('')}
      />
      <Header />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Your Cart</h1>

        {isLoading ? (
          <div>Loading...</div>
        ) : cartItems.length === 0 ? (
          <div className="text-gray-500 mt-6">Your cart is empty.</div>
        ) : (
          <div className="space-y-6">
            {cartItems.map((item) => (
              <div
                key={item._id}
                className="flex items-center justify-between bg-white p-4 rounded shadow"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={item.product?.imageCover}
                    alt={item.product?.name}
                    className="w-16 h-16 object-cover rounded border"
                  />
                  <div>
                    <div className="font-semibold">{item.product?.name}</div>
                    <div className="text-gray-500">
                      ${item.product?.price} ×{' '}
                      <input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) =>
                          handleQuantityChange(item._id, Number(e.target.value))
                        }
                        className="w-16 px-2 py-1 border rounded ml-1"
                        style={{ width: 60 }}
                      />
                    </div>
                  </div>
                </div>
                <button
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-800"
                  onClick={() => handleRemove(item._id)}
                >
                  Remove
                </button>
              </div>
            ))}
            <div className="flex justify-end items-center mt-6 gap-4">
              <span className="font-bold text-lg">Total:</span>
              <span className="text-primary font-bold text-xl">
                ${total.toFixed(2)}
              </span>
              <button
                className="ml-4 px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                onClick={handleCheckout}
              >
                Checkout
              </button>
              <button
                className="text-white bg-red-500 rounded py-2 px-6 hover:bg-red-700"
                on
                onClick={handleClear}
              >
                Clear Cart
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
