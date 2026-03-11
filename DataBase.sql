USE clinic;

create table if NOT EXISTS doctor (
    doctor_id int primary key auto_increment,
    fio varchar(255) not null,
    specialization varchar(255) not null
);
create table if NOT EXISTS patient (
    patient_id varchar(50) primary key,
    fio varchar(255) not null,
    date_of_birth date not null,
    tele varchar(20) not null
);
create table if NOT EXISTS work_slots (
  doctor_id INT NOT NULL,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  slot_minutes INT NOT NULL,
  break_start TIME,
  break_end TIME,
  PRIMARY KEY (doctor_id, date, start_time),
  FOREIGN KEY (doctor_id) REFERENCES doctor(doctor_id)
);
create table if NOT EXISTS appointments (
  appt_id INT PRIMARY KEY AUTO_INCREMENT,
  doctor_id INT NOT NULL,
  slot_datetime DATETIME NOT NULL,
  status ENUM('booked','canceled','completed') NOT NULL,
  patient_id VARCHAR(50),
  FOREIGN KEY (doctor_id) REFERENCES doctor(doctor_id),
  FOREIGN KEY (patient_id) REFERENCES patient(patient_id),
  UNIQUE (doctor_id, slot_datetime)
);
