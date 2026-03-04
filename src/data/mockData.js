export const DOCTORS = [
  {
    id: "doc-1",
    fio: "Иван Петрович Сидоров",
    specialty: "Терапевт",
    cabinet: "101",
    phone: "+7 (999) 123-45-67"
  },
  {
    id: "doc-2",
    fio: "Мария Ивановна Петрова",
    specialty: "Кардиолог",
    cabinet: "102",
    phone: "+7 (999) 234-56-78"
  },
  {
    id: "doc-3",
    fio: "Петр Сергеевич Иванов",
    specialty: "Невролог",
    cabinet: "103",
    phone: "+7 (999) 345-67-89"
  },
  {
    id: "doc-4",
    fio: "Наталья Викторовна Смирнова",
    specialty: "Дерматолог",
    cabinet: "104",
    phone: "+7 (999) 456-78-90"
  },
  {
    id: "doc-5",
    fio: "Алексей Николаевич Лебедев",
    specialty: "Ортопед",
    cabinet: "105",
    phone: "+7 (999) 567-89-01"
  }
];

export const WORK_SLOTS = [
  {
    id: "slot-1",
    doctorId: "doc-1",
    date: "2026-03-04",
    startTime: "08:00",
    endTime: "16:00",
    slotMinutes: 30,
    breakStart: "12:00",
    breakEnd: "13:00",
    slots: [
      { dateTime: "2026-03-04 08:00", available: true },
      { dateTime: "2026-03-04 08:30", available: true },
      { dateTime: "2026-03-04 09:00", available: true },
      { dateTime: "2026-03-04 09:30", available: true },
      { dateTime: "2026-03-04 10:00", available: true },
      { dateTime: "2026-03-04 10:30", available: true },
      { dateTime: "2026-03-04 11:00", available: true },
      { dateTime: "2026-03-04 11:30", available: true },
      { dateTime: "2026-03-04 13:00", available: true },
      { dateTime: "2026-03-04 13:30", available: true },
      { dateTime: "2026-03-04 14:00", available: true },
      { dateTime: "2026-03-04 14:30", available: true },
      { dateTime: "2026-03-04 15:00", available: true },
      { dateTime: "2026-03-04 15:30", available: true }
    ]
  },
  {
    id: "slot-2",
    doctorId: "doc-2",
    date: "2026-03-04",
    startTime: "09:00",
    endTime: "17:00",
    slotMinutes: 20,
    breakStart: "12:00",
    breakEnd: "13:00",
    slots: [
      { dateTime: "2026-03-04 09:00", available: true },
      { dateTime: "2026-03-04 09:20", available: true },
      { dateTime: "2026-03-04 09:40", available: true },
      { dateTime: "2026-03-04 10:00", available: true },
      { dateTime: "2026-03-04 10:20", available: true },
      { dateTime: "2026-03-04 10:40", available: true },
      { dateTime: "2026-03-04 11:00", available: true },
      { dateTime: "2026-03-04 11:20", available: true },
      { dateTime: "2026-03-04 11:40", available: true },
      { dateTime: "2026-03-04 13:00", available: true },
      { dateTime: "2026-03-04 13:20", available: true },
      { dateTime: "2026-03-04 13:40", available: true },
      { dateTime: "2026-03-04 14:00", available: true },
      { dateTime: "2026-03-04 14:20", available: true },
      { dateTime: "2026-03-04 14:40", available: true },
      { dateTime: "2026-03-04 15:00", available: true },
      { dateTime: "2026-03-04 15:20", available: true },
      { dateTime: "2026-03-04 15:40", available: true },
      { dateTime: "2026-03-04 16:00", available: true },
      { dateTime: "2026-03-04 16:20", available: true },
      { dateTime: "2026-03-04 16:40", available: true }
    ]
  }
];

export const APPOINTMENTS = [
  {
    id: "apt-1",
    doctorId: "doc-1",
    slotDateTime: "2026-03-04 08:00",
    status: "booked",
    patientCode: "PAT-001",
    patientName: "Анна Сергеевна Федорова",
    bookedAt: "2026-03-01T10:00:00Z",
    bookedBy: "reg-1"
  },
  {
    id: "apt-2",
    doctorId: "doc-1",
    slotDateTime: "2026-03-04 09:00",
    status: "booked",
    patientCode: "PAT-002",
    patientName: "Борис Игоревич Морозов",
    bookedAt: "2026-03-01T11:00:00Z",
    bookedBy: "reg-1"
  },
  {
    id: "apt-3",
    doctorId: "doc-2",
    slotDateTime: "2026-03-04 09:00",
    status: "completed",
    patientCode: "PAT-003",
    patientName: "Валерия Дмитриевна Козлова",
    bookedAt: "2026-02-28T14:00:00Z",
    bookedBy: "reg-1"
  }
];

export const PATIENTS = [
  {
    patientCode: "PAT-001",
    fio: "Анна Сергеевна Федорова",
    birthYear: 1985
  },
  {
    patientCode: "PAT-002",
    fio: "Борис Игоревич Морозов",
    birthYear: 1990
  },
  {
    patientCode: "PAT-003",
    fio: "Валерия Дмитриевна Козлова",
    birthYear: 1988
  }
];