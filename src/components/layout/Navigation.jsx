import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Navigation({ open, setOpen }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  const navigationLinks = [
    { path: "/dashboard", label: "Дашборд", icon: "📊", roles: ["admin", "registrar", "doctor"] },
    { path: "/schedule", label: "Расписание", icon: "📅", roles: ["admin", "doctor"] },
    { path: "/appointments", label: "Записи", icon: "📋", roles: ["admin", "registrar", "patient"] },
    { path: "/reports", label: "Отчёты", icon: "📈", roles: ["admin", "registrar", "doctor"] },
    { path: "/doctors", label: "Врачи", icon: "👨‍⚕️", roles: ["admin"] }
  ];

  const visibleLinks = navigationLinks.filter(link => link.roles.includes(user?.role));

  return (
    <div className={`${open ? "w-64" : "w-20"} bg-white shadow-lg transition-all duration-300 flex flex-col`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        {open && (
          <div>
            <h1 className="text-xl font-bold text-primary-600">МедГрафик</h1>
            <p className="text-xs text-gray-500">Система расписания</p>
          </div>
        )}
        <button
          onClick={() => setOpen(!open)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          {open ? "←" : "→"}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {visibleLinks.map(link => (
          <Link
            key={link.path}
            to={link.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
              isActive(link.path)
                ? "bg-primary-50 text-primary-600 font-semibold"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <span className="text-lg">{link.icon}</span>
            {open && <span>{link.label}</span>}
          </Link>
        ))}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-200 space-y-3">
        {open && (
          <div className="text-sm">
            <p className="font-semibold text-gray-900">{user?.name}</p>
            <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="w-full btn-danger text-sm py-2"
        >
          {open ? "Выход" : "←"}
        </button>
      </div>
    </div>
  );
}