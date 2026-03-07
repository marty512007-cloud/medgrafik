import { useState } from "react";
import { useSchedule } from "../context/ScheduleContext";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../hooks/useToast";
import dayjs from "dayjs";
import "dayjs/locale/ru";

dayjs.locale("ru");

export default function AppointmentBooking() {
  const { doctors, workSlots, appointments, bookAppointment, cancelAppointment, rescheduleAppointment } = useSchedule();
  const { user } = useAuth();
  const { success, error, warning } = useToast();

  const [step, setStep] = useState("select-doctor");
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [patientCode, setPatientCode] = useState("");
  const [patientName, setPatientName] = useState("");
  const [selectedDate, setSelectedDate] = useState(dayjs().add(1, "day").format("YYYY-MM-DD"));
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [rescheduleAppointmentId, setRescheduleAppointmentId] = useState(null);
  const [newScheduleDate, setNewScheduleDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [newScheduleTime, setNewScheduleTime] = useState("");

  // Проверка прав доступа
  const isRegistrar = user?.role === "registrar";

  if (!isRegistrar) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">📋 Управление записями</h1>
          <p className="text-gray-600 mt-1">Запись, отмена и перенос приёмов</p>
        </div>

        <div className="card bg-red-50 border-2 border-red-200 p-8 text-center">
          <p className="text-2xl mb-2">🔐 Доступ запрещён</p>
          <p className="text-red-800 font-semibold">
            Только регистратор может управлять записями пациентов
          </p>
          <p className="text-gray-600 mt-4 text-sm">
            Ваша роль: <span className="font-bold capitalize">{user?.role}</span>
          </p>
        </div>
      </div>
    );
  }

  const doctorSlots = workSlots.filter(
    ws => ws.doctorId === selectedDoctor && ws.date === selectedDate
  );

  const availableSlots = doctorSlots.flatMap(ws => ws.slots).filter(slot => {
    return !appointments.find(a => a.slotDateTime === slot.dateTime && a.status === "booked");
  });

  const userAppointments = appointments.filter(a => a.status === "booked");

  const handleBooking = () => {
    if (!patientCode || !patientName || !selectedSlot) {
      warning("Заполните все поля");
      return;
    }

    const result = bookAppointment(
      selectedDoctor,
      selectedSlot,
      patientCode,
      patientName,
      user?.id
    );

    if (result.success) {
      success(`✅ Запись успешно создана!`);
      setTimeout(() => {
        setStep("select-doctor");
        setSelectedDoctor(null);
        setSelectedSlot(null);
        setPatientCode("");
        setPatientName("");
      }, 1500);
    } else {
      error(`❌ ${result.error}`);
    }
  };

  const handleCancelAppointment = () => {
    if (!cancelReason) {
      warning("Укажите причину отмены");
      return;
    }

    const result = cancelAppointment(selectedAppointmentId, cancelReason, user?.id);
    if (result.success) {
      success("✅ Запись отменена");
      setShowCancelModal(false);
      setSelectedAppointmentId(null);
      setCancelReason("");
    } else {
      error(`❌ ${result.error}`);
    }
  };

  const handleRescheduleAppointment = () => {
    if (!newScheduleTime) {
      warning("Выберите время");
      return;
    }

    const newSlotDateTime = `${newScheduleDate} ${newScheduleTime}`;
    const result = rescheduleAppointment(rescheduleAppointmentId, newSlotDateTime, user?.id);

    if (result.success) {
      success("✅ Запись перенесена");
      setShowRescheduleModal(false);
      setRescheduleAppointmentId(null);
      setNewScheduleTime("");
    } else {
      error(`❌ ${result.error}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">📋 Управление записями</h1>
        <p className="text-gray-600 mt-1">Запись, отмена и перенос приёмов пациентов</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setStep("select-doctor")}
          className={`px-4 py-3 font-medium border-b-2 transition-colors ${
            step === "select-doctor"
              ? "border-primary-600 text-primary-600"
              : "border-transparent text-gray-600"
          }`}
        >
          ➕ Новая запись
        </button>
        <button
          onClick={() => setStep("my-appointments")}
          className={`px-4 py-3 font-medium border-b-2 transition-colors ${
            step === "my-appointments"
              ? "border-primary-600 text-primary-600"
              : "border-transparent text-gray-600"
          }`}
        >
          📋 Все записи ({userAppointments.length})
        </button>
      </div>

      {/* Step 1: Select Doctor */}
      {step === "select-doctor" && (
        <div className="card">
          <h3 className="card-header">Выберите врача</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {doctors.map(doctor => (
              <button
                key={doctor.id}
                onClick={() => {
                  setSelectedDoctor(doctor.id);
                  setStep("select-date");
                }}
                className="p-4 border-2 border-gray-200 rounded-xl hover:border-primary-600 hover:bg-primary-50 transition-all text-left"
              >
                <p className="font-semibold text-gray-900">{doctor.fio}</p>
                <p className="text-sm text-gray-600 mt-1">🏥 {doctor.specialty}</p>
                <p className="text-sm text-gray-600">🚪 Кабинет {doctor.cabinet}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Select Date and Slot */}
      {step === "select-date" && selectedDoctor && (
        <div className="space-y-4">
          <div className="card">
            <h3 className="card-header">Выберите дату и время</h3>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Дата приёма</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="input-field"
              />
            </div>

            {availableSlots.length > 0 ? (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-3">Доступное время</p>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                  {availableSlots.map((slot, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedSlot(slot.dateTime)}
                      className={`p-3 rounded-xl font-semibold transition-all ${
                        selectedSlot === slot.dateTime
                          ? "bg-primary-600 text-white shadow-lg scale-105"
                          : "bg-green-100 text-green-800 hover:shadow-md"
                      }`}
                    >
                      {slot.dateTime.split(" ")[1]}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-gray-600 text-center py-6">Нет доступных слотов на эту дату</p>
            )}
          </div>

          {selectedSlot && (
            <div className="card">
              <h3 className="card-header">Данные пациента</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Код пациента</label>
                  <input
                    type="text"
                    value={patientCode}
                    onChange={(e) => setPatientCode(e.target.value.toUpperCase())}
                    placeholder="PAT-001"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ФИО пациента</label>
                  <input
                    type="text"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder="Иван Иванович Иванов"
                    className="input-field"
                  />
                </div>

                <div className="bg-primary-50 border border-primary-200 rounded-xl p-4">
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Врач:</span> {doctors.find(d => d.id === selectedDoctor)?.fio}
                  </p>
                  <p className="text-sm text-gray-700 mt-2">
                    <span className="font-semibold">Дата и время:</span> {dayjs(selectedSlot).format("DD.MM.YYYY HH:mm")}
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setStep("select-doctor");
                      setSelectedDoctor(null);
                      setSelectedSlot(null);
                    }}
                    className="flex-1 btn-secondary"
                  >
                    Отменить
                  </button>
                  <button
                    onClick={handleBooking}
                    className="flex-1 btn-primary"
                  >
                    Записать пациента
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* All Appointments */}
      {step === "my-appointments" && (
        <div className="card">
          <h3 className="card-header">Все записи пациентов</h3>
          {userAppointments.length > 0 ? (
            <div className="space-y-3">
              {userAppointments.map(apt => {
                const doctor = doctors.find(d => d.id === apt.doctorId);
                return (
                  <div key={apt.id} className="p-4 border border-gray-200 rounded-xl hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{doctor?.fio}</p>
                        <p className="text-sm text-gray-600 mt-1">{doctor?.specialty}</p>
                        <p className="text-sm text-gray-600 mt-1">
                          📅 {dayjs(apt.slotDateTime).format("DD.MM.YYYY в HH:mm")}
                        </p>
                        <p className="text-sm text-gray-600">👤 {apt.patientName}</p>
                        <p className="text-sm text-gray-600">Код: {apt.patientCode}</p>
                      </div>
                      <div className="flex gap-2 flex-col">
                        <button
                          onClick={() => {
                            setRescheduleAppointmentId(apt.id);
                            setShowRescheduleModal(true);
                          }}
                          className="btn-secondary text-sm whitespace-nowrap"
                        >
                          Перенести
                        </button>
                        <button
                          onClick={() => {
                            setSelectedAppointmentId(apt.id);
                            setShowCancelModal(true);
                          }}
                          className="btn-danger text-sm"
                        >
                          Отменить
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-600 text-center py-8">Нет активных записей</p>
          )}
        </div>
      )}

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Отмена записи</h3>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Причина отмены</label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="input-field"
              >
                <option value="">Выберите причину</option>
                <option value="patient_request">По просьбе пациента</option>
                <option value="doctor_unavailable">Врач недоступен</option>
                <option value="schedule_conflict">Конфликт расписания</option>
                <option value="other">Другое</option>
              </select>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setSelectedAppointmentId(null);
                  setCancelReason("");
                }}
                className="flex-1 btn-secondary"
              >
                Закрыть
              </button>
              <button
                onClick={handleCancelAppointment}
                className="flex-1 btn-danger"
              >
                Отменить запись
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {showRescheduleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Перенести запись</h3>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Новая дата</label>
                <input
                  type="date"
                  value={newScheduleDate}
                  onChange={(e) => setNewScheduleDate(e.target.value)}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Новое время</label>
                <input
                  type="time"
                  value={newScheduleTime}
                  onChange={(e) => setNewScheduleTime(e.target.value)}
                  className="input-field"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRescheduleModal(false);
                  setRescheduleAppointmentId(null);
                  setNewScheduleTime("");
                }}
                className="flex-1 btn-secondary"
              >
                Закрыть
              </button>
              <button
                onClick={handleRescheduleAppointment}
                className="flex-1 btn-primary"
              >
                Перенести
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}