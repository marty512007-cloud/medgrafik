import { useState, useEffect } from "react";

export default function Toast({ message, type = "success", duration = 3000, onClose }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onClose) {
        setTimeout(onClose, 300); // Дождёмся анимации закрытия
      }
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getStyles = () => {
    switch (type) {
      case "success":
        return {
          bg: "bg-green-50",
          border: "border-green-200",
          text: "text-green-800",
          icon: "✅",
          accentBg: "bg-green-500"
        };
      case "error":
        return {
          bg: "bg-red-50",
          border: "border-red-200",
          text: "text-red-800",
          icon: "❌",
          accentBg: "bg-red-500"
        };
      case "warning":
        return {
          bg: "bg-yellow-50",
          border: "border-yellow-200",
          text: "text-yellow-800",
          icon: "⚠️",
          accentBg: "bg-yellow-500"
        };
      case "info":
        return {
          bg: "bg-blue-50",
          border: "border-blue-200",
          text: "text-blue-800",
          icon: "ℹ️",
          accentBg: "bg-blue-500"
        };
      default:
        return {
          bg: "bg-gray-50",
          border: "border-gray-200",
          text: "text-gray-800",
          icon: "📝",
          accentBg: "bg-gray-500"
        };
    }
  };

  const styles = getStyles();

  return (
    <div
      className={`fixed top-6 right-6 z-50 transition-all duration-300 transform ${
        isVisible
          ? "translate-x-0 opacity-100 scale-100"
          : "translate-x-96 opacity-0 scale-95"
      }`}
    >
      <div className={`${styles.bg} ${styles.border} border-2 rounded-xl p-4 shadow-2xl max-w-md`}>
        {/* Progress Bar */}
        <div className={`absolute top-0 left-0 h-1 ${styles.accentBg} rounded-t-lg transition-all`}
          style={{
            width: "100%",
            animation: `slideOut ${duration}ms linear forwards`
          }}
        ></div>

        <div className="flex items-start gap-4 pt-1">
          {/* Icon */}
          <div className="text-2xl flex-shrink-0 mt-1">{styles.icon}</div>

          {/* Content */}
          <div className="flex-1">
            <p className={`${styles.text} font-semibold break-words`}>
              {message}
            </p>
          </div>

          {/* Close Button */}
          <button
            onClick={() => setIsVisible(false)}
            className={`flex-shrink-0 text-xl leading-none ${styles.text} hover:opacity-70 transition-opacity`}
          >
            ✕
          </button>
        </div>
      </div>

      {/* CSS Animation */}
      <style>{`
        @keyframes slideOut {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  );
}