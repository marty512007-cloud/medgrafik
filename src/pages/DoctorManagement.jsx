import { useState } from "react";
import { useSchedule } from "../context/ScheduleContext";
import { useToast } from "../hooks/useToast";
import dayjs from "dayjs";
import "dayjs/locale/ru";

dayjs.locale("ru");

export default function DoctorManagement() {
  const { doctors, workSlots, generateSchedule, deleteSchedule } = useSchedule();
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
      success(`✅ Создано ${result.slotCount} слотов на ${dayjs(formData.date).format("DD.MM.YYYY")}`);
      
      setFormData({
        date: dayjs().format("YYYY-MM-DD"),
        startTime: "08:00",
        endTime: "16:00",
        slotMinutes: 30,
        breakStart: "12:00",
        breakEnd: "13:00"
      });
    } else {
      error(`❌ ${result.error}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">👨‍⚕️ Управление врачами</h1>
        <p className="text-gray-600 mt-1">Настройка расписания и интервалов приёма</p>
      </div>

      {/* Doctors List */}
      <div className="card">
        <h3 className="card-header">👥 Врачи клиники</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {doctors.map(doctor => {
            const doctorHasSchedule = workSlots.some(ws => ws.doctorId === doctor.id);
            
            return (
              <div
                key={doctor.id}
                onClick={() => setSelectedDoctorId(doctor.id)}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-md ${
                  selectedDoctorId === doctor.id
                    ? "border-primary-600 bg-primary-50 shadow-lg"
                    : "border-gray-200 hover:border-primary-300"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{doctor.fio}</p>
                    <p className="text-sm text-gray-600 mt-1">🏥 {doctor.specialty}</p>
                    <p className="text-sm text-gray-600">🚪 Кабинет {doctor.cabinet}</p>
                  </div>
                  {doctorHasSchedule && (
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full font-bold animate-pulse">
                      ✓ Есть расписание
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
        <div className="card bg-blue-50 border-2 border-blue-200 animate-in fade-in slide-in-from-top-2 duration-500">
          <h3 className="card-header text-blue-900">📅 Существующее расписание</h3>
          <div className="space-y-2">
            {doctorSchedules.map((schedule, idx) => (
              <div key={idx} 
                className="p-3 bg-white rounded-lg border border-blue-100 hover:shadow-md transition-shadow"
                style={{
                  animation: `slideInFromLeft 0.4s ease-out ${idx * 0.1}s both`
                }}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-gray-900">
                      {dayjs(schedule.date).format("DD.MM.YYYY (ddd)")}
                    </p>
                    <p className="text-sm text-gray-600">
                      ⏰ {schedule.startTime} - {schedule.endTime} ({schedule.slotMinutes} мин)
                    </p>
                    <p className="text-sm text-gray-600">
                      ☕ Перерыв: {schedule.breakStart} - {schedule.breakEnd}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      📊 Слотов: <span className="font-bold">{schedule.slots.length}</span>
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      const result = deleteSchedule(schedule.id);
                      if (result.success) {
                        success(`🗑️ Расписание на ${dayjs(schedule.date).format("DD.MM.YYYY")} удалено`);
                      } else {
                        error(`❌ ${result.error}`);
                      }
                    }}
                    className="ml-4 px-3 py-1 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg text-sm font-medium transition-colors"
                    title="Удалить расписание"
                  >
                    🗑️ Удалить
                  </button>
                </div>
              </div>
            ))}
          </div>

          <style>{`
            @keyframes slideInFromLeft {
              from {
                opacity: 0;
                transform: translateX(-20px);
              }
              to {
                opacity: 1;
                transform: translateX(0);
              }
            }
          `}</style>
        </div>
      )}

      {/* Generate Schedule Form */}
      <div className="card">
        <h3 className="card-header">➕ Создать расписание</h3>

        {hasScheduleOnDate && (
          <div className="p-4 mb-6 bg-yellow-50 border-2 border-yellow-200 rounded-xl text-yellow-800 animate-pulse">
            ⚠️ <span className="font-semibold">Внимание!</span> На дату <strong>{dayjs(formData.date).format("DD.MM.YYYY")}</strong> уже существует расписание для этого врача!
            <br />
            <span className="text-sm">Выберите другую дату или удалите существующее расписание.</span>
          </div>
        )}

        <form onSubmit={handleGenerateSchedule} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">📅 Дата</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="input-field transition-all"
                required
              />
              {hasScheduleOnDate && (
                <p className="text-xs text-red-600 mt-1 font-semibold animate-pulse">⚠️ На эту дату уже есть расписание!</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">⏱️ Длительность слота (минут)</label>
              <select
                value={formData.slotMinutes}
                onChange={(e) => setFormData({ ...formData, slotMinutes: e.target.value })}
                className="input-field transition-all"
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
              <label className="block text-sm font-medium text-gray-700 mb-2">🏢 Начало работы</label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="input-field transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">🚪 Конец работы</label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="input-field transition-all"
                required
              />
            </div>

            <div></div>
          </div>

          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 transition-all">
            <p className="text-sm font-semibold text-yellow-900 mb-3">☕ Обеденный перерыв</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Начало</label>
                <input
                  type="time"
                  value={formData.breakStart}
                  onChange={(e) => setFormData({ ...formData, breakStart: e.target.value })}
                  className="input-field transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Конец</label>
                <input
                  type="time"
                  value={formData.breakEnd}
                  onChange={(e) => setFormData({ ...formData, breakEnd: e.target.value })}
                  className="input-field transition-all"
                  required
                />
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            className={`w-full py-3 font-semibold transition-all rounded-xl text-white ${
              hasScheduleOnDate || isLoading
                ? "bg-gray-400 cursor-not-allowed opacity-50"
                : "btn-primary hover:shadow-lg hover:scale-105"
            }`}
            disabled={hasScheduleOnDate || isLoading}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin">⏳</span>
                Создаём расписание...
              </span>
            ) : hasScheduleOnDate ? (
              "❌ Нельзя создать (уже есть расписание)"
            ) : (
              "✅ Создать расписание"
            )}
          </button>
        </form>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card bg-blue-50 border-2 border-blue-200 hover:shadow-lg transition-all">
          <p className="text-sm text-gray-600 font-medium">👥 Всего врачей</p>
          <p className="text-4xl font-bold text-blue-900 mt-2">{doctors.length}</p>
        </div>

        <div className="card bg-green-50 border-2 border-green-200 hover:shadow-lg transition-all">
          <p className="text-sm text-gray-600 font-medium">📅 Расписаний создано</p>
          <p className="text-4xl font-bold text-green-900 mt-2">{workSlots.length}</p>
        </div>
      </div>

      <style>{`
        @keyframes slideInFromTop {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .animate-in {
          animation: slideInFromTop 0.5s ease-out;
        }

        .fade-in {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}