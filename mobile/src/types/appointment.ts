export type AppointmentStatus =
  | 'SCHEDULED'
  | 'CONFIRMED'
  | 'CANCELLED'
  | 'COMPLETED';

export type AppointmentPatient = {
  id: string;
  fullName: string;
  cpf: string;
  phone: string;
};

export type AppointmentProfessional = {
  id: string;
  fullName: string;
};

export type AppointmentSpecialty = {
  id: string;
  name: string;
};

export type Appointment = {
  id: string;
  patientId: string;
  professionalId: string;
  specialtyId: string;
  startAt: string;
  status: AppointmentStatus;
  notes: string | null;
  patient: AppointmentPatient;
  professional: AppointmentProfessional;
  specialty: AppointmentSpecialty;
  createdAt: string;
  updatedAt: string;
};
