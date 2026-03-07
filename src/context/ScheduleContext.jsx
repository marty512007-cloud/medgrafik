import { createContext, useContext, useReducer, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { generateSlots, validateSlot, validateAppointment } from "../utils/scheduleUtils";
import { DOCTORS, WORK_SLOTS, APPOINTMENTS } from "../data/mockData";

const ScheduleContext = createContext();

const initialState = {
  doctors: DOCTORS,
  workSlots: WORK_SLOTS,
  appointments: APPOINTMENTS,
  operationLog: [],
  error: null
};

const scheduleReducer = (state, action) => {
  switch (action.type) {
    case "ADD_DOCTOR":
      return {
        ...state,
        doctors: [...state.doctors, action.payload]
      };

    case "UPDATE_WORK_SLOTS":
      return {
        ...state,
        workSlots: [...state.workSlots, ...action.payload]
      };

    case "BOOK_APPOINTMENT":
      return {
        ...state,
        appointments: [...state.appointments, action.payload.appointment],
        operationLog: [...state.operationLog, action.payload.log]
      };

    case "CANCEL_APPOINTMENT":
      return {
        ...state,
        appointments: state.appointments.map(apt =>
          apt.id === action.payload.appointmentId
            ? { ...apt, status: "canceled", canceledReason: action.payload.reason }
            : apt
        ),
        operationLog: [...state.operationLog, action.payload.log]
      };

    case "RESCHEDULE_APPOINTMENT":
      return {
        ...state,
        appointments: state.appointments.map(apt =>
          apt.id === action.payload.oldAppointmentId
            ? { ...apt, status: "canceled", canceledReason: "Перенесено" }
            : apt.id === action.payload.newAppointmentId
            ? { ...apt, status: "booked" }
            : apt
        ).concat(action.payload.newAppointment),
        operationLog: [...state.operationLog, action.payload.log]
      };

    case "COMPLETE_APPOINTMENT":
      return {
        ...state,
        appointments: state.appointments.map(apt =>
          apt.id === action.payload.appointmentId
            ? { ...apt, status: "completed" }
            : apt
        ),
        operationLog: [...state.operationLog, action.payload.log]
      };

    case "DELETE_SCHEDULE":
      return {
        ...state,
        workSlots: state.workSlots.filter(ws => ws.id !== action.payload)
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

export function ScheduleProvider({ children }) {
  const [state, dispatch] = useReducer(scheduleReducer, initialState);

  const bookAppointment = useCallback((doctorId, slotDateTime, patientCode, patientName, userId) => {
    // Валидации
    const validations = validateAppointment(
      state.doctors,
      state.workSlots,
      state.appointments,
      doctorId,
      slotDateTime
    );

    if (!validations.isValid) {
      dispatch({ type: "SET_ERROR", payload: validations.errors[0] });
      return { success: false, error: validations.errors[0] };
    }

    const appointment = {
      id: uuidv4(),
      doctorId,
      slotDateTime,
      status: "booked",
      patientCode,
      patientName,
      bookedAt: new Date().toISOString(),
      bookedBy: userId
    };

    const log = {
      id: uuidv4(),
      action: "APPOINTMENT_BOOKED",
      appointmentId: appointment.id,
      userId,
      timestamp: new Date().toISOString(),
      details: { doctorId, slotDateTime, patientCode }
    };

    dispatch({
      type: "BOOK_APPOINTMENT",
      payload: { appointment, log }
    });

    return { success: true, appointmentId: appointment.id };
  }, [state.doctors, state.workSlots, state.appointments]);

  const cancelAppointment = useCallback((appointmentId, reason, userId) => {
    const appointment = state.appointments.find(a => a.id === appointmentId);

    if (!appointment) {
      dispatch({ type: "SET_ERROR", payload: "Запись не найдена" });
      return { success: false, error: "Запись не найдена" };
    }

    if (appointment.status !== "booked") {
      dispatch({ type: "SET_ERROR", payload: "Можно отменить только активные записи" });
      return { success: false, error: "Можно отменить только активные записи" };
    }

    const log = {
      id: uuidv4(),
      action: "APPOINTMENT_CANCELED",
      appointmentId,
      userId,
      timestamp: new Date().toISOString(),
      reason
    };

    dispatch({
      type: "CANCEL_APPOINTMENT",
      payload: { appointmentId, reason, log }
    });

    return { success: true };
  }, [state.appointments]);

  const rescheduleAppointment = useCallback((appointmentId, newSlotDateTime, userId) => {
    const oldAppointment = state.appointments.find(a => a.id === appointmentId);

    if (!oldAppointment) {
      dispatch({ type: "SET_ERROR", payload: "Запись не найдена" });
      return { success: false, error: "Запись не найдена" };
    }

    // Валидируем новый слот
    const validations = validateAppointment(
      state.doctors,
      state.workSlots,
      state.appointments.filter(a => a.id !== appointmentId),
      oldAppointment.doctorId,
      newSlotDateTime
    );

    if (!validations.isValid) {
      dispatch({ type: "SET_ERROR", payload: validations.errors[0] });
      return { success: false, error: validations.errors[0] };
    }

    const newAppointment = {
      ...oldAppointment,
      id: uuidv4(),
      slotDateTime: newSlotDateTime,
      status: "booked",
      rescheduleFrom: appointmentId
    };

    const log = {
      id: uuidv4(),
      action: "APPOINTMENT_RESCHEDULED",
      oldAppointmentId: appointmentId,
      newAppointmentId: newAppointment.id,
      userId,
      timestamp: new Date().toISOString(),
      details: { oldDateTime: oldAppointment.slotDateTime, newDateTime: newSlotDateTime }
    };

    dispatch({
      type: "RESCHEDULE_APPOINTMENT",
      payload: { oldAppointmentId: appointmentId, newAppointmentId: newAppointment.id, newAppointment, log }
    });

    return { success: true, appointmentId: newAppointment.id };
  }, [state.doctors, state.workSlots, state.appointments]);

  const completeAppointment = useCallback((appointmentId, userId) => {
    const appointment = state.appointments.find(a => a.id === appointmentId);

    if (!appointment) {
      dispatch({ type: "SET_ERROR", payload: "Запись не найдена" });
      return { success: false };
    }

    const log = {
      id: uuidv4(),
      action: "APPOINTMENT_COMPLETED",
      appointmentId,
      userId,
      timestamp: new Date().toISOString()
    };

    dispatch({
      type: "COMPLETE_APPOINTMENT",
      payload: { appointmentId, log }
    });

    return { success: true };
  }, [state.appointments]);

  const generateSchedule = useCallback((doctorId, date, startTime, endTime, slotMinutes, breakStart, breakEnd) => {
    // Проверяем, существует ли уже расписание для этого врача на эту дату
    const existingSchedule = state.workSlots.find(
      ws => ws.doctorId === doctorId && ws.date === date
    );

    if (existingSchedule) {
      dispatch({ 
        type: "SET_ERROR", 
        payload: `Расписание для этого врача на ${date} уже существует! Удалите его перед созданием нового.` 
      });
      return { 
        success: false, 
        error: `Расписание для этого врача на ${date} уже существует!`,
        slotCount: 0
      };
    }

    const slots = generateSlots(date, startTime, endTime, slotMinutes, breakStart, breakEnd);

    if (slots.length === 0) {
      dispatch({ 
        type: "SET_ERROR", 
        payload: "Не удалось создать слоты. Проверьте время работы и перерыв." 
      });
      return { 
        success: false, 
        error: "Не удалось создать слоты",
        slotCount: 0
      };
    }

    const workSlot = {
      id: uuidv4(),
      doctorId,
      date,
      startTime,
      endTime,
      slotMinutes,
      breakStart,
      breakEnd,
      createdAt: new Date().toISOString(),
      slots
    };

    dispatch({
      type: "UPDATE_WORK_SLOTS",
      payload: [workSlot]
    });

    return { success: true, slotCount: slots.length };
  }, [state.workSlots]);

  const deleteSchedule = useCallback((scheduleId) => {
    const schedule = state.workSlots.find(ws => ws.id === scheduleId);
    if (!schedule) {
      return { success: false, error: "Расписание не найдено" };
    }

    // Проверяем, есть ли активные записи к этому расписанию
    const activeAppointments = state.appointments.filter(
      a => a.doctorId === schedule.doctorId &&
           a.slotDateTime.startsWith(schedule.date) &&
           a.status === "booked"
    );
    if (activeAppointments.length > 0) {
      return {
        success: false,
        error: `Нельзя удалить расписание: есть ${activeAppointments.length} активных записей на ${schedule.date}`
      };
    }

    dispatch({ type: "DELETE_SCHEDULE", payload: scheduleId });
    return { success: true };
  }, [state.workSlots, state.appointments]);

  return (
    <ScheduleContext.Provider
      value={{
        ...state,
        bookAppointment,
        cancelAppointment,
        rescheduleAppointment,
        completeAppointment,
        generateSchedule,
        deleteSchedule
      }}
    >
      {children}
    </ScheduleContext.Provider>
  );
}

export function useSchedule() {
  const context = useContext(ScheduleContext);
  if (!context) {
    throw new Error("useSchedule должен быть использован внутри ScheduleProvider");
  }
  return context;
}