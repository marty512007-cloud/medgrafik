import { useSchedule } from "../context/ScheduleContext";
import { useAuth } from "../context/AuthContext";
import dayjs from "dayjs";
import { getUtilizationByDoctor } from "../utils/scheduleUtils";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import "dayjs/locale/ru";

dayjs.locale("ru");

// 🔴 ФУНКЦИЯ ДЛЯ ИЗВЛЕЧЕНИЯ ФАМИЛИИ
const extractLastName = (fullName) => {
  if (!fullName) return "Unknown";
  const parts = fullName.trim().split(/\s+/);
  return parts[0]; // Первое слово - это фамилия
};

export default function Dashboard() {
  const { doctors, workSlots, appointments } = useSchedule();
  const { user } = useAuth();

  // Рассчитываем утилизацию за последние 7 дней
  const dateFrom = dayjs().subtract(7, "day").format("YYYY-MM-DD");
  const dateTo = dayjs().format("YYYY-MM-DD");
  
  const utilizationByDoctor = getUtilizationByDoctor(doctors, workSlots, appointments, dateFrom, dateTo);

  // 🔴 КРИТИЧЕСКОЕ: Преобразуем данные для графика - ТОЛЬКО ФАМИЛИИ
  const chartData = utilizationByDoctor.map(doc => ({
    name: extractLastName(doc.doctorName), // ← ТОЛЬКО ФАМИЛИЯ
    utilization: doc.utilization,
    booked: doc.bookedSlots,
    total: doc.totalSlots
  }));

  // Статистика
  const totalSlots = workSlots.reduce((sum, ws) => sum + ws.slots.length, 0);
  const bookedAppointments = appointments.filter(a => a.status === "booked").length;
  const avgUtilization = utilizationByDoctor.length > 0
    ? Math.round(utilizationByDoctor.reduce((sum, d) => sum + d.utilization, 0) / utilizationByDoctor.length)
    : 0;
  const canceledAppointments = appointments.filter(a => a.status === "canceled").length;

  // Приветствие в зависимости от времени
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Доброе утро" : hour < 18 ? "Добрый день" : "Добрый вечер";

  // Перевод роли на русский
  const roleText = user?.role === "admin" ? "Администратор" :
                   user?.role === "doctor" ? "Врач" :
                   user?.role === "registrar" ? "Регистратор" : user?.role;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-2xl p-6 border border-primary-200">
        <h1 className="text-3xl font-bold text-gray-900">
          {greeting}, {user?.name}! 👋
        </h1>
        <p className="text-gray-600 mt-2">
          Вы вошли как <span className="font-semibold text-primary-600">{roleText}</span>
        </p>
        <p className="text-sm text-gray-500 mt-1">
          {dayjs().format("dddd, DD MMMM YYYY")}
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Slots */}
        <div className="card bg-blue-50 border border-blue-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">📊 Всего слотов</p>
              <p className="text-3xl font-bold text-blue-900 mt-3">{totalSlots}</p>
              <p className="text-xs text-gray-500 mt-2">на {dayjs().add(7, "day").format("DD.MM.YYYY")}</p>
            </div>
            <div className="text-4xl">📅</div>
          </div>
        </div>

        {/* Booked Appointments */}
        <div className="card bg-green-50 border border-green-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">✅ Записей</p>
              <p className="text-3xl font-bold text-green-900 mt-3">{bookedAppointments}</p>
              <p className="text-xs text-gray-500 mt-2">активных записей</p>
            </div>
            <div className="text-4xl">📝</div>
          </div>
        </div>

        {/* Average Utilization */}
        <div className="card bg-purple-50 border border-purple-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">📈 Утилизация</p>
              <p className="text-3xl font-bold text-purple-900 mt-3">{avgUtilization}%</p>
              <p className="text-xs text-gray-500 mt-2">средняя за 7 дней</p>
            </div>
            <div className="text-4xl">📊</div>
          </div>
        </div>

        {/* Canceled Appointments */}
        <div className="card bg-red-50 border border-red-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">❌ Отмены</p>
              <p className="text-3xl font-bold text-red-900 mt-3">{canceledAppointments}</p>
              <p className="text-xs text-gray-500 mt-2">отменённых записей</p>
            </div>
            <div className="text-4xl">🚫</div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="card">
        <h3 className="card-header">📈 Утилизация по врачам (7 дней)</h3>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart 
              data={chartData}
              margin={{ top: 20, right: 30, left: 0, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="name" 
                type="category"
                angle={-45}
                textAnchor="end"
                height={100}
              />
              <YAxis />
              <Tooltip 
                contentStyle={{ backgroundColor: "#fff", border: "1px solid #ccc", borderRadius: "8px" }}
                cursor={{ fill: "rgba(0,0,0,0.1)" }}
                formatter={(value) => value}
              />
              <Legend />
              <Bar 
                dataKey="utilization" 
                fill="#3b82f6" 
                name="Утилизация %" 
                radius={[8, 8, 0, 0]}
              />
              <Bar 
                dataKey="booked" 
                fill="#10b981" 
                name="Записей"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-12 text-gray-600">
            <p>📭 Нет данных для отображения</p>
            <p className="text-sm mt-2">Создайте расписание, чтобы увидеть график утилизации</p>
          </div>
        )}
      </div>

      {/* Top Doctors */}
      <div className="card">
        <h3 className="card-header">🏆 Лучшие врачи по утилизации</h3>
        {utilizationByDoctor.length > 0 ? (
          <div className="space-y-3">
            {utilizationByDoctor
              .sort((a, b) => b.utilization - a.utilization)
              .slice(0, 5)
              .map((doc, idx) => (
                <div key={doc.doctorId} className="p-4 border border-gray-200 rounded-xl hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                        {idx + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{doc.doctorName}</p>
                        <p className="text-sm text-gray-600">{doc.specialty}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-2xl font-bold ${
                        doc.utilization >= 80 ? "text-green-600" :
                        doc.utilization >= 60 ? "text-yellow-600" :
                        "text-red-600"
                      }`}>
                        {doc.utilization}%
                      </p>
                      <p className="text-xs text-gray-600">
                        {doc.bookedSlots}/{doc.totalSlots} слотов
                      </p>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <p className="text-gray-600 text-center py-8">📭 Нет данных</p>
        )}
      </div>

      {/* System Info */}
      <div className="card bg-gray-50">
        <h3 className="font-bold text-gray-900 mb-3">ℹ️ Информация о системе</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-gray-600">👥 Врачей в системе</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{doctors.length}</p>
          </div>
          <div>
            <p className="text-gray-600">📅 Расписаний создано</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{workSlots.length}</p>
          </div>
          <div>
            <p className="text-gray-600">📝 Всего записей</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{appointments.length}</p>
          </div>
        </div>
      </div>
    </div>
  );
}