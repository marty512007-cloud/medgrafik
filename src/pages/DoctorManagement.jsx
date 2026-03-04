import { useState } from "react";
import { useSchedule } from "../context/ScheduleContext";
import dayjs from "dayjs";

export default function DoctorManagement() {
  const { doctors, generateSchedule } = useSchedule();
  const [selectedDoctorId, setSelectedDoctorId] = useState(doctors[0]?.id);
  const [formData, setFormData] = useState({
    date: dayjs().format("YYYY-MM-DD"),
    startTime: "08:00",
    endTime: "16:00",
    slotMinutes: 30,
    breakStart: "12:00",
    breakEnd: "13:00"
  });
  const [successMessage, setSuccessMessage] = useState("");

  const handleGenerateSchedule = (e) => {
    e.preventDefault();

    const result = generateSchedule(
      selectedDoctorId,
      formData.date,
      formData.startTime,
      formData.endTime,
      parseInt(formData.slotMinutes),
      formData.breakStart,
      formData.breakEnd
    );

    if (result.success) {
      setSuccessMessage(`✓ Создано ${result.slotCount} слотов`);
      setTimeout(() => setSuccessMessage(""), 3000);
      setFormData({
        date: dayjs().format("YYYY-MM-DD"),
        startTime: "08:00",
        endTime: "16:00",
        slotMinutes: 30,
        breakStart: "12:00",
        breakEnd: "13:00"
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Управление врачами</h1>
        <p className="text-gray-600 mt-1">Настройка расписания и интервалов приёма</p>
      </div>

      {successMessage && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-green-800 font-medium">
          {successMessage}
        </div>
      )}

      {/* Doctors List */}
      <div className="card">
        <h3 className="card-header">Врачи клиники</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {doctors.map(doctor => (
            <div
              key={doctor.id}
              onClick={() => setSelectedDoctorId(doctor.id)}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                selectedDoctorId === doctor.id
                  ? "border-primary-600 bg-primary-50"
                  : "border-gray-200 hover:border-primary-300"
              }`}
            >
              <p className="font-semibold text-gray-900">{doctor.fio}</p>
              <p className="text-sm text-gray-600 mt-1">🏥 {doctor.specialty}</p>
              <p className="text-sm text-gray-600">🚪 Кабинет {doctor.cabinet}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Generate Schedule Form */}
      <div className="card">
        <h3 className="card-header">Создать расписание</h3>
        <form onSubmit={handleGenerateSchedule} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Дата</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Длительность слота (минут)</label>
              <select
                value={formData.slotMinutes}
                onChange={(e) => setFormData({ ...formData, slotMinutes: e.target.value })}
                className="input-field"
              >
                <option value="15">15 минут</option>
                <option value="20">20 минут</option>
                <option value="30">30 минут</option>
                <option value="60">60 минут</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Начало работы</label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Конец работы</label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="input-field"
                required
              />
            </div>

            <div></div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <p className="text-sm font-semibold text-yellow-900 mb-3">Обеденный перерыв</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Начало</label>
                <input
                  type="time"
                  value={formData.breakStart}
                  onChange={(e) => setFormData({ ...formData, breakStart: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Конец</label>
                <input
                  type="time"
                  value={formData.breakEnd}
                  onChange={(e) => setFormData({ ...formData, breakEnd: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
            </div>
          </div>

          <button type="submit" className="w-full btn-primary py-3 font-semibold">
            Создать расписание
          </button>
        </form>
      </div>
    </div>
  );
}