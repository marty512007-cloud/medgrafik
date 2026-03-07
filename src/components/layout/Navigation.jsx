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
    { path: "/dashboard", label: "Дашборд", roles: ["admin", "registrar", "doctor"] },
    { path: "/schedule", label: "Расписание", roles: ["admin", "doctor"] },
    { path: "/appointments", label: "Записи", roles: ["admin", "registrar"] },
    { path: "/reports", label: "Отчёты", roles: ["admin"] },
    { path: "/doctors", label: "Врачи", roles: ["admin"] }
  ];

  const visibleLinks = navigationLinks.filter(link => link.roles.includes(user?.role));

  return (
    <div className={`${open ? "w-64" : "w-16"} bg-white border-r border-gray-200 transition-all duration-300 flex flex-col`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        {open && (
          <div>
            <h1 className="text-lg font-semibold text-gray-900">МедГрафик</h1>
            <p className="text-xs text-gray-500">Система расписания</p>
          </div>
        )}
        <button
          onClick={() => setOpen(!open)}
          className="p-2 hover:bg-gray-100 transition-colors text-gray-600"
        >
          {open ? "←" : "→"}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {visibleLinks.map(link => (
          <Link
            key={link.path}
            to={link.path}
            className={`flex items-center gap-3 px-3 py-2 transition-colors text-sm ${
              isActive(link.path)
                ? "bg-gray-100 text-gray-900 font-semibold border-l-2 border-gray-900"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            {open && <span>{link.label}</span>}
            {!open && <span className="text-xs font-medium text-gray-500" title={link.label}>{link.label[0]}</span>}
          </Link>
        ))}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-200 space-y-3">
        {open && (
          <div className="text-sm">
            <p className="font-medium text-gray-900">{user?.name}</p>
            <p className="text-xs text-gray-500">
              {user?.role === "admin" ? "Администратор" :
               user?.role === "doctor" ? "Врач" :
               user?.role === "registrar" ? "Регистратор" : user?.role}
            </p>
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