import { Salon, Appointment } from './types';

// LocalStorage keys
const SALONS_KEY = 'salons';
const APPOINTMENTS_KEY = 'appointments';

// Salon operations
export const saveSalon = (salon: Salon): void => {
  if (typeof window === 'undefined') return;
  
  const salons = getSalons();
  salons.push(salon);
  localStorage.setItem(SALONS_KEY, JSON.stringify(salons));
};

export const getSalons = (): Salon[] => {
  if (typeof window === 'undefined') return [];
  
  const data = localStorage.getItem(SALONS_KEY);
  return data ? JSON.parse(data) : [];
};

export const getSalonById = (id: string): Salon | null => {
  const salons = getSalons();
  return salons.find(salon => salon.id === id) || null;
};

export const updateSalon = (id: string, updatedData: Partial<Salon>): void => {
  if (typeof window === 'undefined') return;
  
  const salons = getSalons();
  const index = salons.findIndex(salon => salon.id === id);
  
  if (index !== -1) {
    salons[index] = { ...salons[index], ...updatedData };
    localStorage.setItem(SALONS_KEY, JSON.stringify(salons));
  }
};

// Appointment operations
export const saveAppointment = (appointment: Appointment): void => {
  if (typeof window === 'undefined') return;
  
  const appointments = getAppointments();
  appointments.push(appointment);
  localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(appointments));
};

export const getAppointments = (): Appointment[] => {
  if (typeof window === 'undefined') return [];
  
  const data = localStorage.getItem(APPOINTMENTS_KEY);
  return data ? JSON.parse(data) : [];
};

export const getAppointmentsBySalonId = (salonId: string): Appointment[] => {
  const appointments = getAppointments();
  return appointments.filter(apt => apt.salonId === salonId);
};

export const updateAppointment = (id: string, updatedData: Partial<Appointment>): void => {
  if (typeof window === 'undefined') return;
  
  const appointments = getAppointments();
  const index = appointments.findIndex(apt => apt.id === id);
  
  if (index !== -1) {
    appointments[index] = { ...appointments[index], ...updatedData };
    localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(appointments));
  }
};

export const deleteAppointment = (id: string): void => {
  if (typeof window === 'undefined') return;
  
  const appointments = getAppointments();
  const filtered = appointments.filter(apt => apt.id !== id);
  localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(filtered));
};

// Authentication
export const getSalonByEmail = (email: string): Salon | null => {
  const salons = getSalons();
  return salons.find(salon => salon.email.toLowerCase() === email.toLowerCase()) || null;
};

export const updateSalonData = (id: string, updatedData: Partial<Salon>): void => {
  if (typeof window === 'undefined') return;
  
  const salons = getSalons();
  const index = salons.findIndex(salon => salon.id === id);
  
  if (index !== -1) {
    salons[index] = { ...salons[index], ...updatedData };
    localStorage.setItem(SALONS_KEY, JSON.stringify(salons));
  }
};
