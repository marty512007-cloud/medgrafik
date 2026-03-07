import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("admin@med.ru");
  const [password, setPassword] = useState("admin");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    setTimeout(() => {
      const success = login(email, password);
      if (success) {
        navigate("/dashboard");
      } else {
        setError("Неверные учетные данные. Проверьте email и пароль.");
      }
      setLoading(false);
    }, 500);
  };

  const testAccounts = [
    { email: "admin@med.ru", password: "admin", role: "Администратор" },
    { email: "doc@med.ru", password: "doc", role: "Врач" },
    { email: "reg@med.ru", password: "reg", role: "Регистратор" }
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold text-gray-900">МедГрафик</h1>
          <p className="text-gray-600 mt-2">Система управления медицинским расписанием</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="card mb-4">
          <h2 className="text-xl font-semibold mb-6 text-gray-900">Вход в систему</h2>

          {error && (
            <div className="p-3 mb-4 bg-gray-100 border border-gray-400 text-gray-800 text-sm">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Email адрес</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="input-field"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Пароль</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="input-field"
              required
            />
            <a href="#" className="text-xs text-gray-600 hover:text-gray-900 mt-2 inline-block">
              Забыли пароль?
            </a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-3 text-base"
          >
            {loading ? "Загрузка..." : "Войти"}
          </button>

          <p className="text-center text-sm text-gray-600 mt-4">
            Нет доступа?{" "}
            <a href="#" className="text-gray-900 hover:underline font-medium">
              Обратитесь в поддержку
            </a>
          </p>
        </form>

        {/* Test Credentials */}
        <div className="card border border-gray-200">
          <p className="text-xs font-semibold text-gray-600 mb-3 uppercase tracking-wide">
            Тестовые учетные данные
          </p>
          <div className="space-y-1">
            {testAccounts.map((acc, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setEmail(acc.email);
                  setPassword(acc.password);
                }}
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 transition-colors"
              >
                <p className="font-medium text-gray-900">{acc.role}</p>
                <p className="text-xs text-gray-500">{acc.email} / {acc.password}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}