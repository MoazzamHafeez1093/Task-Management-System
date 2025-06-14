import React, { useEffect, useState } from 'react';

const Toast = ({ message, type, id, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onClose(id), 300); // Allow fade-out animation before removal
    }, 3000); // Toast disappears after 3 seconds

    return () => clearTimeout(timer);
  }, [id, onClose]);

  const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
  const icon = type === 'success' ? '✔' : '✖';

  return (
    <div
      className={`flex items-center gap-2 text-white px-4 py-2 rounded shadow-lg transition-opacity duration-300 ${bgColor} ${isVisible ? 'opacity-100' : 'opacity-0'}`}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <span className="text-xl">{icon}</span>
      <p>{message}</p>
      <button
        onClick={() => {
          setIsVisible(false);
          setTimeout(() => onClose(id), 300);
        }}
        className="ml-auto text-white opacity-75 hover:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-white rounded-full p-1"
        aria-label="Close notification"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

export default Toast; 