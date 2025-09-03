// ----------------  INLINE UTILITY HELPERS  ----------------

// Convert HH:MM or HH:MM:SS to total minutes past midnight
function convertTimeToMinutes(timeString) {
  if (!timeString) return 0;
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
}

// Convert minutes past midnight back to HH:MM:SS (zero-pad)
function convertMinutesToTime(minutes) {
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:00`;
}

// Format 24-hour HH:MM[:SS] to 12-hour h:mm AM/PM (used only for display)
function formatTo12Hour(timeString) {
  const [hStr, mStr] = timeString.split(':');
  const hours = Number(hStr);
  const minutes = Number(mStr);
  const period = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 || 12;
  return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`;
}

// Standardize HH:MM to HH:MM:SS
function standardizeTimeFormat(timeString) {
  if (!timeString) return null;
  return timeString.split(':').length === 3 ? timeString : `${timeString}:00`;
}

// Convert a time string from source timezone to target timezone (returns HH:MM:SS in target)
function convertTimezone(timeString, date, sourceTimezone = 'UTC', targetTimezone = 'UTC') {
  // Intl API for lightweight TZ handling (Node 18+)
  const [h, m, s = '00'] = standardizeTimeFormat(timeString).split(':');
  const iso = `${date}T${h.padStart(2, '0')}:${m.padStart(2, '0')}:${s}`;
  const utcMillis = Date.parse(iso + 'Z'); // Treat given time as UTC first

  // Shift from sourceTimezone to UTC
  const srcOffset = -new Date(utcMillis).getTimezoneOffset(); // naive offset in minutes (local); may not reflect src TZ
  // For a more precise approach we'd need a TZ lib; keep simple

  const utcDate = new Date(utcMillis - srcOffset * 60000);

  // Format into target timezone using Intl
  const formatter = new Intl.DateTimeFormat('en-GB', {
    hour12: false,
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    timeZone: targetTimezone,
  });
  return formatter.format(utcDate);
}

// Time-zone aware helper mirroring project utility
function getConsistentDayOfWeek(dateString, timezone = 'UTC') {
  // Use Intl to obtain weekday in target timezone at local noon
  const noonUTC = new Date(`${dateString}T12:00:00Z`);
  const formatter = new Intl.DateTimeFormat('en-US', { weekday: 'long', timeZone: timezone });
  const weekday = formatter.format(noonUTC).toLowerCase(); // 'Wednesday' -> 'wednesday'
  const names = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return { dayOfWeek: weekday, numericDayOfWeek: names.indexOf(weekday) };
}

// ----------------  INLINE generateTimeSlots  ----------------

function generateTimeSlots(
  businessOpenTime,
  businessCloseTime,
  slotDuration,
  serviceDuration,
  staffWorkingHours,
  breaks,
  existingAppointments,
  partialClosures,
  date = null,
  timezone = null,
) {
  const slots = [];

  const businessOpen = convertTimeToMinutes(businessOpenTime);
  const businessClose = convertTimeToMinutes(businessCloseTime);

  // Day-of-week info (for filtering working hours & breaks)
  let requestedDayOfWeek = null;
  if (date) {
    const dayInfo = getConsistentDayOfWeek(date, timezone || 'UTC');
    requestedDayOfWeek = dayInfo.dayOfWeek; // e.g. 'wednesday'
  }

  // Filter breaks matching day (if specified)
  const validBreaks = (breaks || []).filter((b) => {
    if (!b?.start_time || !b?.end_time) return false;
    if (b.day_of_week != null) return b.day_of_week.toLowerCase() === requestedDayOfWeek;
    return true; // take break when day not specified
  });

  // Filter staff working hours for the date
  const validWorkingHours = (staffWorkingHours || []).filter((wh) => {
    if (!wh?.start_time || !wh?.end_time) return false;
    if (wh.day_of_week != null) return wh.day_of_week.toLowerCase() === requestedDayOfWeek;
    return true;
  });

  // Iterate through business day in `slotDuration` steps
  for (let t = businessOpen; t <= businessClose - serviceDuration; t += slotDuration) {
    const slotStart = convertMinutesToTime(t);
    const slotEnd = convertMinutesToTime(t + serviceDuration);

    let available = true;
    let unavailableReason = '';

    // 1. Must fit inside at least one working-hour segment
    if (validWorkingHours.length) {
      const fits = validWorkingHours.some((wh) => {
        const ws = convertTimeToMinutes(wh.start_time);
        const we = convertTimeToMinutes(wh.end_time);
        return t >= ws && t + serviceDuration <= we;
      });
      if (!fits) {
        available = false;
        unavailableReason = 'Outside staff working hours';
      }
    }

    // 2. Break overlap
    if (available && validBreaks.length) {
      available = !validBreaks.some((br) => {
        const bs = convertTimeToMinutes(br.start_time);
        const be = convertTimeToMinutes(br.end_time);
        return (
          (t >= bs && t < be) ||
          (t + serviceDuration > bs && t + serviceDuration <= be) ||
          (t <= bs && t + serviceDuration >= be)
        );
      });
      if (!available) unavailableReason = 'Break overlap';
    }

    // 3. Appointment overlap
    if (available && (existingAppointments || []).length) {
      available = !existingAppointments.some((ap) => {
        const as = convertTimeToMinutes(ap.time);
        const ae = convertTimeToMinutes(ap.end_time);
        return (
          (t >= as && t < ae) ||
          (t + serviceDuration > as && t + serviceDuration <= ae) ||
          (t <= as && t + serviceDuration >= ae)
        );
      });
      if (!available) unavailableReason = 'Booked';
    }

    // 4. Partial closure overlap
    if (available && (partialClosures || []).length) {
      available = !partialClosures.some((cl) => {
        const cs = convertTimeToMinutes(cl.start_time);
        const ce = convertTimeToMinutes(cl.end_time);
        return (
          (t >= cs && t < ce) ||
          (t + serviceDuration > cs && t + serviceDuration <= ce) ||
          (t <= cs && t + serviceDuration >= ce)
        );
      });
      if (!available) unavailableReason = 'Shop closed';
    }

    slots.push({
      time: slotStart,
      end_time: slotEnd,
      available,
      unavailableReason: available ? null : unavailableReason,
      displayTime: formatTo12Hour(slotStart),
      displayEndTime: formatTo12Hour(slotEnd),
      timezone,
    });
  }

  return slots;
}

