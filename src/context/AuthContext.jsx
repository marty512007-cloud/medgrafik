import { createContext, useContext, useReducer, useEffect } from "react";

const AuthContext = createContext();

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: true,
  error: null
};

const authReducer = (state, action) => {
  switch (action.type) {
    case "LOGIN":
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        error: null
      };
    case "LOGOUT":
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        error: null
      };
    case "SET_LOADING":
      return {
        ...state,
        loading: action.payload
      };
    case "SET_ERROR":
      return {
        ...state,
        error: action.payload
      };
    default:
      return state;
  }
};

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Проверяем сохранённую сессию при загрузке
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        dispatch({ type: "LOGIN", payload: user });
      } catch (err) {
        localStorage.removeItem("user");
      }
    }
    dispatch({ type: "SET_LOADING", payload: false });
  }, []);

  const login = (email, password) => {
    // Валидация тестовых учетных данных (БЕЗ ПАЦИЕНТА)
    const testUsers = [
      { email: "admin@med.ru", password: "admin", role: "admin", name: "Администратор" },
      { email: "doc@med.ru", password: "doc", role: "doctor", name: "Иван Петров", doctorId: "doc-1" },
      { email: "reg@med.ru", password: "reg", role: "registrar", name: "Мария Сидорова" }
    ];

    const user = testUsers.find(u => u.email === email && u.password === password);

    if (user) {
      const userData = {
        id: Math.random().toString(36).substr(2, 9),
        email: user.email,
        role: user.role,
        name: user.name,
        ...(user.doctorId && { doctorId: user.doctorId })
      };
      localStorage.setItem("user", JSON.stringify(userData));
      dispatch({ type: "LOGIN", payload: userData });
      return true;
    }
    dispatch({ type: "SET_ERROR", payload: "Неверные учетные данные" });
    return false;
  };

  const logout = () => {
    localStorage.removeItem("user");
    dispatch({ type: "LOGOUT" });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth должен быть использован внутри AuthProvider");
  }
  return context;
}