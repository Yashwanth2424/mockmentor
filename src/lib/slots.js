import { getZonedParts } from "./time.js";

export function dayOfWeek(dateString) {
  return new Date(`${dateString}T12:00:00`).getDay();
}

export function mentorsAvailableOn(mentors, dateString) {
  if (!dateString) {
    return mentors;
  }

  const day = dayOfWeek(dateString);

  return mentors.filter((mentor) => mentor.availability?.some((a) => Number(a.dayOfWeek) === day));
}

export function timeSlotsFor(mentor, dateString) {
  if (!mentor || !dateString) {
    return [];
  }

  const day = dayOfWeek(dateString);
  const availability = mentor.availability?.find((a) => Number(a.dayOfWeek) === day);

  if (!availability) {
    return [];
  }

  const slots = [];

  for (let hour = availability.startHour; hour < availability.endHour; hour++) {
    const hh = String(hour).padStart(2, "0");
    slots.push(`${hh}:00`, `${hh}:30`);
  }

  return slots;
}

export function takenTimes(dates, dateString) {
  return dates
    .map((date) => getZonedParts(new Date(date)))
    .filter((parts) => parts.dateString === dateString)
    .map((parts) => parts.time);
}

export function freeSlots(slots, taken) {
  return slots.filter((slot) => !taken.includes(slot));
}

export function formatSlotTime(time) {
  const [hour, minute] = time.split(":");
  const h = Number(hour);
  const ampm = h >= 12 ? "PM" : "AM";

  return `${String(h % 12 || 12).padStart(2, "0")}:${minute} ${ampm}`;
}

export function groupSlots(slots) {
  const groups = { Morning: [], Afternoon: [], Evening: [] };

  slots.forEach((slot) => {
    const hour = Number(slot.split(":")[0]);

    if (hour < 12) {
      groups.Morning.push(slot);
    } else if (hour < 17) {
      groups.Afternoon.push(slot);
    } else {
      groups.Evening.push(slot);
    }
  });

  return groups;
}