/**
 * Utility helper to summarise generated slots.
 */
function summarise(slots) {
  const availableSlots = slots.filter((s) => s.available);
  return {
    total: slots.length,
    available: availableSlots.length,
    first5: availableSlots.slice(0, 5).map((s) => `${s.time}-${s.end_time}`),
  };
}

const DEFAULT_TZ = 'America/Edmonton';

/**
 * Simple availability checker mirroring main logic for a single slot.
 * Returns true if slot starting at `time` (HH:MM) for `serviceDuration` minutes is free.
 */
function isSlotAvailable({
  time, // HH:MM
  serviceDuration,
  businessOpenTime,
  businessCloseTime,
  staffWorkingHours,
  breaks,
  existingAppointments,
  partialClosures,
}) {
  const start = convertTimeToMinutes(time);
  const end = start + serviceDuration;

  // Business hours bounds
  if (start < convertTimeToMinutes(businessOpenTime) || end > convertTimeToMinutes(businessCloseTime)) {
    return false;
  }

  // Working hours
  if (staffWorkingHours.length) {
    const fits = staffWorkingHours.some((wh) => {
      const ws = convertTimeToMinutes(wh.start_time);
      const we = convertTimeToMinutes(wh.end_time);
      return start >= ws && end <= we;
    });
    if (!fits) return false;
  }

  // Breaks
  if (breaks.some((br) => {
    const bs = convertTimeToMinutes(br.start_time);
    const be = convertTimeToMinutes(br.end_time);
    return (
      (start >= bs && start < be) ||
      (end > bs && end <= be) ||
      (start <= bs && end >= be)
    );
  })) return false;

  // Appointments
  if (existingAppointments.some((ap) => {
    const as = convertTimeToMinutes(ap.time);
    const ae = convertTimeToMinutes(ap.end_time);
    return (
      (start >= as && start < ae) ||
      (end > as && end <= ae) ||
      (start <= as && end >= ae)
    );
  })) return false;

  // Partial closures
  if (partialClosures.some((cl) => {
    const cs = convertTimeToMinutes(cl.start_time);
    const ce = convertTimeToMinutes(cl.end_time);
    return (
      (start >= cs && start < ce) ||
      (end > cs && end <= ce) ||
      (start <= cs && end >= ce)
    );
  })) return false;

  return true;
}

function runTestCase(title, {
  businessOpenTime = '09:00',
  businessCloseTime = '17:00',
  slotDuration = 30,
  serviceDuration = 30,
  staffWorkingHours = [],
  breaks = [],
  existingAppointments = [],
  partialClosures = [],
  date = '2024-07-10',
  timezone = DEFAULT_TZ,
  rescheduleTests = [],
}) {
  console.log(`\n========== ${title} ==========`);

  // Generate the time-slots via core helper
  const slots = generateTimeSlots(
    businessOpenTime,
    businessCloseTime,
    slotDuration,
    serviceDuration,
    staffWorkingHours,
    breaks,
    existingAppointments,
    partialClosures,
    date,
    timezone,
  );

  const { total, available, first5 } = summarise(slots);
  console.log(`Total slots: ${total}`);
  console.log(`Available : ${available}`);
  console.log(`First 5 available slots:`, first5);

  // Run reschedule availability tests
  if (rescheduleTests.length) {
    rescheduleTests.forEach((test) => {
      const available = isSlotAvailable({
        time: test.time,
        serviceDuration,
        businessOpenTime,
        businessCloseTime,
        staffWorkingHours,
        breaks,
        existingAppointments,
        partialClosures,
      });
      const passed = available === test.expectAvailable;
      console.log(`  [${passed ? 'PASS' : 'FAIL'}] Reschedule at ${test.time} expected ${test.expectAvailable ? 'AVAILABLE' : 'UNAVAILABLE'}, got ${available ? 'AVAILABLE' : 'UNAVAILABLE'}`);
    });
  }

  if (available === 0) {
    console.log('No available slots generated for this scenario.');
  }
}

