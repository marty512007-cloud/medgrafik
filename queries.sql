Use clinic;


-- 1. Список всех врачей
SELECT doctor_id, fio, specialization
FROM doctor
ORDER BY fio;


-- 2. Создание рабочих часов врачу на дату
INSERT into work_slots(doctor_id, date, start_time, end_time, slot_minutes, break_start, break_end)
VALUES (1, '2026-03-03', '09:00:00', '19:00:00', 30, '13:00:00', '14:00:00');


-- 3. Генерация слотов на конкретную дату
WITH RECURSIVE time_slots AS (
    SELECT 
        ws.doctor_id,
        ws.date,
        ws.start_time AS slot_time,
        ws.end_time,
        ws.slot_minutes,
        ws.break_start,
        ws.break_end
    FROM work_slots ws
    WHERE ws.doctor_id = 1
      AND ws.date = '2026-03-03'

    UNION ALL

    SELECT
        doctor_id,
        date,
        ADDTIME(slot_time, SEC_TO_TIME(slot_minutes * 60)),
        end_time,
        slot_minutes,
        break_start,
        break_end
    FROM time_slots
    WHERE ADDTIME(slot_time, SEC_TO_TIME(slot_minutes * 60)) < end_time
)

SELECT 
    doctor_id,
    CONCAT(date, ' ', slot_time) AS slot_datetime
FROM time_slots
WHERE (
        break_start IS NULL 
        OR slot_time NOT BETWEEN break_start AND break_end
      )
ORDER BY slot_time;


-- 4. Расписание врача со статусами
WITH RECURSIVE time_slots AS (
    SELECT 
        ws.doctor_id,
        ws.date,
        ws.start_time AS slot_time,
        ws.end_time,
        ws.slot_minutes,
        ws.break_start,
        ws.break_end
    FROM work_slots ws
    WHERE ws.doctor_id = 1
      AND ws.date = '2026-03-03'

    UNION ALL

    SELECT
        doctor_id,
        date,
        ADDTIME(slot_time, SEC_TO_TIME(slot_minutes * 60)),
        end_time,
        slot_minutes,
        break_start,
        break_end
    FROM time_slots
    WHERE ADDTIME(slot_time, SEC_TO_TIME(slot_minutes * 60)) < end_time
)

SELECT 
    ts.doctor_id,
    CONCAT(ts.date, ' ', ts.slot_time) AS slot_datetime,
    IF(a.appt_id IS NULL, 'free', a.status) AS slot_status
FROM time_slots ts
LEFT JOIN appointments a
    ON a.doctor_id = ts.doctor_id
    AND a.slot_datetime = CONCAT(ts.date, ' ', ts.slot_time)
WHERE (
        ts.break_start IS NULL 
        OR ts.slot_time NOT BETWEEN ts.break_start AND ts.break_end
      )
ORDER BY ts.slot_time;


-- 5. Запись пациента с проверкой существования пациента
START TRANSACTION;

INSERT IGNORE INTO patient (patient_id, fio, date_of_birth, tele)
VALUES ('P001', 'Смирнов С.С.', '1985-04-12', '+79161234567');

INSERT INTO appointments (doctor_id, slot_datetime, status, patient_id)
VALUES (1, '2026-03-03 10:00:00', 'booked', 'P001');

COMMIT;


-- 6. Перенос записи
UPDATE appointments
SET slot_datetime = '2026-03-03 11:00:00'
WHERE appt_id = 5
  AND status = 'booked';


-- 7. Отмена записи
UPDATE appointments
SET status = 'canceled'
WHERE appt_id = 5;