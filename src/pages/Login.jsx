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
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary-600 rounded-2xl mb-4">
            <span className="text-4xl">🏥</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">МедГрафик</h1>
          <p className="text-gray-600 mt-2">Система управления медицинским расписанием</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="card mb-6">
          <h2 className="text-2xl font-bold mb-6 text-gray-900">Вход в систему</h2>

          {error && (
            <div className="p-4 mb-4 bg-danger-50 border border-danger-200 rounded-xl text-danger-700 text-sm">
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
            <a href="#" className="text-xs text-primary-600 hover:text-primary-700 mt-2 inline-block">
              Забыли пароль?
            </a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-3 text-lg font-semibold flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="animate-spin">⏳</span>
                Загрузка...
              </>
            ) : (
              <>
                Войти
                <span>→</span>
              </>
            )}
          </button>

          <p className="text-center text-sm text-gray-600 mt-4">
            Нет доступа?{" "}
            <a href="#" className="text-primary-600 hover:text-primary-700 font-semibold">
              Обратитесь в поддержку
            </a>
          </p>
        </form>

        {/* Test Credentials */}
        <div className="card bg-gray-50 border border-gray-200">
          <p className="text-xs font-semibold text-gray-600 mb-3 uppercase tracking-wide">
            Тестовые учетные данные
          </p>
          <div className="space-y-2">
            {testAccounts.map((acc, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setEmail(acc.email);
                  setPassword(acc.password);
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-white transition-colors"
              >
                <p className="font-medium text-gray-900">{acc.role}</p>
                <p className="text-xs text-gray-600">{acc.email} / {acc.password}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}