import { useState } from "react";
import { useSchedule } from "../context/ScheduleContext";
import { useAuth } from "../context/AuthContext";
import dayjs from "dayjs";

export default function DoctorSchedule() {
  const { doctors, workSlots, appointments } = useSchedule();
  const { user } = useAuth();
  const [selectedDoctorId, setSelectedDoctorId] = useState(user?.role === "doctor" ? user?.doctorId : doctors[0]?.id);
  const [selectedDate, setSelectedDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [viewMode, setViewMode] = useState("day"); // day, week

  const selectedDoctor = doctors.find(d => d.id === selectedDoctorId);
  const doctorSlots = workSlots.filter(ws => ws.doctorId === selectedDoctorId && ws.date === selectedDate);
  const doctorAppointments = appointments.filter(a => a.doctorId === selectedDoctorId);

  const getAppointmentStatus = (dateTime, status) => {
    const appointment = doctorAppointments.find(a => a.slotDateTime === dateTime);
    if (!appointment) return "available";
    return appointment.status;
  };

  const slots = doctorSlots.flatMap(ws => ws.slots);

  // Генерируем дни недели для режима неделю
  const getWeekDays = () => {
    const days = [];
    const current = dayjs(selectedDate);
    const startOfWeek = current.startOf("week");

    for (let i = 0; i < 7; i++) {
      days.push(startOfWeek.add(i, "day"));
    }
    return days;
  };

  const weekDays = getWeekDays();

  // Получить все слоты на неделю
  const getWeekSlots = () => {
    const weekSlots = {};
    weekDays.forEach(day => {
      const dateStr = day.format("YYYY-MM-DD");
      const daySlots = workSlots.filter(
        ws => ws.doctorId === selectedDoctorId && ws.date === dateStr
      );
      weekSlots[dateStr] = daySlots.flatMap(ws => ws.slots);
    });
    return weekSlots;
  };

  const weekSlots = getWeekSlots();

  // Получить информацию о записи
  const getAppointmentInfo = (dateTime) => {
    return doctorAppointments.find(a => a.slotDateTime === dateTime);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Расписание врача</h1>
        <p className="text-gray-600 mt-1">Просмотр и управление слотами приёма</p>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Врач</label>
            <select
              value={selectedDoctorId}
              onChange={(e) => setSelectedDoctorId(e.target.value)}
              className="input-field"
            >
              {doctors.map(doc => (
                <option key={doc.id} value={doc.id}>
                  {doc.fio} - {doc.specialty}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Дата</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Вид</label>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode("day")}
                className={`flex-1 px-4 py-2 rounded-xl font-medium transition-colors ${
                  viewMode === "day"
                    ? "bg-primary-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                День
              </button>
              <button
                onClick={() => setViewMode("week")}
                className={`flex-1 px-4 py-2 rounded-xl font-medium transition-colors ${
                  viewMode === "week"
                    ? "bg-primary-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Неделя
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Doctor Info */}
      {selectedDoctor && (
        <div className="card bg-gradient-to-r from-primary-50 to-blue-50 border border-primary-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{selectedDoctor.fio}</h3>
              <p className="text-gray-600 mt-1">
                <span className="mr-4">🏥 {selectedDoctor.specialty}</span>
                <span className="mr-4">🚪 Кабинет {selectedDoctor.cabinet}</span>
                <span>📞 {selectedDoctor.phone}</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Доступных слотов</p>
              <p className="text-3xl font-bold text-primary-600">{slots.length}</p>
            </div>
          </div>
        </div>
      )}

      {/* Day View */}
      {viewMode === "day" && (
        <div className="card">
          <h3 className="card-header">Расписание на {dayjs(selectedDate).format("DD.MM.YYYY (dddd)")}</h3>
          
          {slots.length > 0 ? (
            <div>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
                {slots.map((slot, idx) => {
                  const appointment = getAppointmentInfo(slot.dateTime);
                  const isBooked = appointment && appointment.status === "booked";
                  const isCanceled = appointment && appointment.status === "canceled";
                  const isCompleted = appointment && appointment.status === "completed";

                  return (
                    <div
                      key={idx}
                      className={`p-4 rounded-xl text-center font-semibold cursor-pointer transition-all hover:shadow-lg ${
                        isBooked
                          ? "bg-red-100 text-red-800 border-2 border-red-300"
                          : isCompleted
                          ? "bg-green-100 text-green-800 border-2 border-green-300"
                          : isCanceled
                          ? "bg-gray-100 text-gray-500 border-2 border-gray-300 line-through"
                          : "bg-green-100 text-green-800 border-2 border-green-300 hover:scale-105"
                      }`}
                      title={appointment ? appointment.patientName : "Свободный слот"}
                    >
                      <p className="text-lg">{slot.dateTime.split(" ")[1]}</p>
                      <p className="text-xs mt-1">
                        {isBooked ? "Занято" : isCompleted ? "✓ Завершено" : isCanceled ? "Отменено" : "Свободно"}
                      </p>
                      {appointment && (
                        <p className="text-xs mt-1 truncate">{appointment.patientName.split(" ")[0]}</p>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Scheduled Appointments for This Day */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-bold text-gray-900 mb-3">Записанные пациенты</h4>
                <div className="space-y-2">
                  {slots.map((slot, idx) => {
                    const appointment = getAppointmentInfo(slot.dateTime);
                    if (!appointment || appointment.status !== "booked") return null;

                    return (
                      <div key={idx} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold text-gray-900">{slot.dateTime.split(" ")[1]}</p>
                            <p className="text-sm text-gray-700">{appointment.patientName}</p>
                            <p className="text-xs text-gray-600">Код: {appointment.patientCode}</p>
                          </div>
                          <span className="px-2 py-1 bg-red-200 text-red-800 text-xs rounded font-semibold">
                            Записан
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-600">
              <p className="text-lg">📅 Нет расписания на эту дату</p>
              <p className="text-sm mt-2">Обратитесь к администратору для создания расписания</p>
            </div>
          )}
        </div>
      )}

      {/* Week View */}
      {viewMode === "week" && (
        <div className="card overflow-x-auto">
          <h3 className="card-header mb-4">Расписание на неделю</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-7 gap-4 min-w-full">
            {weekDays.map((day, dayIdx) => {
              const dateStr = day.format("YYYY-MM-DD");
              const daySlots = weekSlots[dateStr] || [];

              return (
                <div key={dayIdx} className="border border-gray-200 rounded-xl p-4 bg-white">
                  {/* Day Header */}
                  <div className="text-center mb-4 pb-4 border-b border-gray-200">
                    <p className="font-bold text-gray-900">
                      {day.format("DD")}
                    </p>
                    <p className="text-sm text-gray-600">
                      {day.format("ddd")}
                    </p>
                  </div>

                  {/* Time Slots */}
                  {daySlots.length > 0 ? (
                    <div className="space-y-2">
                      {daySlots.map((slot, slotIdx) => {
                        const appointment = getAppointmentInfo(slot.dateTime);
                        const isBooked = appointment && appointment.status === "booked";
                        const isCompleted = appointment && appointment.status === "completed";

                        return (
                          <div
                            key={slotIdx}
                            className={`p-2 rounded text-center text-xs font-semibold cursor-pointer transition-all ${
                              isBooked
                                ? "bg-red-100 text-red-800"
                                : isCompleted
                                ? "bg-green-100 text-green-800"
                                : "bg-green-100 text-green-800 hover:shadow"
                            }`}
                            title={appointment ? appointment.patientName : "Свободно"}
                          >
                            <p>{slot.dateTime.split(" ")[1]}</p>
                            {appointment && (
                              <p className="text-xs truncate">{appointment.patientName.split(" ")[0]}</p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-center text-xs text-gray-500">Нет слотов</p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-6 pt-6 border-t border-gray-200 flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
              <span className="text-sm text-gray-700">Свободный слот</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
              <span className="text-sm text-gray-700">Занято</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-100 border-2 border-green-500 rounded"></div>
              <span className="text-sm text-gray-700">Завершено</span>
            </div>
          </div>
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card bg-blue-50 border border-blue-200">
          <p className="text-sm text-gray-600">📊 Всего слотов</p>
          <p className="text-3xl font-bold text-blue-900 mt-2">{slots.length}</p>
        </div>

        <div className="card bg-red-50 border border-red-200">
          <p className="text-sm text-gray-600">🔴 Занято</p>
          <p className="text-3xl font-bold text-red-900 mt-2">
            {slots.filter(slot => {
              const apt = getAppointmentInfo(slot.dateTime);
              return apt && apt.status === "booked";
            }).length}
          </p>
        </div>

        <div className="card bg-green-50 border border-green-200">
          <p className="text-sm text-gray-600">✅ Свободно</p>
          <p className="text-3xl font-bold text-green-900 mt-2">
            {slots.filter(slot => {
              const apt = getAppointmentInfo(slot.dateTime);
              return !apt || apt.status !== "booked";
            }).length}
          </p>
        </div>
      </div>
    </div>
  );
}