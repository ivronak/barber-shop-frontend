// Here are the improvements for the week view:

// 1. Update the time column to use AM/PM format
<div key={`time-${hour}`} className="h-16 sm:h-20 md:h-24 flex items-start justify-end pr-2 pt-1">
  <span className="text-xs text-muted-foreground font-medium">
    {format(new Date(2022, 0, 1, hour), 'h:00 a')}
  </span>
</div>

// 2. Improve the time slot cells with alternating backgrounds
<div 
  key={`slot-${hour}-${index}`} 
  className={cn(
    "h-16 sm:h-20 md:h-24 border-b border-r p-1 relative",
    hour % 2 === 0 ? "bg-background/30" : "bg-transparent",
    isToday && currentHour === hour ? "bg-primary/5" : ""
  )}
>

// 3. Use isCompact for multiple appointments
{appts.map(appointment => (
  <WeekViewAppointment
    key={appointment.id}
    appointment={appointment}
    onClick={() => onViewAppointment(appointment.id)}
    isCompact={true}
  />
))}

// 4. Better styling for the day headers
<div 
  className={cn(
    "h-12 sm:h-16 border-b flex flex-col items-center justify-center cursor-pointer transition-colors",
    isToday ? "border-primary border-b-2 bg-primary/5" : "hover:bg-background-alt"
  )}
  onClick={() => {
    setCurrentDate(day);
    setView('day');
  }}
>
  <div className="text-xs sm:text-sm font-medium">
    {format(day, 'EEE')}
  </div>
  <div 
    className={cn(
      "flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full text-xs sm:text-sm font-semibold",
      isToday ? "bg-primary text-white" : "text-foreground"
    )}
  >
    {format(day, 'd')}
  </div>
</div> 