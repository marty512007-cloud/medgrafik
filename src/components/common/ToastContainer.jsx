import Toast from "./Toast";

export default function ToastContainer({ toasts, onRemoveToast }) {
  return (
    <div className="fixed top-0 right-0 z-50 pointer-events-none">
      {toasts.map(toast => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClose={() => onRemoveToast(toast.id)}
          />
        </div>
      ))}
    </div>
  );
}