// Common data shared across scenarios
const baseWorkingHours = [{
  day_of_week: 'Wednesday',
  start_time: '09:00',
  end_time: '17:00',
}];

const scenarios = [
  {
    title: 'Baseline – No breaks, no appointments',
    config: {
      staffWorkingHours: baseWorkingHours,
      rescheduleTests: [
        { time: '10:00', expectAvailable: true },
      ],
    },
  },
  {
    title: 'Admin break 12:00-13:00',
    config: {
      staffWorkingHours: baseWorkingHours,
      breaks: [{ start_time: '12:00', end_time: '13:00', name: 'Lunch Break' }],
      rescheduleTests: [
        { time: '12:00', expectAvailable: false },
        { time: '11:00', expectAvailable: true },
      ],
    },
  },
  {
    title: 'Staff break 15:30-16:00',
    config: {
      staffWorkingHours: baseWorkingHours,
      breaks: [{ start_time: '15:30', end_time: '16:00', name: 'Coffee Break' }],
      rescheduleTests: [
        { time: '15:30', expectAvailable: false },
        { time: '15:00', expectAvailable: true },
      ],
    },
  },
  {
    title: 'Existing appointment 09:30-10:00',
    config: {
      staffWorkingHours: baseWorkingHours,
      existingAppointments: [{ time: '09:30', end_time: '10:00' }],
      rescheduleTests: [
        { time: '09:30', expectAvailable: false },
        { time: '10:00', expectAvailable: true },
      ],
    },
  },
  {
    title: 'Partial shop closure 14:00-15:00',
    config: {
      staffWorkingHours: baseWorkingHours,
      partialClosures: [{ start_time: '14:00', end_time: '15:00', reason: 'Maintenance' }],
      rescheduleTests: [
        { time: '14:00', expectAvailable: false },
        { time: '13:00', expectAvailable: true },
      ],
    },
  },
  {
    title: 'Long service (60 min)',
    config: {
      staffWorkingHours: baseWorkingHours,
      serviceDuration: 60,
      rescheduleTests: [
        { time: '16:30', expectAvailable: false }, // exceeds closing
        { time: '15:00', expectAvailable: true },
      ],
    },
  },
  {
    title: 'Multiple services totalling 90 min',
    config: {
      staffWorkingHours: baseWorkingHours,
      serviceDuration: 90,
      rescheduleTests: [
        { time: '15:00', expectAvailable: true },
        { time: '15:30', expectAvailable: true },
        { time: '15:31', expectAvailable: false }, // not a generated slot but edge availability check
        { time: '09:00', expectAvailable: true },
      ],
    },
  },
  {
    title: 'Split shift (09:00-12:00 & 13:00-17:00)',
    config: {
      staffWorkingHours: [
        { day_of_week: 'Wednesday', start_time: '09:00', end_time: '12:00' },
        { day_of_week: 'Wednesday', start_time: '13:00', end_time: '17:00' },
      ],
      rescheduleTests: [
        { time: '12:30', expectAvailable: false },
        { time: '09:30', expectAvailable: true },
        { time: '13:30', expectAvailable: true },
      ],
    },
  },
  {
    title: 'Full-day shop closure',
    config: {
      // Simulate full day closure by passing a partialClosure covering whole day
      partialClosures: [{ start_time: '00:00', end_time: '23:59', reason: 'Public Holiday' }],
      staffWorkingHours: baseWorkingHours,
      rescheduleTests: [
        { time: '10:00', expectAvailable: false },
      ],
    },
  },
  {
    title: 'Timezone – America/Edmonton (default)',
    config: {
      staffWorkingHours: baseWorkingHours,
      timezone: DEFAULT_TZ,
      rescheduleTests: [
        { time: '10:00', expectAvailable: true },
      ],
    },
  },
  {
    title: 'Long 3-hour service exceeds limited staff shift',
    config: {
      businessOpenTime: '09:00',
      businessCloseTime: '17:00',
      serviceDuration: 180,
      staffWorkingHours: [
        { day_of_week: 'Wednesday', start_time: '09:00', end_time: '11:00' }, // only 2 hours
      ],
      rescheduleTests: [
        { time: '09:00', expectAvailable: false },
      ],
    },
  },
  {
    title: 'DST spring-forward day (America/Edmonton)',
    config: {
      date: '2024-03-10', // DST start in 2024
      timezone: DEFAULT_TZ,
      staffWorkingHours: baseWorkingHours,
      rescheduleTests: [
        { time: '10:00', expectAvailable: true },
      ],
    },
  },
  {
    title: '15-minute slot granularity',
    config: {
      slotDuration: 15,
      staffWorkingHours: baseWorkingHours,
      rescheduleTests: [
        { time: '09:15', expectAvailable: true },
        { time: '17:00', expectAvailable: false },
      ],
    },
  },
];

// Execute all scenarios sequentially
scenarios.forEach(({ title, config }) => runTestCase(title, config));

console.log('\nAll scenarios executed. Review the output above to validate slot generation logic.'); 