import { format, isToday, isTomorrow, isYesterday } from 'date-fns';
import { BusinessHours, ShopClosure } from '@/types';
import { parseISO, isSameDay } from 'date-fns';

/**
 * Formats a date in a human-readable way
 * @param dateString - ISO date string
 * @returns Formatted date string
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  
  if (isToday(date)) {
    return 'Today';
  }
  
  if (isTomorrow(date)) {
    return 'Tomorrow';
  }
  
  if (isYesterday(date)) {
    return 'Yesterday';
  }
  
  return format(date, 'MMM d, yyyy');
};

/**
 * Formats a time in 12-hour format
 * @param timeString - Time string in 24-hour format (HH:MM)
 * @returns Formatted time string in 12-hour format
 */
export const formatTime = (timeString: string): string => {
  const [hours, minutes] = timeString.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 || 12;
  
  return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`;
};

/**
 * Formats a full datetime
 * @param dateString - ISO date string
 * @param timeString - Time string in 24-hour format (HH:MM)
 * @returns Formatted datetime string
 */
export const formatDateTime = (dateString: string, timeString: string): string => {
  return `${formatDate(dateString)} at ${formatTime(timeString)}`;
};

/**
 * Formats a time in minutes (e.g., 65) to a string (e.g., "01:05")
 */
export const formatTimeFromMinutes = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

/**
 * Converts a time string (e.g., "01:05") to minutes (e.g., 65)
 */
export const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

/**
 * Calculates the end time from a start time and duration
 */
export const calculateEndTime = (startTime: string, durationMinutes: number): string => {
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = startMinutes + durationMinutes;
  return formatTimeFromMinutes(endMinutes);
};

/**
 * Checks if a time slot overlaps with a given time range
 */
export const isOverlapping = (
  slotStart: string,
  slotEnd: string,
  rangeStart: string,
  rangeEnd: string
): boolean => {
  const slotStartMinutes = timeToMinutes(slotStart);
  const slotEndMinutes = timeToMinutes(slotEnd);
  const rangeStartMinutes = timeToMinutes(rangeStart);
  const rangeEndMinutes = timeToMinutes(rangeEnd);

  return (
    (slotStartMinutes >= rangeStartMinutes && slotStartMinutes < rangeEndMinutes) ||
    (slotEndMinutes > rangeStartMinutes && slotEndMinutes <= rangeEndMinutes) ||
    (slotStartMinutes <= rangeStartMinutes && slotEndMinutes >= rangeEndMinutes)
  );
};

/**
 * Checks if the shop is closed on the specified date based on shop closures
 * @param date - Date to check in "yyyy-MM-dd" format or Date object
 * @param shopClosures - Array of shop closure objects
 * @param time - Optional time in "HH:MM" format to check for partial day closures
 * @returns true if the shop is closed, false otherwise
 */
export const isShopClosed = (
  date: string | Date,
  shopClosures: ShopClosure[],
  time?: string
): boolean => {
  const dateToCheck = typeof date === 'string' ? date : format(date, 'yyyy-MM-dd');
  
  // Find any closure for the specified date
  const closure = shopClosures.find(c => c.date === dateToCheck);
  
  if (!closure) {
    return false; // No closure found
  }

  // For full day closures, the shop is closed all day
  if (closure.isFullDay) {
    return true;
  }

  // For partial day closures, check if the specified time is within the closure time range
  if (time && closure.startTime && closure.endTime) {
    const timeMinutes = timeToMinutes(time);
    const closureStartMinutes = timeToMinutes(closure.startTime);
    const closureEndMinutes = timeToMinutes(closure.endTime);
    
    return timeMinutes >= closureStartMinutes && timeMinutes < closureEndMinutes;
  }

  // If no time specified for a partial day closure, default to closed
  return false;
};

/**
 * Creates time slots for a day
 * @param openingTime - Opening time in 24-hour format (HH:MM)
 * @param closingTime - Closing time in 24-hour format (HH:MM)
 * @param slotDuration - Duration of each slot in minutes
 * @param breaks - Array of break periods
 * @param shopClosures - Optional array of shop closure periods
 * @param date - Optional date to check for shop closures in "yyyy-MM-dd" format
 * @returns Array of available time slots
 */
export const createTimeSlots = (
  openingTime: string,
  closingTime: string,
  slotDuration: number,
  breaks: { start: string; end: string }[] = [],
  shopClosures: ShopClosure[] = [],
  date?: string
): string[] => {
  // If the shop is fully closed for the day, return no slots
  if (date && isShopClosed(date, shopClosures)) {
    return [];
  }
  
  const slots: string[] = [];
  
  const [openHour, openMinute] = openingTime.split(':').map(Number);
  const [closeHour, closeMinute] = closingTime.split(':').map(Number);
  
  const openMinutes = openHour * 60 + openMinute;
  const closeMinutes = closeHour * 60 + closeMinute;
  
  // Convert breaks to minutes
  const breakPeriods = breaks.map(breakTime => {
    const [startHour, startMinute] = breakTime.start.split(':').map(Number);
    const [endHour, endMinute] = breakTime.end.split(':').map(Number);
    
    return {
      start: startHour * 60 + startMinute,
      end: endHour * 60 + endMinute
    };
  });
  
  // Get partial day closure for this date if it exists
  let partialDayClosure: { start: number; end: number } | null = null;
  if (date) {
    const closure = shopClosures.find(c => c.date === date && !c.isFullDay);
    if (closure && closure.startTime && closure.endTime) {
      const [startHour, startMinute] = closure.startTime.split(':').map(Number);
      const [endHour, endMinute] = closure.endTime.split(':').map(Number);
      
      partialDayClosure = {
        start: startHour * 60 + startMinute,
        end: endHour * 60 + endMinute
      };
    }
  }
  
  // Create slots
  for (let time = openMinutes; time < closeMinutes; time += slotDuration) {
    // Check if the current time falls within a break
    const isBreakTime = breakPeriods.some(
      breakPeriod => time >= breakPeriod.start && time < breakPeriod.end
    );
    
    // Check if the current time falls within a partial day closure
    const isClosedTime = partialDayClosure && 
      time >= partialDayClosure.start && time < partialDayClosure.end;
    
    if (!isBreakTime && !isClosedTime) {
      const hour = Math.floor(time / 60);
      const minute = time % 60;
      slots.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
    }
  }
  
  return slots;
};