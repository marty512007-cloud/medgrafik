import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { ScheduleProvider } from "./context/ScheduleContext";
import "./index.css";

// 🇷🇺 Подключаем русский локаль для dayjs
import dayjs from "dayjs";
import "dayjs/locale/ru";
dayjs.locale("ru");

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <AuthProvider>
      <ScheduleProvider>
        <App />
      </ScheduleProvider>
    </AuthProvider>
  </BrowserRouter>
);