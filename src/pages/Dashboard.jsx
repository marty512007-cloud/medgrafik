import { useSchedule } from "../context/ScheduleContext";
import { useAuth } from "../context/AuthContext";
import { calculateUtilization, getUtilizationByDoctor } from "../utils/scheduleUtils";
import dayjs from "dayjs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

export default function Dashboard() {
  const { doctors, workSlots, appointments } = useSchedule();
  const { user } = useAuth();

  const totalUtilization = calculateUtilization(workSlots, appointments);
  const totalSlots = workSlots.reduce((sum, ws) => sum + ws.slots.length, 0);
  const totalBooked = appointments.filter(a => a.status === "booked").length;
  const totalCanceled = appointments.filter(a => a.status === "canceled").length;
  const totalCompleted = appointments.filter(a => a.status === "completed").length;

  // Данные для графика по дням
  const dateFrom = dayjs().subtract(7, "day").format("YYYY-MM-DD");
  const dateTo = dayjs().format("YYYY-MM-DD");
  const utilizationByDoctor = getUtilizationByDoctor(doctors, workSlots, appointments, dateFrom, dateTo);

  const chartData = utilizationByDoctor.slice(0, 5).map(doc => ({
    name: doc.doctorName.split(" ")[1],
    utilization: doc.utilization,
    booked: doc.bookedSlots,
    total: doc.totalSlots
  }));

  const statCards = [
    { label: "Общая утилизация", value: `${totalUtilization}%`, color: "bg-blue-50", icon: "📊" },
    { label: "Слотов всего", value: totalSlots, color: "bg-green-50", icon: "📅" },
    { label: "Записей (активных)", value: totalBooked, color: "bg-purple-50", icon: "✅" },
    { label: "Завершено приёмов", value: totalCompleted, color: "bg-emerald-50", icon: "✔️" }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Дашборд</h1>
        <p className="text-gray-600 mt-1">Добро пожаловать, {user?.name}!</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, idx) => (
          <div key={idx} className={`${card.color} card`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">{card.label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{card.value}</p>
              </div>
              <span className="text-2xl">{card.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Utilization by Doctor */}
        <div className="card">
          <h3 className="card-header">Утилизация по врачам (7 дней)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="utilization" fill="#3b82f6" name="Утилизация %" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Appointments by Status */}
        <div className="card">
          <h3 className="card-header">Записи по статусам</h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-700">Активные</span>
                <span className="font-semibold">{totalBooked}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: `${(totalBooked / (totalBooked + totalCanceled + totalCompleted)) * 100}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-700">Завершено</span>
                <span className="font-semibold">{totalCompleted}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${(totalCompleted / (totalBooked + totalCanceled + totalCompleted)) * 100}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-700">Отменено</span>
                <span className="font-semibold">{totalCanceled}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-red-500 h-2 rounded-full" style={{ width: `${(totalCanceled / (totalBooked + totalCanceled + totalCompleted)) * 100}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h3 className="card-header">Топ врачей по утилизации</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-gray-700 font-semibold">ФИО</th>
                <th className="text-left py-3 px-4 text-gray-700 font-semibold">Специальность</th>
                <th className="text-center py-3 px-4 text-gray-700 font-semibold">Слотов</th>
                <th className="text-center py-3 px-4 text-gray-700 font-semibold">Записей</th>
                <th className="text-center py-3 px-4 text-gray-700 font-semibold">Утилизация</th>
              </tr>
            </thead>
            <tbody>
              {utilizationByDoctor.slice(0, 5).map(doc => (
                <tr key={doc.doctorId} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-gray-900">{doc.doctorName}</td>
                  <td className="py-3 px-4 text-gray-600">{doc.specialty}</td>
                  <td className="py-3 px-4 text-center text-gray-900 font-semibold">{doc.totalSlots}</td>
                  <td className="py-3 px-4 text-center text-gray-900 font-semibold">{doc.bookedSlots}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                      doc.utilization >= 80 ? "bg-green-100 text-green-800" :
                      doc.utilization >= 60 ? "bg-yellow-100 text-yellow-800" :
                      "bg-red-100 text-red-800"
                    }`}>
                      {doc.utilization}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}