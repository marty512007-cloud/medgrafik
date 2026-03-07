import { useState } from "react";
import { useSchedule } from "../context/ScheduleContext";
import { useToast } from "../hooks/useToast";
import dayjs from "dayjs";
import "dayjs/locale/ru";

dayjs.locale("ru");

export default function DoctorManagement() {
  const { doctors, workSlots, generateSchedule } = useSchedule();
  const { success, error, warning } = useToast();
  const [selectedDoctorId, setSelectedDoctorId] = useState(doctors[0]?.id);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    date: dayjs().format("YYYY-MM-DD"),
    startTime: "08:00",
    endTime: "16:00",
    slotMinutes: 30,
    breakStart: "12:00",
    breakEnd: "13:00"
  });

  // Получаем расписание выбранного врача
  const doctorSchedules = workSlots.filter(ws => ws.doctorId === selectedDoctorId);
  const selectedDoctor = doctors.find(d => d.id === selectedDoctorId);
  
  // Проверяем, есть ли уже расписание на эту дату
  const hasScheduleOnDate = doctorSchedules.some(ws => ws.date === formData.date);

  const handleGenerateSchedule = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Имитируем задержку для красивой анимации
    await new Promise(resolve => setTimeout(resolve, 800));

    const result = generateSchedule(
      selectedDoctorId,
      formData.date,
      formData.startTime,
      formData.endTime,
      parseInt(formData.slotMinutes),
      formData.breakStart,
      formData.breakEnd
    );

    setIsLoading(false);

    if (result.success) {
      success(`Создано ${result.slotCount} слотов на ${dayjs(formData.date).format("DD.MM.YYYY")}`);
      
      setFormData({
        date: dayjs().format("YYYY-MM-DD"),
        startTime: "08:00",
        endTime: "16:00",
        slotMinutes: 30,
        breakStart: "12:00",
        breakEnd: "13:00"
      });
    } else {
      error(`${result.error}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Управление врачами</h1>
        <p className="text-gray-600 mt-1">Настройка расписания и интервалов приёма</p>
      </div>

      {/* Doctors List */}
      <div className="card">
        <h3 className="card-header">Врачи клиники</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {doctors.map(doctor => {
            const doctorHasSchedule = workSlots.some(ws => ws.doctorId === doctor.id);
            
            return (
              <div
                key={doctor.id}
                onClick={() => setSelectedDoctorId(doctor.id)}
                className={`p-4 border cursor-pointer transition-colors ${
                  selectedDoctorId === doctor.id
                    ? "border-gray-800 bg-gray-50"
                    : "border-gray-200 hover:border-gray-400"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{doctor.fio}</p>
                    <p className="text-sm text-gray-600 mt-1">{doctor.specialty}</p>
                    <p className="text-sm text-gray-500">Кабинет {doctor.cabinet}</p>
                  </div>
                  {doctorHasSchedule && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium border border-gray-300">
                      Есть расписание
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Doctor Schedule Info */}
      {selectedDoctor && doctorSchedules.length > 0 && (
        <div className="card bg-gray-50 border border-gray-200">
          <h3 className="card-header">Существующее расписание</h3>
          <div className="space-y-2">
            {doctorSchedules.map((schedule, idx) => (
              <div 
                key={idx} 
                className="p-3 bg-white border border-gray-200"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-900">
                      {dayjs(schedule.date).format("DD.MM.YYYY (ddd)")}
                    </p>
                    <p className="text-sm text-gray-600">
                      {schedule.startTime} — {schedule.endTime} ({schedule.slotMinutes} мин)
                    </p>
                    <p className="text-sm text-gray-600">
                      Перерыв: {schedule.breakStart} — {schedule.breakEnd}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Слотов: <span className="font-semibold text-gray-700">{schedule.slots.length}</span>
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Generate Schedule Form */}
      <div className="card">
        <h3 className="card-header">Создать расписание</h3>

        {hasScheduleOnDate && (
          <div className="p-4 mb-6 bg-gray-100 border border-gray-400 text-gray-800 text-sm">
            <span className="font-semibold">Внимание!</span> На дату <strong>{dayjs(formData.date).format("DD.MM.YYYY")}</strong> уже существует расписание для этого врача.{" "}
            <span>Выберите другую дату или удалите существующее расписание.</span>
          </div>
        )}

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
              {hasScheduleOnDate && (
                <p className="text-xs text-gray-600 mt-1 font-medium">На эту дату уже есть расписание</p>
              )}
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

          <div className="bg-gray-50 border border-gray-200 p-4">
            <p className="text-sm font-medium text-gray-700 mb-3">Обеденный перерыв</p>
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

          <button 
            type="submit" 
            className={`w-full py-3 font-medium transition-colors text-white ${
              hasScheduleOnDate || isLoading
                ? "bg-gray-400 cursor-not-allowed opacity-50"
                : "bg-gray-800 hover:bg-gray-900"
            }`}
            disabled={hasScheduleOnDate || isLoading}
          >
            {isLoading ? "Создаём расписание..." : hasScheduleOnDate ? "Нельзя создать — уже есть расписание" : "Создать расписание"}
          </button>
        </form>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card">
          <p className="text-sm text-gray-600 font-medium">Всего врачей</p>
          <p className="text-4xl font-bold text-gray-900 mt-2">{doctors.length}</p>
        </div>

        <div className="card">
          <p className="text-sm text-gray-600 font-medium">Расписаний создано</p>
          <p className="text-4xl font-bold text-gray-900 mt-2">{workSlots.length}</p>
        </div>
      </div>
    </div>
  );
}