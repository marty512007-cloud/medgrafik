use clinic;

INSERT into appointments(appt_id, doctor_id, slot_datetime, status, patient_id)
VALUES (1, 1, '2024-07-01 09:30:00', 'booked', 'P001');
INSERT into appointments(appt_id, doctor_id, slot_datetime, status, patient_id)
VALUES (2, 1, '2024-07-01 10:00:00', 'booked', 'P002');
INSERT into appointments(appt_id, doctor_id, slot_datetime, status, patient_id)
VALUES (3, 2, '2024-07-01 10:30:00', 'booked', 'P003');
INSERT into appointments(appt_id, doctor_id, slot_datetime, status, patient_id)
VALUES (4, 3, '2024-07-01 08:30:00', 'booked', 'P004');