import { getAllStaff, useStaffApi } from "@/api";
import { useApi } from "@/hooks/useApi";
import { useState, useEffect } from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { getBookingStaff } from "@/api/services/bookingService";

dayjs.extend(utc);
dayjs.extend(timezone);

const isEmptyObject = (obj: Record<string, any>) => {
  return (
    obj && 
    Object.keys(obj).length === 0 || 
    Object.values(obj).every(
      (val) =>
        val === "" ||
        val === null ||
        val === undefined
    )
  );
};

export default function TimePicker({
  open = false,
  onClose = () => { },
  staffId = "",
}) {
  const [duration, setDuration] = useState(""); // default break 30 min
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [selectedStaff, setSelectedStaff] = useState("");
  const [filteredStaff, setFilteredStaff] = useState([]);
  const { execute: fetchStaff } = useApi(getAllStaff);
  const [error, setError]: any = useState({});

  const clearEntry = () => {
    setSelectedStaff("");
    setDuration("");
    setError({})
  }

  useEffect(() => {
    // staffId
    if (staffId != "all") {
      setSelectedStaff(staffId);
    }
    setDuration("")

  }, [staffId]);
  // alert(selectedStaff)

  const {
    data: staffBreakData,
    loading: staffBreakLoading,
    error: staffBreakError,
    execute: createStaffBreak,
  } = useApi(useStaffApi);

  const timeZone = "America/Edmonton";

  // update start and end times when modal opens or duration changes
  useEffect(() => {
    if (open) {
      const now = new Date();
      setStartTime(now);

      const end = new Date(now.getTime() + duration * 60000);
      setEndTime(end);
    }
  }, [open, duration]);

  // Format time to 12-hour format with AM/PM (for display only)
  const formatTime = (date: Date) => {
    let h = date.getHours();
    const m = date.getMinutes().toString().padStart(2, "0");
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    return `${h}:${m} ${ampm}`;
  };

  // Format duration in hours and minutes
  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hrs} hr${hrs > 1 ? "s" : ""} ${mins > 0 ? mins + " min" : ""}`;
  };

  // Convert to 24h format (America/Edmonton zone)
  const formatTimeTo24h = (date: Date) => {
    return dayjs(date).tz(timeZone).format("HH:mm:ss");
  };

  // Get day of week in Edmonton (0 = Sunday ... 6 = Saturday)
  const getDayOfWeek = (date: Date) => {
    return dayjs(date).tz(timeZone).day();
  };

  const onSave = async () => {
    try {
      if (!duration) {
        error.break = "Please select a break duration.";
      } else {
        error.break = ""
      }
      if (!selectedStaff) {
        error.staff = "Please select a Staff";
      } else {
        error.staff = ""
      }
      if (!isEmptyObject(error)) {
        return setError({ ...error })
      }

      let response: any = await createStaffBreak({
        id: selectedStaff,
        name: "lunch",
        start_time: formatTimeTo24h(startTime),
        end_time: formatTimeTo24h(endTime),
        day_of_week: getDayOfWeek(startTime),
      });

      if (response?.success) {
        onClose();
        clearEntry()
        alert("Staff break has been successfully created.");
      }

    } catch (error) {
      alert("Failed to create staff break. Please try again.");
    }


  };

  useEffect(() => {
    (async () => {
      const res: any = await fetchStaff();
      if (res.success) {
        setFilteredStaff(res.staff);
      }
    })()
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white rounded-2xl shadow-lg w-11/12 max-w-md p-6">
        <h2 className="text-xl font-semibold mb-4">Set Break Duration</h2>

        <div className="items-center mb-4">
          <label className="font-medium">Select Staff</label> <br />
          <select
            value={selectedStaff}
            onChange={(e) => setSelectedStaff(e.target.value)}
            className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 mt-2 w-full"
            disabled={filteredStaff.filter(({ id }) => id == staffId).length > 0}
          >
            <option value="">-- Select Staff --</option>
            {filteredStaff.map((staff: any) => {
              const { user, id } = staff;
              const { name } = user;
              console.log("___fetchStaff >> selected : ", id, staffId, id == staffId);
              return (
                <option
                  selected={id == staffId}
                  disabled={id == staffId}
                  key={id}
                  value={id}>
                  {name}
                </option>
              );
            })}
          </select>
          {error.staff && <p className="text-red-500 mt-2">{error.staff}</p>}
        </div>

        {/* Duration Picker */}
        <div className="items-center mb-4">
          <label className="font-medium">Break Duration (minutes):</label>
          <select
            value={duration}
            onChange={(e: any) => setDuration(e.target.value)}
            className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 w-full mt-2"
          >
            <option value="">-- Select Break Duration --</option>
            {Array.from({ length: 12 }, (_, i) => {
              const val = (i + 1) * 5; // 5,10,15,...60
              return (
                <option key={val} value={val}>
                  {val} min
                </option>
              );
            })}
          </select>
          {error.break && <p className="text-red-500 mt-2">{error.break}</p>}
        </div>

        {/* Display Start / End / Duration */}
        <table className="mt-4 w-full rounded-lg">
          <tbody>
            <tr className="border-b">
              <td className="px-4 py-2 font-medium text-gray-700">Break starts at</td>
              <td className="px-4 py-2 font-medium text-right">{formatTime(startTime)}</td>
            </tr>
            <tr className="border-b">
              <td className="px-4 py-2 font-medium text-gray-700">Break ends at</td>
              <td className="px-4 py-2 font-medium text-right">{formatTime(endTime)}</td>
            </tr>
            <tr>
              <td className="px-4 py-2 font-semibold text-gray-700">Total break</td>
              <td className="px-4 py-2 font-semibold text-right">{formatDuration(duration)}</td>
            </tr>
          </tbody>
        </table>

        {/* Buttons */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={()=>[onClose(),clearEntry()]}
            className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            {staffBreakLoading ? "Loading..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
