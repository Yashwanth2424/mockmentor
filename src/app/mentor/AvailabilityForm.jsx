"use client";

import { useState } from "react";
import { toast } from "react-toastify";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function toFormState(rows) {
  const state = {};
  DAYS.forEach((_, index) => {
    const row = rows.find((r) => r.dayOfWeek === index);
    state[index] = row
      ? { start: String(row.startHour), end: String(row.endHour) }
      : { start: "", end: "" };
  });
  return state;
}

export default function AvailabilityForm({ initial, onSaved }) {
  const [availability, setAvailability] = useState(() => toFormState(initial));
  const [savingAvailability, setSavingAvailability] = useState(false);

  const hasValidAvailability = Object.values(availability).some(
    (slot) => slot.start !== "" && slot.end !== "" && Number(slot.start) < Number(slot.end),
  );

  async function saveAvailability() {
    const formatted = Object.entries(availability)
      .filter(([_, v]) => v.start !== "" && v.end !== "" && Number(v.start) < Number(v.end))
      .map(([day, v]) => ({
        dayOfWeek: parseInt(day),
        startHour: parseInt(v.start),
        endHour: parseInt(v.end),
      }));

    if (formatted.length === 0) {
      toast.error("Please select valid availability");
      return;
    }

    setSavingAvailability(true);

    try {
      const res = await fetch("/api/mentor/availability", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ availability: formatted }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        toast.error(json.error || "Failed to save availability");
        return;
      }

      toast.success("Availability saved");
      onSaved();
    } catch {
      toast.error("Server error");
    } finally {
      setSavingAvailability(false);
    }
  }

  return (
    <div className="availability-box">
      <h3>Set Weekly Availability</h3>

      {DAYS.map((day, index) => (
        <div key={index} className="availability-row">
          <span className="availability-day">{day}</span>

          <select
            value={availability[index].start}
            onChange={(e) =>
              setAvailability((prev) => ({
                ...prev,
                [index]: { ...prev[index], start: e.target.value },
              }))
            }
          >
            <option value="">Start</option>
            {[...Array(24)].map((_, i) => (
              <option key={i} value={i}>
                {i}:00
              </option>
            ))}
          </select>

          <select
            value={availability[index].end}
            onChange={(e) =>
              setAvailability((prev) => ({
                ...prev,
                [index]: { ...prev[index], end: e.target.value },
              }))
            }
          >
            <option value="">End</option>
            {[...Array(24)].map((_, i) => (
              <option key={i + 1} value={i + 1}>
                {i + 1}:00
              </option>
            ))}
          </select>
        </div>
      ))}

      <button
        onClick={saveAvailability}
        className="save-availability-button"
        disabled={!hasValidAvailability || savingAvailability}
      >
        {savingAvailability ? "Saving..." : "Save Availability"}
      </button>
    </div>
  );
}
