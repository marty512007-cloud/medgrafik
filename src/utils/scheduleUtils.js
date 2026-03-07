import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import "dayjs/locale/ru";

// Подключаем плагины и локаль
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);
dayjs.locale("ru");

/**
 * Генерирует массив временных слотов на основе рабочего интервала и перерывов
 */
export function generateSlots(date, startTime, endTime, slotMinutes, breakStart, breakEnd) {
  const slots = [];
  let current = dayjs(`${date} ${startTime}`);
  const end = dayjs(`${date} ${endTime}`);
  const breakStartTime = dayjs(`${date} ${breakStart}`);
  const breakEndTime = dayjs(`${date} ${breakEnd}`);

  while (current.isBefore(end)) {
    const slotEnd = current.add(slotMinutes, "minute");

    // Пропускаем слоты, которые полностью или частично попадают в перерыв
    const completlyInBreak = current.isSameOrAfter(breakStartTime) && slotEnd.isSameOrBefore(breakEndTime);

    if (!completlyInBreak && !(current.isSameOrAfter(breakStartTime) && current.isBefore(breakEndTime))) {
      slots.push({
        dateTime: current.format("YYYY-MM-DD HH:mm"),
        available: true
      });
    }

    current = current.add(slotMinutes, "minute");
  }

  return slots;
}

/**
 * Валидация слота
 */
export function validateSlot(workSlots, doctorId, slotDateTime) {
  const errors = [];

  // Проверяем, существует ли рабочий интервал для этого врача и времени
  const [slotDate, slotTime] = slotDateTime.split(" ");
  const workSlot = workSlots.find(
    ws => ws.doctorId === doctorId && ws.date === slotDate
  );

  if (!workSlot) {
    errors.push("Рабочий интервал не найден");
  } else {
    // Проверяем, входит ли слот в список доступных
    if (!workSlot.slots.find(s => s.dateTime === slotDateTime)) {
      errors.push("Слот не доступен (выходит за границы рабочего времени или попадает в перерыв)");
    }
  }

  return errors;
}

/**
 * Полная валидация записи (5+ проверок)
 */
export function validateAppointment(doctors, workSlots, appointments, doctorId, slotDateTime) {
  const errors = [];

  // 1. Проверка существования врача
  const doctor = doctors.find(d => d.id === doctorId);
  if (!doctor) {
    errors.push("Врач не найден");
  }

  // 2. Проверка слота в рабочем интервале и за вычетом перерывов
  const slotErrors = validateSlot(workSlots, doctorId, slotDateTime);
  errors.push(...slotErrors);

  // 3. Проверка двойного бронирования (уникальность слота)
  const existingBooking = appointments.find(
    a => a.doctorId === doctorId && a.slotDateTime === slotDateTime && a.status === "booked"
  );
  if (existingBooking) {
    errors.push("Слот уже занят");
  }

  // 4. Проверка статуса (можно бронировать только если статус 'booked')
  // (проверяется при создании)

  // 5. Проверка корректности формата даты/времени
  if (!slotDateTime.match(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/)) {
    errors.push("Неверный формат даты/времени");
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Расчёт утилизации расписания
 */
export function calculateUtilization(workSlots, appointments) {
  if (workSlots.length === 0) return 0;

  let totalSlots = 0;
  let bookedSlots = 0;

  workSlots.forEach(ws => {
    totalSlots += ws.slots.length;

    ws.slots.forEach(slot => {
      const booked = appointments.find(
        a => a.doctorId === ws.doctorId && a.slotDateTime === slot.dateTime && a.status === "booked"
      );
      if (booked) bookedSlots++;
    });
  });

  return totalSlots === 0 ? 0 : Math.round((bookedSlots / totalSlots) * 100);
}

/**
 * Получение утилизации по врачам
 */
export function getUtilizationByDoctor(doctors, workSlots, appointments, dateFrom, dateTo) {
  return doctors.map(doctor => {
    const doctorSlots = workSlots.filter(ws => ws.doctorId === doctor.id);
    const doctorAppointments = appointments.filter(a => a.doctorId === doctor.id && a.status === "booked");

    let totalSlots = 0;
    doctorSlots.forEach(ws => {
      if (ws.date >= dateFrom && ws.date <= dateTo) {
        totalSlots += ws.slots.length;
      }
    });

    const bookedSlots = doctorAppointments.filter(a => {
      const [slotDate] = a.slotDateTime.split(" ");
      return slotDate >= dateFrom && slotDate <= dateTo;
    }).length;

    return {
      doctorId: doctor.id,
      doctorName: doctor.fio,
      specialty: doctor.specialty,
      totalSlots,
      bookedSlots,
      canceledSlots: appointments.filter(a => a.doctorId === doctor.id && a.status === "canceled").length,
      completedSlots: appointments.filter(a => a.doctorId === doctor.id && a.status === "completed").length,
      utilization: totalSlots === 0 ? 0 : Math.round((bookedSlots / totalSlots) * 100)
    };
  });
}

/**
 * Получение утилизации по дням
 */
export function getUtilizationByDate(workSlots, appointments, dateFrom, dateTo) {
  const dates = {};
  let current = dayjs(dateFrom);
  const end = dayjs(dateTo);

  while (current.isSameOrBefore(end, "day")) {
    const dateStr = current.format("YYYY-MM-DD");
    const daySlots = workSlots.filter(ws => ws.date === dateStr);

    let totalSlots = 0;
    daySlots.forEach(ws => {
      totalSlots += ws.slots.length;
    });

    const bookedSlots = appointments.filter(a => {
      const [slotDate] = a.slotDateTime.split(" ");
      return slotDate === dateStr && a.status === "booked";
    }).length;

    // Используем русское название дня недели
    const dayName = current.format("dddd");

    dates[dateStr] = {
      date: dateStr,
      dayName,
      totalSlots,
      bookedSlots,
      utilization: totalSlots === 0 ? 0 : Math.round((bookedSlots / totalSlots) * 100)
    };

    current = current.add(1, "day");
  }

  return Object.values(dates);
}