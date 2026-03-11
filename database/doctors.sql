-- Doctors table
CREATE TABLE doctors (
doctor_id INT PRIMARY KEY,
fio VARCHAR(255),
specialty VARCHAR(255)
);

-- Sample inserts
INSERT INTO doctors (doctor_id, fio, specialty) VALUES (1, 'Dr. John Doe', 'Cardiology');
INSERT INTO doctors (doctor_id, fio, specialty) VALUES (2, 'Dr. Jane Smith', 'Neurology');
