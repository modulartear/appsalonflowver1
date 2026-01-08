import { v4 as uuidv4 } from 'uuid';

export const generateUniqueId = (): string => {
  return uuidv4();
};

export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const formatTime = (time: string): string => {
  return time;
};

export const generateTimeSlots = (start: string, end: string): string[] => {
  const slots: string[] = [];
  const [startHour, startMin] = start.split(':').map(Number);
  const [endHour, endMin] = end.split(':').map(Number);
  
  // Convertir a minutos desde medianoche para comparación precisa
  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;
  
  // Generar slots cada 30 minutos
  for (let minutes = startMinutes; minutes <= endMinutes; minutes += 30) {
    const hour = Math.floor(minutes / 60);
    const min = minutes % 60;
    
    // No agregar el slot final si es exactamente la hora de cierre
    // (el último turno debe empezar antes del cierre)
    if (minutes < endMinutes) {
      slots.push(`${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`);
    }
  }
  
  return slots;
};

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^[0-9]{8,15}$/;
  return phoneRegex.test(phone.replace(/[\s-]/g, ''));
};

export const calculateTrialEndDate = (startDate: Date, plan: 'free' | 'pro' = 'free'): string => {
  const endDate = new Date(startDate);
  const days = plan === 'free' ? 15 : 30;
  endDate.setDate(endDate.getDate() + days);
  return endDate.toISOString();
};

export const isTrialExpired = (trialEndsAt: string): boolean => {
  const now = new Date();
  const trialEnd = new Date(trialEndsAt);
  return now > trialEnd;
};

export const getDaysRemainingInTrial = (trialEndsAt: string): number => {
  const now = new Date();
  const trialEnd = new Date(trialEndsAt);
  const diffTime = trialEnd.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
};

// Simple password hashing (for demo purposes - use bcrypt in production)
export const hashPassword = (password: string): string => {
  // Simple hash for demo - in production use bcrypt or similar
  return btoa(password);
};

export const verifyPassword = (password: string, hash: string): boolean => {
  try {
    return btoa(password) === hash;
  } catch {
    return false;
  }
};
