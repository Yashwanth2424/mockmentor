import { formatSlotTime, groupSlots } from "@/lib/slots";

export default function SlotPicker({
  selectedDate,
  selectedMentor,
  slots,
  selectedTime,
  onSelect,
}) {
  let content;

  if (!selectedDate) {
    content = <div className="empty-slots">Select a date to view mentors and slots</div>;
  } else if (!selectedMentor) {
    content = <div className="empty-slots">Select a mentor to view available slots</div>;
  } else if (slots.length === 0) {
    content = (
      <div className="empty-slots">No slots available for this mentor on selected date</div>
    );
  } else {
    content = Object.entries(groupSlots(slots)).map(([label, group]) =>
      group.length === 0 ? null : (
        <div key={label} className="slot-group">
          <p className="slot-group-title">{label}</p>
          <div className="slots-grid">
            {group.map((time) => (
              <button
                key={time}
                type="button"
                className={`slot ${selectedTime === time ? "active" : ""}`}
                onClick={() => onSelect(time)}
              >
                {formatSlotTime(time)}
              </button>
            ))}
          </div>
        </div>
      ),
    );
  }

  return (
    <div className="booking-right">
      <h3 className="booking-right-title">Available Time Slots</h3>
      <p className="timezone-note">Times are in German time (Berlin)</p>
      {content}
    </div>
  );
}
