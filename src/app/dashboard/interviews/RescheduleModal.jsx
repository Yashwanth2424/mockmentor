"use client";

import { useState } from "react";
import useSWR from "swr";
import { toast } from "react-toastify";
import { addDays, formatDateTime, getZonedParts, zonedTimeToUtc } from "@/lib/time";
import { fetcher } from "@/lib/fetcher";
import { ACTIVE_STATUSES } from "@/lib/interviewStatus";
import { freeSlots, mentorsAvailableOn, takenTimes, timeSlotsFor } from "@/lib/slots";

function startValues(interview) {
  const current = getZonedParts(new Date(interview.date));
  const tomorrow = addDays(getZonedParts(new Date()).dateString, 1);
  const canKeepDate = current.dateString >= tomorrow;

  return {
    date: canKeepDate ? current.dateString : "",
    mentorId: interview.mentorId || "",
    time: canKeepDate ? current.time : "",
  };
}

export default function RescheduleModal({
  interview,
  interviews,
  mentors,
  onClose,
  onRescheduled,
}) {
  const [start] = useState(() => startValues(interview));
  const [selectedDate, setSelectedDate] = useState(start.date);
  const [selectedMentor, setSelectedMentor] = useState(start.mentorId);
  const [selectedTime, setSelectedTime] = useState(start.time);
  const [rescheduling, setRescheduling] = useState(false);

  const mentorSlotsKey = selectedMentor ? `/api/mentor/${selectedMentor}/booked-slots` : null;
  const { data: mentorBooked = [], mutate: mutateMentorBooked } = useSWR(mentorSlotsKey, fetcher);

  function getAvailableSlots() {
    if (!selectedMentor) {
      return [];
    }

    const mentor = mentors.find((m) => m.id === selectedMentor);

    const mentorTaken = [...mentorBooked];
    const ownIndex = mentorTaken.indexOf(interview.date);
    if (ownIndex !== -1 && interview.mentorId === selectedMentor) {
      mentorTaken.splice(ownIndex, 1);
    }

    const myActive = interviews
      .filter((i) => i.id !== interview.id && ACTIVE_STATUSES.includes(i.status))
      .map((i) => i.date);

    const taken = takenTimes([...mentorTaken, ...myActive], selectedDate);

    return freeSlots(timeSlotsFor(mentor, selectedDate), taken);
  }

  async function handleReschedule() {
    if (!selectedDate || !selectedMentor || !selectedTime) {
      toast.error("Please complete all fields");
      return;
    }

    try {
      setRescheduling(true);

      const res = await fetch(`/api/interviews/${interview.id}/reschedule`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: zonedTimeToUtc(selectedDate, selectedTime),
          mentorId: selectedMentor,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        toast.error(json.error || "Failed to reschedule");
        return;
      }

      toast.success("Interview rescheduled");
      mutateMentorBooked();
      onRescheduled();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setRescheduling(false);
    }
  }

  const availableSlots = getAvailableSlots();

  return (
    <div className="modal-overlay">
      <div className="reschedule-modal">
        <h2>Reschedule Interview</h2>

        <div className="modal-group">
          <label>Select Date</label>

          <input
            type="date"
            min={addDays(getZonedParts(new Date()).dateString, 1)}
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>

        <div className="modal-group">
          <label>Select Mentor</label>

          <select
            value={selectedMentor}
            onChange={(e) => {
              setSelectedMentor(e.target.value);

              setSelectedTime("");
            }}
          >
            <option value="">Select Mentor</option>

            {mentorsAvailableOn(mentors, selectedDate).map((mentor) => (
              <option key={mentor.id} value={mentor.id}>
                {mentor.name}
              </option>
            ))}
          </select>
        </div>

        <div className="modal-group">
          <label>Select Time</label>

          <div className="slots-grid">
            {availableSlots.length === 0 ? (
              <p className="no-slots">No slots available</p>
            ) : (
              availableSlots.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  className={`slot-btn ${selectedTime === slot ? "active-slot" : ""}`}
                  onClick={() => setSelectedTime(slot)}
                >
                  {slot}
                </button>
              ))
            )}
          </div>
        </div>

        {selectedDate && selectedTime && (
          <p className="modal-selected">
            Selected:{" "}
            {formatDateTime(zonedTimeToUtc(selectedDate, selectedTime)).replace(", ", " • ")}
          </p>
        )}

        <div className="modal-actions">
          <button className="modal-cancel" onClick={onClose}>
            Close
          </button>

          <button className="modal-save" disabled={rescheduling} onClick={handleReschedule}>
            {rescheduling ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
