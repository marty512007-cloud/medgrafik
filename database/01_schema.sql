CREATE DATABASE IF NOT EXISTS clinic;
USE clinic;

CREATE TABLE doctors (
  doctors_id INT AUTO_INCREMENT PRIMARY KEY,
  fio VARCHAR(255),
  specialty VARCHAR(255)
);

CREATE TABLE patients (
  patient_code INT PRIMARY KEY,
  fio VARCHAR(255),
  birth_year YEAR
);

CREATE TABLE work_slots (
  doctor_id INT,
  date DATE,
  start_time TIME,
  end_time TIME,
  slot_minutes INT,
  break_start TIME,
  break_end TIME,
  UNIQUE (doctor_id, slot_datetime)
);

CREATE TABLE appointments (
  appt_id INT AUTO_INCREMENT PRIMARY KEY,
  doctor_id INT,
  slot_datetime DATETIME,
  status VARCHAR(255),
  patient_code INT
);
