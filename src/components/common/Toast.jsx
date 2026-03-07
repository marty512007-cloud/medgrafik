import { useState, useEffect } from "react";

export default function Toast({ message, type = "success", duration = 3000, onClose }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onClose) {
        setTimeout(onClose, 300);
      }
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getTypeLabel = () => {
    switch (type) {
      case "success": return "Успешно";
      case "error": return "Ошибка";
      case "warning": return "Внимание";
      case "info": return "Информация";
      default: return "";
    }
  };

  return (
    <div
      className={`fixed top-6 right-6 z-50 transition-all duration-300 transform ${
        isVisible
          ? "translate-x-0 opacity-100"
          : "translate-x-96 opacity-0"
      }`}
    >
      <div className="bg-white border border-gray-300 p-4 max-w-md shadow-sm">
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 h-0.5 bg-gray-800 transition-all"
          style={{
            width: "100%",
            animation: `slideOut ${duration}ms linear forwards`
          }}
        ></div>

        <div className="flex items-start gap-3 pt-1">
          {/* Type label */}
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex-shrink-0 mt-0.5">
            {getTypeLabel()}
          </span>

          {/* Content */}
          <div className="flex-1">
            <p className="text-gray-900 text-sm break-words">
              {message}
            </p>
          </div>

          {/* Close Button */}
          <button
            onClick={() => setIsVisible(false)}
            className="flex-shrink-0 text-gray-400 hover:text-gray-700 transition-colors text-sm leading-none"
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