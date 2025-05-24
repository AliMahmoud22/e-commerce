import { React, useRef, useEffect } from 'react';

export default function Alert({ message, type = 'success', onClose }) {
  const alertTimeout = useRef();
  //timeout for alert
  useEffect(() => {
    if (message) {
      alertTimeout.current = setTimeout(() => {
        onClose();
      }, 3000); // 3000ms = 3 seconds
    }
    return () => clearTimeout(alertTimeout.current);
  }, [message, onClose]);

  if (!message) return null;
  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] w-fit max-w-md px-4">
      <div
        className={`flex items-center gap-3 rounded-lg shadow-lg px-4 py-3 ${
          type === 'success'
            ? 'bg-blue-100 border text-center border-primary text-primary'
            : 'bg-red-100 border text-center border-red-400 text-red-700'
        }`}
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {type === 'success' ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          )}
        </svg>
        <span className="flex-1">{message}</span>
        <button
          onClick={onClose}
          className="text-xl font-bold text-gray-400 hover:text-gray-600 focus:outline-none"
          aria-label="Close"
        >
          &times;
        </button>
      </div>
    </div>
  );
}
